import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Trash2, Save, XCircle, Loader2, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

export const KnowledgeBaseGaps = ({ gaps, onAnswerGap, onDeleteGap, loading, formatDate, hasMore, onLoadMore, onDeleteConfirm }) => {
  const [expandedGap, setExpandedGap] = useState(null)
  const [answerTexts, setAnswerTexts] = useState({}) // Store answer text per gap ID
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [showTooltip, setShowTooltip] = useState(null)
  const textareaRef = useRef(null)
  const questionsContainerRef = useRef(null)
  const tooltipRef = useRef(null)

  // Infinite scroll functionality - handled by questions container
  useEffect(() => {
    const questionsContainer = questionsContainerRef.current
    if (!questionsContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = questionsContainer
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

      if (isNearBottom && hasMore && !loading && onLoadMore) {
        onLoadMore()
      }
    }

    questionsContainer.addEventListener('scroll', handleScroll)
    return () => questionsContainer.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading, onLoadMore])

  // Click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(null)
      }
    }

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTooltip])

  const handleExpand = (gapId) => {
    if (expandedGap === gapId) {
      setExpandedGap(null)
    } else {
      setExpandedGap(gapId)
      // Focus textarea after expansion
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 100)
    }
  }

  const handleSubmit = async (gap) => {
    const currentAnswerText = answerTexts[gap.id] || ''
    if (!currentAnswerText.trim()) return
    
    try {
      setSubmitting(true)
      await onAnswerGap(gap.id, currentAnswerText.trim())
      setExpandedGap(null)
      // Remove the answer text for this gap after successful submission
      setAnswerTexts(prev => {
        const newTexts = { ...prev }
        delete newTexts[gap.id]
        return newTexts
      })
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setExpandedGap(null)
    // Keep the answer text when canceling - don't clear it
  }

  const handleDelete = (gap) => {
    if (onDeleteConfirm) {
      onDeleteConfirm(gap, async () => {
        try {
          setDeleting(gap.id)
          await onDeleteGap(gap.id)
          
          // Close expanded state if this gap was expanded
          if (expandedGap === gap.id) {
            setExpandedGap(null)
          }
          
          // Remove the answer text for this gap
          setAnswerTexts(prev => {
            const newTexts = { ...prev }
            delete newTexts[gap.id]
            return newTexts
          })
        } catch (error) {
          console.error('Failed to delete gap:', error)
        } finally {
          setDeleting(null)
        }
      })
    }
  }

  if (loading && gaps.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading knowledge gaps...</span>
        </div>
      </div>
    )
  }

  if (gaps.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-lg">No knowledge gaps found</p>
        <p className="text-gray-400 text-sm mt-1">All questions have been answered!</p>
      </div>
    )
  }

  return (
    <div 
      ref={questionsContainerRef} 
      className="space-y-2 overflow-y-auto scrollbar-hide h-full"
    >
        {gaps.map((gap) => {
          const isExpanded = expandedGap === gap.id
          
          return (
            <Card 
              key={gap.id}
              className={cn(
                "transition-all duration-200 border-2 group",
                isExpanded 
                  ? "border-blue-200 shadow-md" 
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              )}
            >
              <CardContent className="p-0">
                {/* Question Header */}
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleExpand(gap.id)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="text-sm text-gray-500 font-medium min-w-[60px]">
                      {formatDate(gap.created_at)}
                    </div>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium leading-relaxed">
                        {gap.question}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(gap)
                      }}
                      disabled={deleting === gap.id}
                    >
                      {deleting === gap.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <div className="p-2">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

              {/* Answer Form (Expanded) */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Your Answer
                        </label>
                        {gap.suggestions && (
                          <div ref={tooltipRef} className="relative ml-2">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                              onClick={() => setShowTooltip(showTooltip === gap.id ? null : gap.id)}
                            >
                              <Info className="w-2.5 h-2.5 text-blue-600" />
                            </button>
                            
                            {/* Beautiful Tooltip */}
                            {showTooltip === gap.id && (
                              <div className="absolute left-6 top-0 z-50 w-72 bg-white rounded-lg shadow-lg border border-gray-200 transform -translate-y-2">
                                <div className="relative">
                                  {/* Arrow */}
                                  <div className="absolute -left-2 top-3 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>
                                  <div className="absolute -left-2.5 top-3 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-200"></div>
                                  
                                  <div className="p-3">
                                    <div className="flex items-start space-x-2">
                                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                        <Info className="w-3 h-3 text-blue-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                                          Suggestion
                                        </h4>
                                        <div className="max-h-32 overflow-y-auto text-sm text-gray-600 leading-relaxed scrollbar-hide">
                                          {gap.suggestions.split('\n').map((line, index) => (
                                            <p key={index} className={index > 0 ? 'mt-2' : ''}>
                                              {line.trim().startsWith('-') ? (
                                                <span className="flex items-start">
                                                  <span className="mr-2">•</span>
                                                  <span>{line.trim().substring(1).trim()}</span>
                                                </span>
                                              ) : (
                                                line
                                              )}
                                            </p>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <textarea
                        ref={textareaRef}
                        value={answerTexts[gap.id] || ''}
                        onChange={(e) => setAnswerTexts(prev => ({
                          ...prev,
                          [gap.id]: e.target.value
                        }))}
                        placeholder="Provide a comprehensive answer to this question..."
                        className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm leading-relaxed"
                        disabled={submitting}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={submitting}
                        className="flex items-center space-x-2"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Cancel</span>
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSubmit(gap)}
                        disabled={submitting || !(answerTexts[gap.id] || '').trim()}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Submit</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          )
        })}
        
        {/* Infinite Scroll Loading Indicator */}
        {loading && hasMore && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading more questions...</span>
            </div>
          </div>
        )}
        
        {/* End of list indicator */}
        {!hasMore && gaps.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400">No more questions to load</p>
          </div>
        )}
    </div>
  )
}