'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { VirusTotalResult, HuggingFaceResult } from '@/app/types'

interface AnalysisDetailsProps {
  details: {
    virusTotal: VirusTotalResult | null
    huggingFace: HuggingFaceResult | null
  }
}

export function AnalysisDetails({ details }: AnalysisDetailsProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* VirusTotal Results */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://www.virustotal.com/gui/images/favicon.png"
                alt="VirusTotal"
                className="h-5 w-5 mr-2"
              />
              VirusTotal Analysis
            </h3>
            {details.virusTotal && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {details.virusTotal.positives}/{details.virusTotal.total} detections
              </span>
            )}
          </div>
          
          {details.virusTotal ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`text-sm font-medium ${
                    details.virusTotal.status === 'clean' ? 'text-green-600' :
                    details.virusTotal.status === 'malicious' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {details.virusTotal.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Scan Date</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(details.virusTotal.scanDate).toLocaleDateString()}
                  </span>
                </div>
                
                {details.virusTotal.permalink && (
                  <a
                    href={details.virusTotal.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View full report →
                  </a>
                )}
              </div>
              
              {/* Engine Details (Expandable) */}
              {details.virusTotal.engines && Object.keys(details.virusTotal.engines).length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleSection('vt-engines')}
                    className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Detection Details</span>
                    {expandedSections.includes('vt-engines') ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.includes('vt-engines') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 max-h-64 overflow-y-auto space-y-1">
                          {Object.entries(details.virusTotal.engines)
                            .filter(([_, result]) => result.detected)
                            .map(([engine, result]) => (
                              <div
                                key={engine}
                                className="flex items-center justify-between py-1 px-2 text-xs bg-red-50 dark:bg-red-900/20 rounded"
                              >
                                <span className="font-medium">{engine}</span>
                                <span className="text-red-600 dark:text-red-400">
                                  {result.result || 'Detected'}
                                </span>
                              </div>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              VirusTotal analysis unavailable
            </p>
          )}
        </div>
      </div>
      
      {/* HuggingFace Results */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <span className="text-2xl mr-2">🤗</span>
              AI Analysis
            </h3>
            {details.huggingFace && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(details.huggingFace.score * 100)}% confidence
              </span>
            )}
          </div>
          
          {details.huggingFace ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Prediction</span>
                <span className={`text-sm font-medium ${
                  details.huggingFace.prediction === 'safe' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {details.huggingFace.prediction.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Model Label</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {details.huggingFace.label}
                </span>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Confidence Score</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round(details.huggingFace.score * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      details.huggingFace.prediction === 'safe' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${details.huggingFace.score * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI analysis unavailable
            </p>
          )}
        </div>
      </div>
    </div>
  )
}