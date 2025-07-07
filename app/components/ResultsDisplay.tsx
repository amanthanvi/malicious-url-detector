'use client'

import { motion } from 'framer-motion'
import { AnalysisResult } from '@/app/types'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { formatUrl } from '@/app/utils/url'
import { ThreatDetails } from './ThreatDetails'
import { AnalysisDetails } from './AnalysisDetails'
import { ShareButton } from './ShareButton'

interface ResultsDisplayProps {
  result: AnalysisResult
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'safe':
        return <CheckCircleIcon className="h-16 w-16 text-green-500" />
      case 'malicious':
        return <XCircleIcon className="h-16 w-16 text-red-500" />
      case 'suspicious':
        return <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500" />
      default:
        return <InformationCircleIcon className="h-16 w-16 text-gray-500" />
    }
  }
  
  const getStatusColor = () => {
    switch (result.status) {
      case 'safe':
        return 'from-green-500 to-emerald-600'
      case 'malicious':
        return 'from-red-500 to-rose-600'
      case 'suspicious':
        return 'from-yellow-500 to-orange-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }
  
  const getStatusBgColor = () => {
    switch (result.status) {
      case 'safe':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'malicious':
        return 'bg-red-50 dark:bg-red-900/20'
      case 'suspicious':
        return 'bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20'
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Status Summary Card */}
      <div className={`rounded-2xl p-8 ${getStatusBgColor()}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {getStatusIcon()}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.status === 'safe' && 'URL is Safe'}
                {result.status === 'malicious' && 'Threat Detected'}
                {result.status === 'suspicious' && 'Suspicious URL'}
                {result.status === 'error' && 'Analysis Error'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {formatUrl(result.url)}
              </p>
            </div>
          </div>
          <ShareButton result={result} />
        </div>
        
        <div className={`h-2 rounded-full bg-gradient-to-r ${getStatusColor()} mb-6`} />
        
        <p className="text-lg text-gray-700 dark:text-gray-300">
          {result.summary}
        </p>
        
        {result.threatInfo && (
          <ThreatDetails threatInfo={result.threatInfo} />
        )}
      </div>
      
      {/* Detailed Analysis Results */}
      <AnalysisDetails details={result.details} />
      
      {/* Analysis Metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Analysis completed at {new Date(result.timestamp).toLocaleString()}
        </p>
      </div>
    </motion.div>
  )
}