'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ClockIcon, TrashIcon } from '@heroicons/react/24/outline'
import { URLHistoryItem } from '@/app/types'
import { formatUrl } from '@/app/utils/url'

interface URLHistoryProps {
  history: URLHistoryItem[]
  onSelect: (url: string) => void
  onClear: () => void
}

export function URLHistory({ history, onSelect, onClear }: URLHistoryProps) {
  const getStatusColor = (status: URLHistoryItem['status']) => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'malicious':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'suspicious':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    }
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <ClockIcon className="h-5 w-5 mr-2" />
          Recent Analyses
        </h3>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Clear
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {history.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 dark:text-gray-400 text-center py-8"
          >
            No recent analyses
          </motion.p>
        ) : (
          <motion.div className="space-y-2 max-h-96 overflow-y-auto">
            {history.map((item, index) => (
              <motion.button
                key={`${item.url}-${item.timestamp}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(item.url)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {formatUrl(item.url)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}