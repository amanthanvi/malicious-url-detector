'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { validateURL } from '@/app/utils/url'
import toast from 'react-hot-toast'

interface URLAnalyzerProps {
  onAnalyze: (url: string) => void
  isAnalyzing: boolean
}

export function URLAnalyzer({ onAnalyze, isAnalyzing }: URLAnalyzerProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }
    
    if (!validateURL(url)) {
      setError('Please enter a valid URL')
      return
    }
    
    onAnalyze(url)
    toast.success('Analysis started!')
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter URL to analyze
          </label>
          <div className="relative">
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com or https://example.com"
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500"
              disabled={isAnalyzing}
            />
            <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center text-red-600 dark:text-red-400 text-sm"
            >
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {error}
            </motion.div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg
                   hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                   transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze URL'
          )}
        </button>
      </form>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Tip:</strong> We analyze URLs using multiple security services including VirusTotal and AI-based detection to provide comprehensive threat assessment.
        </p>
      </div>
    </motion.div>
  )
}