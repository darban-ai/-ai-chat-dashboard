import { useState, useCallback } from 'react'
import { apiService, ValidationError, AuthenticationError, NotFoundError, NetworkError, TimeoutError } from '@/services/apiService'

export const useKnowledgeBase = (clientId = 'cid-83f1d585a5e842249c1fd1f177c2dfac') => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errorType, setErrorType] = useState(null)
  const [continuationToken, setContinuationToken] = useState('')
  const [hasMore, setHasMore] = useState(false)

  // Enhanced error handling helper
  const handleError = useCallback((error, context) => {
    let userMessage = 'An unexpected error occurred'
    let errorType = 'unknown'

    if (error instanceof ValidationError) {
      userMessage = `Invalid input: ${error.message}`
      errorType = 'validation'
    } else if (error instanceof AuthenticationError) {
      userMessage = 'Please log in to continue'
      errorType = 'auth'
    } else if (error instanceof NotFoundError) {
      userMessage = context === 'documents' ? 'No documents found in knowledge base' : 'Document not found'
      errorType = 'not_found'
    } else if (error instanceof NetworkError) {
      userMessage = 'Connection failed. Please check your internet connection'
      errorType = 'network'
    } else if (error instanceof TimeoutError) {
      userMessage = 'Request timed out. Please try again'
      errorType = 'timeout'
    } else {
      userMessage = error.message || userMessage
      errorType = 'api'
    }

    setError(userMessage)
    setErrorType(errorType)
    console.error(`Failed to ${context}:`, error)
  }, [])

  // Load documents list
  const loadDocuments = useCallback(async (token = '') => {
    try {
      setLoading(true)
      setError(null)
      setErrorType(null)
      
      const response = await apiService.listKnowledgeBaseDocs(clientId, token)
      
      const newDocuments = response.objects || []
      
      if (token === '') {
        // First load - replace documents
        setDocuments(newDocuments)
      } else {
        // Pagination - append documents
        setDocuments(prev => [...prev, ...newDocuments])
      }
      
      setContinuationToken(response.continuation_token || '')
      setHasMore(!!response.continuation_token)
      
    } catch (err) {
      handleError(err, 'load documents')
    } finally {
      setLoading(false)
    }
  }, [clientId, handleError])

  // Load more documents (pagination)
  const loadMore = useCallback(() => {
    if (continuationToken && !loading) {
      loadDocuments(continuationToken)
    }
  }, [continuationToken, loading, loadDocuments])

  // Get document content
  const getDocumentContent = useCallback(async (key) => {
    try {
      const response = await apiService.getKnowledgeBaseDoc(clientId, key)
      return response.content || ''
    } catch (err) {
      // Re-throw with better error handling for UI components
      if (err instanceof NotFoundError) {
        throw new Error('Document not found or has been removed')
      } else if (err instanceof NetworkError) {
        throw new Error('Connection failed while loading document')
      } else if (err instanceof TimeoutError) {
        throw new Error('Document loading timed out')
      } else {
        throw new Error(err.message || 'Failed to load document content')
      }
    }
  }, [clientId])

  // Delete document
  const deleteDocument = useCallback(async (key) => {
    try {
      setError(null)
      setErrorType(null)
      
      await apiService.deleteKnowledgeBaseDoc(clientId, key)
      
      // Remove the document from the local state
      setDocuments(prev => prev.filter(doc => doc.key !== key))
      
      return { success: true, message: 'Document deleted successfully' }
    } catch (err) {
      handleError(err, 'delete document')
      throw err // Re-throw for component handling
    }
  }, [clientId, handleError])

  // Refresh documents
  const refresh = useCallback(() => {
    setDocuments([])
    setContinuationToken('')
    setHasMore(false)
    loadDocuments('')
  }, [loadDocuments])

  // Get file extension from key
  const getFileExtension = useCallback((key) => {
    const parts = key.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }, [])

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return {
    // Data
    documents,
    loading,
    error,
    errorType,
    hasMore,
    
    // Actions
    loadDocuments,
    loadMore,
    getDocumentContent,
    deleteDocument,
    refresh,
    
    // Utilities
    getFileExtension,
    formatFileSize,
  }
}