import React from 'react'
import { SimpleLayout } from '@/components/layout/SimpleLayout'
import { RealSessionList } from '@/components/chat/RealSessionList'
import { RealChatView } from '@/components/chat/RealChatView'
import { DatePicker } from '@/components/chat/DatePicker'
import { ChatSummarySlider } from '@/components/chat/ChatSummarySlider'
import { useRealChats } from '@/hooks/useRealChats'

export const RealChats = () => {
  const clientId = 'cid-83f1d585a5e842249c1fd1f177c2dfac'
  
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

  return (
    <SimpleLayout>
      <ChatSummarySlider clientId={clientId} selectedDate={selectedDate} />
      {/* Left Panel - Date Picker and Session List */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        {/* Date Picker - Always visible */}
        <div className="p-4 bg-white border-r border-gray-200">
          <DatePicker 
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </div>
        
        {/* Session List */}
        <div className="flex-1 min-h-0">
          <RealSessionList
            sessions={sessions}
            selectedSession={selectedSession}
            onSessionSelect={handleSessionSelect}
            loading={loading}
            hasMore={hasMoreSessions}
            onLoadMore={loadMoreSessions}
            onRefresh={refresh}
            error={error}
            className="h-full border-r-0"
          />
        </div>
      </div>
      
      {/* Chat View */}
      <RealChatView
        messages={messages}
        selectedSession={selectedSession}
        loading={messagesLoading}
        hasMore={hasMoreMessages}
        onLoadMore={loadMoreMessages}
      />
    </SimpleLayout>
  )
}