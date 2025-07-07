'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AcademicCapIcon, ShieldCheckIcon, ExclamationCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

const educationalTopics = [
  {
    id: 'phishing',
    title: 'Phishing Attacks',
    icon: ExclamationCircleIcon,
    color: 'text-red-600',
    content: [
      {
        subtitle: 'What is Phishing?',
        text: 'Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information like passwords, credit card numbers, or personal data.'
      },
      {
        subtitle: 'Common Signs',
        list: [
          'Urgent or threatening language',
          'Requests for sensitive information',
          'Suspicious sender addresses',
          'Poor grammar and spelling',
          'Generic greetings like "Dear Customer"'
        ]
      },
      {
        subtitle: 'Protection Tips',
        list: [
          'Verify sender identity before clicking links',
          'Check URL spelling carefully',
          'Look for HTTPS and padlock icon',
          'Never provide passwords via email',
          'Use two-factor authentication'
        ]
      }
    ]
  },
  {
    id: 'malware',
    title: 'Malware Distribution',
    icon: ShieldCheckIcon,
    color: 'text-purple-600',
    content: [
      {
        subtitle: 'Types of Malware',
        text: 'Malicious software includes viruses, trojans, ransomware, spyware, and adware that can damage your device or steal information.'
      },
      {
        subtitle: 'Distribution Methods',
        list: [
          'Infected email attachments',
          'Drive-by downloads from compromised websites',
          'Fake software updates',
          'Malicious ads (malvertising)',
          'USB devices and removable media'
        ]
      },
      {
        subtitle: 'Prevention Strategies',
        list: [
          'Keep software and OS updated',
          'Use reputable antivirus software',
          'Avoid downloading from unknown sources',
          'Be cautious with email attachments',
          'Regular backups of important data'
        ]
      }
    ]
  },
  {
    id: 'urlsafety',
    title: 'URL Safety Tips',
    icon: LockClosedIcon,
    color: 'text-green-600',
    content: [
      {
        subtitle: 'How to Identify Safe URLs',
        text: 'Learning to recognize safe URLs is crucial for online security. Look for these indicators of legitimate websites.'
      },
      {
        subtitle: 'Safe URL Characteristics',
        list: [
          'HTTPS protocol (not just HTTP)',
          'Correct spelling of domain names',
          'Valid SSL certificates',
          'Professional design and content',
          'Contact information and privacy policy'
        ]
      },
      {
        subtitle: 'Red Flags to Avoid',
        list: [
          'Shortened URLs from unknown sources',
          'Misspelled variations of popular sites',
          'Excessive pop-ups or redirects',
          'Requests for immediate action',
          'Too-good-to-be-true offers'
        ]
      }
    ]
  }
]

export function EducationalContent() {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  
  const toggleTopic = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId)
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <AcademicCapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Learn About Online Threats
        </h3>
      </div>
      
      <div className="space-y-3">
        {educationalTopics.map((topic) => {
          const Icon = topic.icon
          const isExpanded = expandedTopic === topic.id
          
          return (
            <div
              key={topic.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleTopic(topic.id)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${topic.color}`} />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {topic.title}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                      {topic.content.map((section, index) => (
                        <div key={index}>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {section.subtitle}
                          </h4>
                          {section.text && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {section.text}
                            </p>
                          )}
                          {section.list && (
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              {section.list.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Remember:</strong> When in doubt, don&apos;t click! Use our analyzer to check any suspicious URLs before visiting them.
        </p>
      </div>
    </div>
  )
}