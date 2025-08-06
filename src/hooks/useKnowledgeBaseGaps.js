import { useState, useCallback } from 'react'
import { apiService } from '@/services/apiService'

export const useKnowledgeBaseGaps = () => {
  const [gaps, setGaps] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errorType, setErrorType] = useState(null)
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    count: 0
  })

  const getClientId = useCallback(() => {
    const storedClientId = localStorage.getItem('clientId')
    if (storedClientId) {
      return storedClientId
    }
    
    return import.meta.env.VITE_CLIENT_ID || 'cid-83f1d585a5e842249c1fd1f177c2dfac'
  }, [])

  const clientId = getClientId()

  const handleError = useCallback((err, action) => {
    console.error(`Error ${action}:`, err)
    
    let errorMessage = `Failed to ${action}`
    let type = 'unknown'
    
    if (err.name === 'ValidationError') {
      errorMessage = err.message
      type = 'validation'
    } else if (err.name === 'NetworkError') {
      errorMessage = 'Network connection failed. Please check your internet connection.'
      type = 'network'
    } else if (err.name === 'TimeoutError') {
      errorMessage = 'Request timed out. Please try again.'
      type = 'timeout'
    } else if (err.name === 'ApiError') {
      errorMessage = err.message || errorMessage
      type = 'api'
    } else if (err.message) {
      errorMessage = err.message
    }
    
    setError(errorMessage)
    setErrorType(type)
  }, [])

  // Load gaps
  const loadGaps = useCallback(async (options = {}) => {
    try {
      setLoading(true)
      setError(null)
      setErrorType(null)
      
      const { limit = 10, offset = 0 } = options
      
      const response = await apiService.getKnowledgeBaseGaps(clientId, {
        limit,
        offset
      })
      
      setGaps(response.gaps || [])
      setPagination(response.pagination || { limit, offset, count: 0 })
      
    } catch (err) {
      handleError(err, 'load knowledge base gaps')
    } finally {
      setLoading(false)
    }
  }, [clientId, handleError])

  // Load more gaps (for pagination)
  const loadMore = useCallback(async () => {
    if (loading) return
    
    try {
      setLoading(true)
      setError(null)
      setErrorType(null)
      
      const newOffset = pagination.offset + pagination.limit
      
      const response = await apiService.getKnowledgeBaseGaps(clientId, {
        limit: pagination.limit,
        offset: newOffset
      })
      
      setGaps(prev => [...prev, ...(response.gaps || [])])
      setPagination(response.pagination || { ...pagination, offset: newOffset })
      
    } catch (err) {
      handleError(err, 'load more knowledge base gaps')
    } finally {
      setLoading(false)
    }
  }, [clientId, pagination, loading, handleError])

  // Answer a gap
  const answerGap = useCallback(async (gapId, answer) => {
    try {
      setError(null)
      setErrorType(null)
      
      await apiService.answerKnowledgeBaseGap(clientId, gapId, answer)
      
      // Remove the answered gap from the local state
      setGaps(prev => prev.filter(gap => gap.id !== gapId))
      
      // Update pagination count
      setPagination(prev => ({
        ...prev,
        count: Math.max(0, prev.count - 1)
      }))
      
      return { success: true, message: 'Gap answered successfully' }
    } catch (err) {
      handleError(err, 'answer knowledge base gap')
      throw err // Re-throw for component handling
    }
  }, [clientId, handleError])

  // Delete a gap
  const deleteGap = useCallback(async (gapId) => {
    try {
      setError(null)
      setErrorType(null)
      
      await apiService.deleteKnowledgeBaseGap(clientId, gapId)
      
      // Remove the deleted gap from the local state
      setGaps(prev => prev.filter(gap => gap.id !== gapId))
      
      // Update pagination count
      setPagination(prev => ({
        ...prev,
        count: Math.max(0, prev.count - 1)
      }))
      
      return { success: true, message: 'Gap deleted successfully' }
    } catch (err) {
      handleError(err, 'delete knowledge base gap')
      throw err // Re-throw for component handling
    }
  }, [clientId, handleError])

  // Refresh gaps
  const refresh = useCallback(() => {
    loadGaps({ limit: pagination.limit, offset: 0 })
  }, [loadGaps, pagination.limit])

  // Format date helper
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    })
  }, [])

  // Check if there are more gaps to load
  const hasMore = gaps.length < pagination.count

  return {
    // State
    gaps,
    loading,
    error,
    errorType,
    pagination,
    hasMore,
    
    // Actions
    loadGaps,
    loadMore,
    answerGap,
    deleteGap,
    refresh,
    
    // Utilities
    formatDate,
    
    // Clear error
    clearError: () => {
      setError(null)
      setErrorType(null)
    }
  }
}