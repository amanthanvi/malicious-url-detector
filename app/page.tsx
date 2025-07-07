'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { URLAnalyzer } from '@/app/components/URLAnalyzer'
import { ResultsDisplay } from '@/app/components/ResultsDisplay'
import { URLHistory } from '@/app/components/URLHistory'
import { BatchAnalyzer } from '@/app/components/BatchAnalyzer'
import { EducationalContent } from '@/app/components/EducationalContent'
import { Header } from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'
import { AnalysisResult, URLHistoryItem } from '@/app/types'
import { useLocalStorage } from '@/app/hooks/useLocalStorage'
import { BackgroundAnimation } from '@/app/components/BackgroundAnimation'

export default function Home() {
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [history, setHistory] = useLocalStorage<URLHistoryItem[]>('url-history', [])
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')
  
  const handleAnalysisComplete = (result: AnalysisResult) => {
    setCurrentResult(result)
    setIsAnalyzing(false)
    
    // Add to history
    const historyItem: URLHistoryItem = {
      url: result.url,
      timestamp: result.timestamp,
      status: result.status === 'error' ? 'suspicious' : result.status
    }
    
    setHistory(prev => {
      const filtered = prev.filter(item => item.url !== result.url)
      return [historyItem, ...filtered].slice(0, 50) // Keep last 50 items
    })
  }
  
  const handleHistorySelect = (url: string) => {
    // Re-analyze the URL
    setIsAnalyzing(true)
    analyzeURL(url)
  }
  
  const analyzeURL = async (url: string) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Analysis failed')
      }
      
      const result = await response.json()
      handleAnalysisComplete(result)
    } catch (error) {
      console.error('Analysis error:', error)
      handleAnalysisComplete({
        url,
        timestamp: new Date().toISOString(),
        status: 'error',
        summary: error instanceof Error ? error.message : 'Analysis failed',
        details: {
          virusTotal: null,
          huggingFace: null
        }
      })
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <BackgroundAnimation />
      <Header />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 gradient-text">
            URL Threat Analyzer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Advanced AI-powered protection against malicious websites
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 inline-flex">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'single'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Single URL
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'batch'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Batch Analysis
              </button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'single' ? (
              <motion.div
                key="single"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <URLAnalyzer
                  onAnalyze={(url) => {
                    setIsAnalyzing(true)
                    analyzeURL(url)
                  }}
                  isAnalyzing={isAnalyzing}
                />
              </motion.div>
            ) : (
              <motion.div
                key="batch"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BatchAnalyzer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {currentResult && activeTab === 'single' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto mb-12"
          >
            <ResultsDisplay result={currentResult} />
          </motion.div>
        )}
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EducationalContent />
          </div>
          <div>
            <URLHistory
              history={history}
              onSelect={handleHistorySelect}
              onClear={() => setHistory([])}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}