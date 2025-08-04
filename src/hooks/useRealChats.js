import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/apiService'
import { dateUtils } from '@/utils/dateUtils'

export const useRealChats = (clientId = 'cid-83f1d585a5e842249c1fd1f177c2dfac') => {
  const [allSessions, setAllSessions] = useState([]) // Store all sessions from API
  const [sessions, setSessions] = useState([]) // Filtered sessions for display
  const [messages, setMessages] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedDate, setSelectedDate] = useState(dateUtils.getTodayString())
  const [loading, setLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    sessions: { limit: 100, offset: 0, count: 0 }, // Get more sessions to filter
    messages: { limit: 50, offset: 0, count: 0 }
  })

  // Filter sessions by selected date
  const filterSessionsByDate = useCallback((allSessions, date) => {
    if (!date) return allSessions
    
    return allSessions.filter(session => {
      if (!session.created_at) return false
      const sessionDate = session.created_at.split('T')[0] // Get YYYY-MM-DD part
      return sessionDate === date
    })
  }, [])

  // Load available sessions
  const loadSessions = useCallback(async (options = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getAvailableSessions(clientId, {
        limit: options.limit || pagination.sessions.limit,
        offset: options.offset || pagination.sessions.offset
      })
      
      // Store all sessions
      const fetchedSessions = response.sessions || []
      setAllSessions(fetchedSessions)
      
      setPagination(prev => ({
        ...prev,
        sessions: response.pagination || prev.sessions
      }))
    } catch (err) {
      setError(err.message)
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [clientId, pagination.sessions.limit, pagination.sessions.offset])

  // Load messages for a specific session
  const loadMessages = useCallback(async (sessionId, options = {}) => {
    if (!sessionId) return
    
    try {
      setMessagesLoading(true)
      setError(null)
      
      const response = await apiService.getSessionHistory(sessionId, {
        limit: options.limit || pagination.messages.limit,
        offset: options.offset || pagination.messages.offset
      })
      
      setMessages(response.messages || [])
      setPagination(prev => ({
        ...prev,
        messages: response.pagination || prev.messages
      }))
    } catch (err) {
      setError(err.message)
      console.error('Failed to load messages:', err)
    } finally {
      setMessagesLoading(false)
    }
  }, [pagination.messages.limit, pagination.messages.offset])

  // Handle date change
  const handleDateChange = useCallback((date) => {
    setSelectedDate(date)
    setSelectedSession(null) // Clear selected session when date changes
    setMessages([]) // Clear messages
  }, [])

  // Handle session selection
  const handleSessionSelect = useCallback((session) => {
    setSelectedSession(session)
    setMessages([]) // Clear previous messages
    if (session?.id) {
      loadMessages(session.id)
    }
  }, [loadMessages])

  // Load more sessions (pagination)
  const loadMoreSessions = useCallback(() => {
    const newOffset = pagination.sessions.offset + pagination.sessions.limit
    loadSessions({ offset: newOffset })
  }, [loadSessions, pagination.sessions])

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(() => {
    if (!selectedSession?.id) return
    
    const newOffset = pagination.messages.offset + pagination.messages.limit
    loadMessages(selectedSession.id, { offset: newOffset })
  }, [loadMessages, selectedSession, pagination.messages])

  // Refresh current data
  const refresh = useCallback(() => {
    loadSessions({ offset: 0 })
    if (selectedSession?.id) {
      loadMessages(selectedSession.id, { offset: 0 })
    }
  }, [loadSessions, loadMessages, selectedSession])

  // Filter sessions when date changes
  useEffect(() => {
    const filteredSessions = filterSessionsByDate(allSessions, selectedDate)
    setSessions(filteredSessions)
  }, [selectedDate, allSessions, filterSessionsByDate])

  // Initial load
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return {
    // Data
    sessions,
    messages,
    selectedSession,
    selectedDate,
    
    // Loading states
    loading,
    messagesLoading,
    error,
    
    // Pagination info
    pagination,
    
    // Actions
    handleSessionSelect,
    handleDateChange,
    loadMoreSessions,
    loadMoreMessages,
    refresh,
    
    // Computed values
    hasMoreSessions: pagination.sessions.offset + pagination.sessions.limit < pagination.sessions.count,
    hasMoreMessages: pagination.messages.offset + pagination.messages.limit < pagination.messages.count,
  }
}