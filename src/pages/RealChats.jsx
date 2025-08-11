import React, { useState, useEffect } from 'react'
import { SimpleLayout } from '@/components/layout/SimpleLayout'
import { RealSessionList } from '@/components/chat/RealSessionList'
import { RealChatView } from '@/components/chat/RealChatView'
import { DatePicker } from '@/components/chat/DatePicker'
import { ChatSummarySlider } from '@/components/chat/ChatSummarySlider'
import { ChatSummaryButton } from '@/components/chat/ChatSummaryButton'
import { useRealChats } from '@/hooks/useRealChats'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import apiService from '@/services/apiService'

export const RealChats = () => {
  const clientId = 'cid-83f1d585a5e842249c1fd1f177c2dfac'
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [hasValidSummary, setHasValidSummary] = useState(false)
  const [isLeftPanelExpanded, setIsLeftPanelExpanded] = useState(true)
  
  const {
    sessions,
    messages,
    selectedSession,
    selectedDate,
    loading,
    messagesLoading,
    error,
    handleSessionSelect,
    handleDateChange,
    loadMoreSessions,
    loadMoreMessages,
    refresh,
    hasMoreSessions,
    hasMoreMessages,
  } = useRealChats()

  // Check if summary exists for selected date
  useEffect(() => {
    const checkSummaryForSelectedDate = async () => {
      if (!clientId || !selectedDate) {
        setHasValidSummary(false)
        setIsSummaryOpen(false)
        return
      }
      
      try {
        const response = await apiService.getChatSummary(clientId)
        
        if (response && response.summaries && Array.isArray(response.summaries) && response.summaries.length > 0) {
          // Find summary for the selected date
          const matchingSummary = response.summaries.find(summary => summary.summary_date === selectedDate)
          
          if (matchingSummary) {
            setHasValidSummary(true)
            setIsSummaryOpen(true) // Auto-open if summary exists for selected date
          } else {
            setHasValidSummary(false)
            setIsSummaryOpen(false)
          }
        } else {
          setHasValidSummary(false)
          setIsSummaryOpen(false)
        }
      } catch (err) {
        setHasValidSummary(false)
        setIsSummaryOpen(false)
      }
    }

    checkSummaryForSelectedDate()
  }, [clientId, selectedDate])

  const handleSummaryToggle = () => {
    setIsSummaryOpen(!isSummaryOpen)
  }

  // Auto-close summary when session is selected
  const handleSessionSelectWithSummaryClose = (session) => {
    setIsSummaryOpen(false)
    handleSessionSelect(session)
  }

  // Auto-close summary when date is changed
  const handleDateChangeWithSummaryClose = (date) => {
    setIsSummaryOpen(false)
    handleDateChange(date)
  }

  return (
    <SimpleLayout>
      {/* Left Panel Container with Toggle */}
      <div className="relative flex">
        {/* Left Panel - Date Picker and Session List */}
        <div className={`${isLeftPanelExpanded ? 'w-80' : 'w-16'} flex-shrink-0 flex flex-col transition-all duration-300`}>

          {isLeftPanelExpanded ? (
            <>
              {/* Date Picker - Always visible when expanded */}
              <div className="p-3 bg-white border-r border-gray-200">
                <DatePicker 
                  selectedDate={selectedDate}
                  onDateChange={handleDateChangeWithSummaryClose}
                />
                
                {/* Chat Summary Button */}
                <div className="mt-2">
                  <ChatSummaryButton 
                    hasValidSummary={hasValidSummary}
                    onClick={handleSummaryToggle}
                    isOpen={isSummaryOpen}
                  />
                </div>
              </div>
              
              {/* Session List */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full overflow-y-scroll scrollbar-hide">
                  <RealSessionList
                    sessions={sessions}
                    selectedSession={selectedSession}
                    onSessionSelect={handleSessionSelectWithSummaryClose}
                    loading={loading}
                    hasMore={hasMoreSessions}
                    onLoadMore={loadMoreSessions}
                    onRefresh={refresh}
                    error={error}
                    className="border-r-0"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Collapsed state - minimal icons */
            <div className="w-16 bg-white border-r border-gray-200 h-full flex flex-col items-center py-4 space-y-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">
                  {sessions.length}
                </span>
              </div>
              {hasValidSummary && (
                <button
                  onClick={handleSummaryToggle}
                  className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                  title="Chat Summary"
                >
                  <span className="text-xs text-white font-bold">S</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Expand/Collapse Toggle Button - Outside the panel */}
        <button
          onClick={() => setIsLeftPanelExpanded(!isLeftPanelExpanded)}
          className="w-6 h-12 bg-white border border-gray-200 rounded-r-md shadow-sm hover:bg-gray-50 flex items-center justify-center transition-colors self-center"
          title={isLeftPanelExpanded ? "Collapse panel" : "Expand panel"}
        >
          {isLeftPanelExpanded ? (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>
      
      {/* Main Content Area - Chat View or Summary */}
      {isSummaryOpen ? (
        <ChatSummarySlider 
          clientId={clientId} 
          selectedDate={selectedDate} 
          onToggle={handleSummaryToggle} 
        />
      ) : (
        <RealChatView
          messages={messages}
          selectedSession={selectedSession}
          loading={messagesLoading}
          hasMore={hasMoreMessages}
          onLoadMore={loadMoreMessages}
        />
      )}
    </SimpleLayout>
  )
}