export interface AnalysisResult {
  url: string
  timestamp: string
  status: 'safe' | 'suspicious' | 'malicious' | 'error'
  summary: string
  details: {
    virusTotal: VirusTotalResult | null
    huggingFace: HuggingFaceResult | null
  }
  threatInfo?: ThreatInfo
}

export interface VirusTotalResult {
  status: 'clean' | 'malicious' | 'suspicious' | 'undetected'
  positives: number
  total: number
  scanDate: string
  permalink: string
  engines: Record<string, {
    detected: boolean
    result: string | null
  }>
}

export interface HuggingFaceResult {
  label: string
  score: number
  prediction: 'safe' | 'malicious'
}

export interface ThreatInfo {
  category: string[]
  description: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
}

export interface URLHistoryItem {
  url: string
  timestamp: string
  status: 'safe' | 'suspicious' | 'malicious'
}

export interface BatchAnalysisRequest {
  urls: string[]
}

export interface AnalysisProgress {
  current: number
  total: number
  currentUrl: string
  status: 'analyzing' | 'completed' | 'error'
}