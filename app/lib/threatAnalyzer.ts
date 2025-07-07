import { VirusTotalResult, HuggingFaceResult, ThreatInfo } from '@/app/types'

export function analyzeThreat(
  vtResult: VirusTotalResult | null,
  hfResult: HuggingFaceResult | null
): ThreatInfo {
  const categories: string[] = []
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  const recommendations: string[] = []
  
  // Analyze VirusTotal results
  if (vtResult) {
    if (vtResult.positives > 10) {
      riskLevel = 'critical'
      categories.push('Widely Recognized Threat')
    } else if (vtResult.positives > 5) {
      riskLevel = 'high'
      categories.push('Known Malicious Site')
    } else if (vtResult.positives > 0) {
      riskLevel = 'medium'
      categories.push('Suspicious Activity Detected')
    }
    
    // Extract threat categories from engines
    if (vtResult.engines) {
      const detectedEngines = Object.entries(vtResult.engines)
        .filter(([_, result]) => result.detected)
        .map(([engine, result]) => result.result)
        .filter((result): result is string => result !== null)
      
      if (detectedEngines.some(r => r.toLowerCase().includes('phishing'))) {
        categories.push('Phishing')
        recommendations.push('This site may attempt to steal your personal information')
      }
      if (detectedEngines.some(r => r.toLowerCase().includes('malware'))) {
        categories.push('Malware Distribution')
        recommendations.push('This site may contain malicious software')
      }
      if (detectedEngines.some(r => r.toLowerCase().includes('trojan'))) {
        categories.push('Trojan')
        recommendations.push('This site may install harmful programs on your device')
      }
    }
  }
  
  // Analyze HuggingFace results
  if (hfResult && hfResult.prediction === 'malicious') {
    if (hfResult.score > 0.9) {
      if (riskLevel === 'low') riskLevel = 'high'
      categories.push('AI-Detected Threat')
    } else if (hfResult.score > 0.7) {
      if (riskLevel === 'low') riskLevel = 'medium'
      categories.push('Potential AI-Detected Threat')
    }
  }
  
  // Generate description
  const description = generateThreatDescription(categories, vtResult, hfResult)
  
  // Add general recommendations
  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('Do not visit this website')
    recommendations.push('If you have visited this site, scan your device for malware')
    recommendations.push('Change passwords if you entered any on this site')
  } else if (riskLevel === 'medium') {
    recommendations.push('Exercise extreme caution if visiting this site')
    recommendations.push('Avoid entering personal information')
    recommendations.push('Ensure your antivirus is up to date')
  }
  
  return {
    category: categories.length > 0 ? categories : ['Unknown Threat'],
    description,
    riskLevel,
    recommendations: recommendations.length > 0 ? recommendations : ['Exercise caution when visiting this site']
  }
}

function generateThreatDescription(
  categories: string[],
  vtResult: VirusTotalResult | null,
  hfResult: HuggingFaceResult | null
): string {
  let description = 'This URL has been flagged as potentially dangerous. '
  
  if (categories.includes('Phishing')) {
    description += 'It appears to be a phishing site designed to steal credentials. '
  }
  if (categories.includes('Malware Distribution')) {
    description += 'It may distribute malware or malicious software. '
  }
  if (categories.includes('Trojan')) {
    description += 'It may contain trojan software that can harm your device. '
  }
  
  if (vtResult && vtResult.positives > 0) {
    description += `${vtResult.positives} security vendors have flagged this URL. `
  }
  
  if (hfResult && hfResult.prediction === 'malicious') {
    description += `AI analysis indicates a ${Math.round(hfResult.score * 100)}% probability of malicious intent. `
  }
  
  return description.trim()
}