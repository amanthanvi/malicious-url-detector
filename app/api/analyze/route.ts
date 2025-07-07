import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResult, VirusTotalResult, HuggingFaceResult, ThreatInfo } from '@/app/types'
import { validateURL, addHttpScheme } from '@/app/utils/url'
import { getCache, setCache } from '@/app/lib/cache'
import { analyzeThreat } from '@/app/lib/threatAnalyzer'

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY

if (!VIRUSTOTAL_API_KEY || !HUGGINGFACE_API_KEY) {
  console.error('Missing API keys. Please set VIRUSTOTAL_API_KEY and HUGGINGFACE_API_KEY environment variables.')
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    
    // Validate URL
    if (!validateURL(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }
    
    const normalizedUrl = addHttpScheme(url)
    
    // Check cache first
    const cached = await getCache(normalizedUrl)
    if (cached) {
      return NextResponse.json(cached)
    }
    
    // Perform parallel analysis
    const [virusTotalResult, huggingFaceResult] = await Promise.allSettled([
      analyzeWithVirusTotal(normalizedUrl),
      analyzeWithHuggingFace(normalizedUrl)
    ])
    
    // Process results
    const vtResult = virusTotalResult.status === 'fulfilled' ? virusTotalResult.value : null
    const hfResult = huggingFaceResult.status === 'fulfilled' ? huggingFaceResult.value : null
    
    // Determine overall status
    const status = determineOverallStatus(vtResult, hfResult)
    
    // Get threat information
    const threatInfo = status !== 'safe' ? analyzeThreat(vtResult, hfResult) : undefined
    
    const result: AnalysisResult = {
      url: normalizedUrl,
      timestamp: new Date().toISOString(),
      status,
      summary: generateSummary(status, vtResult, hfResult),
      details: {
        virusTotal: vtResult,
        huggingFace: hfResult
      },
      threatInfo
    }
    
    // Cache the result
    await setCache(normalizedUrl, result)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze URL' },
      { status: 500 }
    )
  }
}

async function analyzeWithVirusTotal(url: string): Promise<VirusTotalResult | null> {
  if (!VIRUSTOTAL_API_KEY) {
    throw new Error('VirusTotal API key not configured')
  }
  
  try {
    // Submit URL for scanning
    const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ url })
    })
    
    if (!submitResponse.ok) {
      throw new Error(`VirusTotal API error: ${submitResponse.status}`)
    }
    
    const submitData = await submitResponse.json()
    const analysisId = submitData.data.id
    
    // Poll for results
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 15000)) // Wait 15 seconds
      
      const resultResponse = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: { 'x-apikey': VIRUSTOTAL_API_KEY }
        }
      )
      
      if (!resultResponse.ok) {
        throw new Error(`VirusTotal API error: ${resultResponse.status}`)
      }
      
      const resultData = await resultResponse.json()
      const stats = resultData.data.attributes.stats
      
      if (resultData.data.attributes.status === 'completed') {
        const malicious = stats.malicious || 0
        const suspicious = stats.suspicious || 0
        const total = Object.values(stats).reduce((a: number, b: any) => a + b, 0) as number
        
        return {
          status: malicious > 0 ? 'malicious' : suspicious > 0 ? 'suspicious' : 'clean',
          positives: malicious + suspicious,
          total,
          scanDate: new Date().toISOString(),
          permalink: `https://www.virustotal.com/gui/url/${analysisId}`,
          engines: resultData.data.attributes.results || {}
        }
      }
      
      attempts++
    }
    
    throw new Error('VirusTotal analysis timeout')
  } catch (error) {
    console.error('VirusTotal error:', error)
    return null
  }
}

async function analyzeWithHuggingFace(url: string): Promise<HuggingFaceResult | null> {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('HuggingFace API key not configured')
  }
  
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/r3ddkahili/final-complete-malicious-url-model',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: url })
      }
    )
    
    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Handle the response - the model returns an array of results
    if (Array.isArray(data) && data.length > 0) {
      // Get the top prediction
      const predictions = Array.isArray(data[0]) ? data[0] : data
      const topPrediction = predictions.reduce((prev: any, current: any) => 
        (current.score > prev.score) ? current : prev
      )
      
      return {
        label: topPrediction.label || 'UNKNOWN',
        score: topPrediction.score || 0,
        prediction: topPrediction.label?.toLowerCase().includes('malicious') || 
                   topPrediction.label?.toLowerCase().includes('phishing') ||
                   topPrediction.label?.toLowerCase().includes('defacement') ? 'malicious' : 'safe'
      }
    }
    
    // Fallback for unexpected response format
    const result = data[0] || data
    const label = result.label || 'UNKNOWN'
    const score = result.score || 0
    
    return {
      label,
      score,
      prediction: label.toLowerCase().includes('malicious') || 
                 label.toLowerCase().includes('phishing') ||
                 label.toLowerCase().includes('defacement') ? 'malicious' : 'safe'
    }
  } catch (error) {
    console.error('HuggingFace error:', error)
    return null
  }
}

function determineOverallStatus(
  vtResult: VirusTotalResult | null,
  hfResult: HuggingFaceResult | null
): 'safe' | 'suspicious' | 'malicious' | 'error' {
  if (!vtResult && !hfResult) return 'error'
  
  const vtMalicious = vtResult?.status === 'malicious'
  const vtSuspicious = vtResult?.status === 'suspicious'
  const hfMalicious = hfResult?.prediction === 'malicious'
  
  if (vtMalicious || (hfMalicious && hfResult.score > 0.8)) {
    return 'malicious'
  }
  
  if (vtSuspicious || (hfMalicious && hfResult.score > 0.5)) {
    return 'suspicious'
  }
  
  return 'safe'
}

function generateSummary(
  status: string,
  vtResult: VirusTotalResult | null,
  hfResult: HuggingFaceResult | null
): string {
  switch (status) {
    case 'malicious':
      return 'This URL has been identified as malicious. Do not visit this website.'
    case 'suspicious':
      return 'This URL shows suspicious characteristics. Exercise caution when visiting.'
    case 'safe':
      return 'No threats detected. This URL appears to be safe.'
    case 'error':
      return 'Unable to complete analysis. Please try again later.'
    default:
      return 'Analysis complete.'
  }
}