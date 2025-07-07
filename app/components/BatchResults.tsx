'use client'

import { motion } from 'framer-motion'
import { AnalysisResult } from '@/app/types'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { formatUrl } from '@/app/utils/url'
import { useState } from 'react'
import { ResultsDisplay } from './ResultsDisplay'
import { ChevronRightIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'

interface BatchResultsProps {
  results: AnalysisResult[]
}

export function BatchResults({ results }: BatchResultsProps) {
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null)
  
  const getStatusIcon = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'safe':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'malicious':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'suspicious':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />
    }
  }
  
  const getStatusColor = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'safe':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20'
      case 'malicious':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'suspicious':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }
  
  const exportResults = () => {
    const csv = [
      ['URL', 'Status', 'Summary', 'VirusTotal Detections', 'AI Prediction', 'Timestamp'],
      ...results.map(r => [
        r.url,
        r.status,
        r.summary,
        r.details.virusTotal ? `${r.details.virusTotal.positives}/${r.details.virusTotal.total}` : 'N/A',
        r.details.huggingFace?.prediction || 'N/A',
        r.timestamp
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `url-analysis-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const summary = {
    safe: results.filter(r => r.status === 'safe').length,
    malicious: results.filter(r => r.status === 'malicious').length,
    suspicious: results.filter(r => r.status === 'suspicious').length,
    error: results.filter(r => r.status === 'error').length
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Batch Analysis Summary
          </h3>
          <button
            onClick={exportResults}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Export CSV</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.safe}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Safe</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.malicious}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Malicious</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.suspicious}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Suspicious</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{summary.error}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
          </div>
        </div>
      </div>
      
      {/* Results List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {results.map((result, index) => (
            <motion.button
              key={`${result.url}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedResult(result)}
              className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {formatUrl(result.url)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {result.summary}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Selected Result Details */}
      {selectedResult && (
        <ResultsDisplay result={selectedResult} />
      )}
    </motion.div>
  )
}