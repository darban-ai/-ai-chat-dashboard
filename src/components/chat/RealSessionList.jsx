import React from 'react'
import { Search, RefreshCw, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { dateUtils } from '@/utils/dateUtils'
import { cn } from '@/utils/cn'

export const RealSessionList = ({ 
  sessions = [], 
  selectedSession, 
  onSessionSelect, 
  loading = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  error,
  className 
}) => {
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredSessions = sessions.filter(session => 
    session.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.customer_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && sessions.length === 0) {
    return (
      <div className={cn('w-80 bg-white border-r border-gray-200 flex flex-col', className)}>
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-80 bg-white border-r border-gray-200 flex flex-col', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Sessions</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{filteredSessions.length}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="p-1 h-6 w-6"
            >
              <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by session or customer ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="mt-2 text-xs"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 && !loading ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">
              {searchQuery ? 'No sessions found matching your search' : 'No sessions available'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSessions.map((session) => (
              <Button
                key={session.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start p-4 h-auto rounded-none hover:bg-gray-50',
                  selectedSession?.id === session.id && 'bg-blue-50 border-r-2 border-blue-500'
                )}
                onClick={() => onSessionSelect(session)}
              >
                <div className="flex items-center space-x-3 w-full">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {session.customer_id?.charAt(session.customer_id.indexOf('-') + 1)?.toUpperCase() || 'S'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Session info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Session {session.id?.split('-')[1]?.substring(0, 8) || 'Unknown'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {session.created_at && dateUtils.formatTime(session.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 truncate">
                      Customer: {session.customer_id?.split('-')[1]?.substring(0, 8) || 'Unknown'}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      {session.created_at && dateUtils.getSmartDate(session.created_at)}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="p-4">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Load More Sessions
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}