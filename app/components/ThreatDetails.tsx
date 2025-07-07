'use client'

import { ThreatInfo } from '@/app/types'
import { ShieldExclamationIcon, LightBulbIcon } from '@heroicons/react/24/outline'

interface ThreatDetailsProps {
  threatInfo: ThreatInfo
}

export function ThreatDetails({ threatInfo }: ThreatDetailsProps) {
  const getRiskLevelColor = () => {
    switch (threatInfo.riskLevel) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'low':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
    }
  }
  
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-start space-x-3">
        <ShieldExclamationIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 dark:text-white">Threat Categories:</span>
            <div className="flex flex-wrap gap-2">
              {threatInfo.category.map((cat, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 dark:text-white">Risk Level:</span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRiskLevelColor()}`}>
              {threatInfo.riskLevel.toUpperCase()}
            </span>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300">
            {threatInfo.description}
          </p>
        </div>
      </div>
      
      {threatInfo.recommendations.length > 0 && (
        <div className="flex items-start space-x-3">
          <LightBulbIcon className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-gray-900 dark:text-white block mb-2">
              Security Recommendations:
            </span>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {threatInfo.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}