'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DocumentTextIcon, PlayIcon } from '@heroicons/react/24/outline'
import { validateURL } from '@/app/utils/url'
import toast from 'react-hot-toast'
import { BatchResults } from './BatchResults'
import { AnalysisResult } from '@/app/types'

export function BatchAnalyzer() {
  const [urls, setUrls] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  
  const handleAnalyze = async () => {
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0)
    
    // Validate URLs
    const invalidUrls = urlList.filter(url => !validateURL(url))
    if (invalidUrls.length > 0) {
      toast.error(`Invalid URLs: ${invalidUrls.join(', ')}`)
      return
    }
    
    if (urlList.length === 0) {
      toast.error('Please enter at least one URL')
      return
    }
    
    if (urlList.length > 10) {
      toast.error('Maximum 10 URLs allowed per batch')
      return
    }
    
    setIsAnalyzing(true)
    setResults([])
    setProgress({ current: 0, total: urlList.length })
    
    const batchResults: AnalysisResult[] = []
    
    for (let i = 0; i < urlList.length; i++) {
      setProgress({ current: i + 1, total: urlList.length })
      
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlList[i] })
        })
        
        if (response.ok) {
          const result = await response.json()
          batchResults.push(result)
          setResults([...batchResults])
        } else {
          const error = await response.json()
          batchResults.push({
            url: urlList[i],
            timestamp: new Date().toISOString(),
            status: 'error',
            summary: error.error || 'Analysis failed',
            details: { virusTotal: null, huggingFace: null }
          })
          setResults([...batchResults])
        }
      } catch (error) {
        batchResults.push({
          url: urlList[i],
          timestamp: new Date().toISOString(),
          status: 'error',
          summary: 'Network error',
          details: { virusTotal: null, huggingFace: null }
        })
        setResults([...batchResults])
      }
    }
    
    setIsAnalyzing(false)
    toast.success('Batch analysis complete!')
  }
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="urls" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter URLs (one per line, max 10)
            </label>
            <textarea
              id="urls"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="example.com\nsuspicious-site.net\nphishing-test.org"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500
                       resize-none"
              rows={6}
              disabled={isAnalyzing}
            />
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || urls.trim().length === 0}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg
                     hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                     flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing {progress.current}/{progress.total}...</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5" />
                <span>Start Batch Analysis</span>
              </>
            )}
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Batch Analysis:</strong> Analyze multiple URLs at once. Each URL will be checked sequentially to ensure accurate results.
            </p>
          </div>
        </div>
      </motion.div>
      
      {results.length > 0 && (
        <BatchResults results={results} />
      )}
    </div>
  )
}