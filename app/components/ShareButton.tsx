'use client'

import { useState } from 'react'
import { ShareIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import { AnalysisResult } from '@/app/types'
import toast from 'react-hot-toast'

interface ShareButtonProps {
  result: AnalysisResult
}

export function ShareButton({ result }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  
  const shareData = {
    title: 'URL Threat Analysis Result',
    text: `URL: ${result.url}\nStatus: ${result.status}\nSummary: ${result.summary}`,
    url: window.location.href
  }
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('Shared successfully!')
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    } else {
      handleCopy()
    }
  }
  
  const handleCopy = () => {
    const text = `URL Threat Analysis Result\n\nURL: ${result.url}\nStatus: ${result.status}\nSummary: ${result.summary}\n\nAnalyzed at: ${window.location.href}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleShare}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title="Share results"
      >
        <ShareIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </button>
      
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title="Copy to clipboard"
      >
        {copied ? (
          <CheckIcon className="h-5 w-5 text-green-600" />
        ) : (
          <ClipboardDocumentIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>
    </div>
  )
}