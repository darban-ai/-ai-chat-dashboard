import React, { useRef, useEffect } from 'react'
import { Bot, User, ChevronDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { dateUtils } from '@/utils/dateUtils'
import { cn } from '@/utils/cn'

export const RealChatView = ({ 
  messages = [], 
  selectedSession, 
  loading = false,
  hasMore = false,
  onLoadMore,
  className 
}) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (loading && messages.length === 0) {
    return (
      <div className={cn('flex-1 bg-gray-50 flex items-center justify-center', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (!selectedSession) {
    return (
      <div className={cn('flex-1 bg-gray-50 flex items-center justify-center', className)}>
        <div className="text-center">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a session
          </h3>
          <p className="text-gray-500">
            Choose a session from the list to view the conversation history.
          </p>
        </div>
      </div>
    )
  }

  if (messages.length === 0 && !loading) {
    return (
      <div className={cn('flex-1 bg-gray-50 flex flex-col', className)}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {selectedSession.customer_id?.charAt(selectedSession.customer_id.indexOf('-') + 1)?.toUpperCase() || 'S'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Session {selectedSession.id?.split('-')[1]?.substring(0, 8) || 'Unknown'}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedSession.created_at && dateUtils.formatDateTime(selectedSession.created_at)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages</h3>
            <p className="text-gray-500">
              This session doesn't have any messages yet.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex-1 bg-gray-50 flex flex-col', className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {selectedSession.customer_id?.charAt(selectedSession.customer_id.indexOf('-') + 1)?.toUpperCase() || 'S'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Session {selectedSession.id?.split('-')[1]?.substring(0, 8) || 'Unknown'}
              </h2>
              <p className="text-sm text-gray-500">
                Customer: {selectedSession.customer_id?.split('-')[1]?.substring(0, 8) || 'Unknown'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-900 font-medium">
              {selectedSession.created_at && dateUtils.getSmartDate(selectedSession.created_at)}
            </p>
            <p className="text-xs text-gray-500">
              {messages.length} messages
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Load More Button at top */}
        {hasMore && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={loading}
              className="mb-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2 rotate-180" />
                  Load Earlier Messages
                </>
              )}
            </Button>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === 'user'
          const isBot = message.role === 'assistant'
          
          return (
            <div
              key={message.id || index}
              className={cn(
                'flex space-x-3',
                isUser && 'flex-row-reverse space-x-reverse'
              )}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {isBot ? (
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Message bubble */}
              <div className={cn(
                'flex-1 max-w-xs lg:max-w-2xl',
                isUser && 'flex justify-end'
              )}>
                <div className={cn(
                  'px-4 py-2 rounded-2xl shadow-sm',
                  isUser 
                    ? 'bg-teal-500 text-white rounded-br-md' 
                    : 'bg-white border border-gray-200 rounded-bl-md'
                )}>
                  {/* Message content */}
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {typeof message.content === 'string' 
                      ? message.content 
                      : JSON.stringify(message.content, null, 2)
                    }
                  </div>

                  {/* Timestamp */}
                  <div className={cn(
                    'text-xs mt-1',
                    isUser ? 'text-teal-100' : 'text-gray-500'
                  )}>
                    {dateUtils.formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}