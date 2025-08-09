import React, { useState, useEffect } from 'react'
import { X, FileText, Calendar } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/utils/cn'
import apiService from '@/services/apiService'

export const ChatSummarySlider = ({ clientId, selectedDate }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [showIcon, setShowIcon] = useState(false)

  const fetchChatSummary = async () => {
    if (!clientId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiService.getChatSummary(clientId)
      setSummary(response)
    } catch (err) {
      if (err.status === 404) {
        setError('No chat summaries available. Start chatting to generate daily summaries!')
      } else {
        setError(`Failed to load chat summary: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = () => {
    if (!isOpen && !summary && !error) {
      fetchChatSummary()
    }
    setIsOpen(!isOpen)
  }

  const formatDate = (dateString) => {
    const summaryDate = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    // Reset time to compare just the date
    const summaryDateOnly = new Date(summaryDate.getFullYear(), summaryDate.getMonth(), summaryDate.getDate())
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const yesterdayDateOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
    
    if (summaryDateOnly.getTime() === todayDateOnly.getTime()) {
      return 'Today'
    } else if (summaryDateOnly.getTime() === yesterdayDateOnly.getTime()) {
      return 'Yesterday'
    } else {
      return summaryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }


  // Check if summary date matches selected date
  useEffect(() => {
    const checkSummaryForSelectedDate = async () => {
      if (!clientId || !selectedDate) {
        setShowIcon(false)
        return
      }
      
      try {
        const response = await apiService.getChatSummary(clientId)
        
        if (response && response.created_at) {
          // Get the date part of the summary (YYYY-MM-DD format)
          const summaryDate = new Date(response.created_at).toISOString().split('T')[0]
          
          // Compare with selected date
          const datesMatch = summaryDate === selectedDate
          setShowIcon(datesMatch)
        } else {
          setShowIcon(false)
        }
      } catch (err) {
        setShowIcon(false)
      }
    }

    checkSummaryForSelectedDate()
  }, [clientId, selectedDate])

  // Don't render icon if it's not for today
  if (!showIcon) {
    return null
  }

  return (
    <>
      {/* Toggle Button - positioned at the right edge of session list panel */}
      <div className="absolute left-96 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={handleToggle}
          className={cn(
            'w-8 h-16 bg-white border border-gray-200 rounded-r-lg shadow-lg',
            'flex items-center justify-center transition-all duration-200',
            'hover:bg-gray-50 hover:border-gray-300',
            isOpen && 'opacity-0 pointer-events-none'
          )}
          title="Chat Summary"
        >
          <FileText className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Slider Panel - full width overlay */}
      <div
        className={cn(
          'fixed left-0 top-0 h-screen w-full bg-white shadow-2xl z-30',
          'transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Daily Summary</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-full bg-gray-50">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Loading summary...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-12 px-6">
              <div className="bg-red-50 rounded-lg p-6">
                <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 text-sm mb-4 font-medium">{error}</p>
                <button
                  onClick={fetchChatSummary}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {summary && (
            <div className="p-6">
              {/* Date Header Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    {formatDate(summary.created_at)}
                  </span>
                </div>
              </div>

              {/* Summary Content Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                    Daily Summary
                  </span>
                </div>
                <div className="prose prose-gray prose-sm max-w-none text-gray-700 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 mt-5">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-medium text-gray-900 mb-2 mt-4">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-700 mb-1">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-gray-700">{children}</em>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">{children}</blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
                      ),
                    }}
                  >
                    {summary.summary}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && !summary && (
            <div className="text-center py-12 px-6">
              <div className="bg-gray-100 rounded-lg p-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-base font-medium mb-2">
                  No Summary Available
                </p>
                <p className="text-gray-500 text-sm">
                  Chat summaries will appear here when available for the selected date
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}