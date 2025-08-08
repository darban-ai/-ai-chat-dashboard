import React, { useRef, useEffect } from 'react'
import { Bot, User, ChevronDown, RefreshCw, ExternalLink, DollarSign, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { dateUtils } from '@/utils/dateUtils'
import { cn } from '@/utils/cn'
import ReactMarkdown from 'react-markdown'


// Helper function to render tool results
const renderToolResult = (contentItem) => {
  try {
    const resultData = JSON.parse(contentItem.content[0].text)
    
    // Handle search results
    if (resultData.search && resultData.search.products) {
      const products = resultData.search.products
      const totalResults = resultData.search.total_results || products.length
      
      return (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-3">
            Found {totalResults} product{totalResults !== 1 ? 's' : ''}
          </div>
          {products && products.length > 0 ? (
            <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {products.map((product, index) => (
              <div key={product.id || index} className="flex-shrink-0 w-64 border border-gray-200 rounded-lg p-3 bg-white">
                <div className="space-y-3">
                  {product.main_image && (
                    <img 
                      src={product.main_image} 
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2" title={product.title}>
                      {product.title}
                    </h4>
                    {product.price && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <DollarSign className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {product.price.min === product.price.max 
                            ? `$${product.price.min}`
                            : `$${product.price.min} - $${product.price.max}`
                          }
                        </span>
                      </div>
                    )}
                    {product.url && (
                      <a 
                        href={product.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                      >
                        <span>View Product</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">No products match your search criteria</div>
            </div>
          )}
          {products && products.length > 10 && (
            <div className="text-xs text-gray-500 text-center">
              Scroll horizontally to see all {products.length} products
            </div>
          )}
        </div>
      )
    }
    
    // Fallback for other tool results
    return (
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <pre className="whitespace-pre-wrap text-xs">
          {JSON.stringify(resultData, null, 2)}
        </pre>
      </div>
    )
  } catch (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
        Failed to parse tool result
      </div>
    )
  }
}

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

        {messages.flatMap((message, messageIndex) => {
          const isUser = message.role === 'user'
          const isBot = message.role === 'assistant'
          
          // Parse content to split into individual message parts
          let contentArray = []
          try {
            if (Array.isArray(message.content)) {
              contentArray = message.content
            } else if (typeof message.content === 'string') {
              try {
                const parsed = JSON.parse(message.content)
                contentArray = Array.isArray(parsed) ? parsed : [parsed]
              } catch {
                contentArray = [{ type: 'text', text: message.content }]
              }
            } else {
              contentArray = [message.content]
            }
          } catch {
            contentArray = [{ type: 'text', text: String(message.content) }]
          }

          // Filter to show text and specific tool result messages
          const displayableMessages = contentArray.filter(item => {
            if (item.type === 'text' && item.text) {
              // Decode and extract response content
              let decoded = item.text
                .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
                .replace(/\\r/g, '\r')
                .replace(/\\"/g, '"')
                .replace(/\\'/g, "'")
                .replace(/\\\\/g, '\\')
              
              // Extract response content if present
              const responseMatch = decoded.match(/<response>(.*?)<\/response>/s)
              if (responseMatch) {
                return responseMatch[1].trim().length > 0
              }
              
              // If has thinking blocks, filter them out and check if anything remains
              if (decoded.includes('<thinking>')) {
                const withoutThinking = decoded.replace(/<thinking>.*?<\/thinking>/gs, '').trim()
                return withoutThinking.length > 0
              }
              
              return decoded.trim().length > 0
            }
            if (item.type === 'mcp_tool_result' && !item.is_error) {
              // Find corresponding tool use to check the name
              const toolUse = contentArray.find(toolItem => 
                toolItem.type === 'mcp_tool_use' && 
                toolItem.id === item.tool_use_id
              )
              return toolUse && toolUse.name === 'search_shop_catalog'
            }
            return false
          })
          
          return displayableMessages.map((contentItem, contentIndex) => (
            <div
              key={`${message.id || messageIndex}-${contentIndex}`}
              className={cn(
                'flex space-x-3',
                isUser && 'flex-row-reverse space-x-reverse'
              )}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {contentItem.type === 'mcp_tool_result' ? (
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                    <Wrench className="h-4 w-4 text-white" />
                  </div>
                ) : isBot ? (
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
                  <div className="text-sm break-words">
                    {contentItem.type === 'text' ? (
                      <div className="prose prose-sm max-w-none prose-gray">
                        <ReactMarkdown 
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-sm">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                            pre: ({ children }) => <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{children}</pre>,
                          }}
                        >
                          {(() => {
                            let decoded = contentItem.text
                              .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
                              .replace(/\\n/g, '\n')
                              .replace(/\\t/g, '\t')
                              .replace(/\\r/g, '\r')
                              .replace(/\\"/g, '"')
                              .replace(/\\'/g, "'")
                              .replace(/\\\\/g, '\\')
                            
                            // Extract response content if present
                            const responseMatch = decoded.match(/<response>(.*?)<\/response>/s)
                            if (responseMatch) {
                              return responseMatch[1].trim()
                            }
                            
                            // Remove thinking blocks
                            if (decoded.includes('<thinking>')) {
                              return decoded.replace(/<thinking>.*?<\/thinking>/gs, '').trim()
                            }
                            
                            return decoded
                          })()}
                        </ReactMarkdown>
                      </div>
                    ) : contentItem.type === 'mcp_tool_result' ? (
                      renderToolResult(contentItem)
                    ) : null}
                  </div>

                  {/* Timestamp - only show on the first message part */}
                  {contentIndex === 0 && (
                    <div className={cn(
                      'text-xs mt-1',
                      isUser ? 'text-teal-100' : 'text-gray-500'
                    )}>
                      {dateUtils.formatTime(message.created_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        }).flat()}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}