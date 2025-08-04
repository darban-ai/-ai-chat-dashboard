import { useState, useCallback } from 'react'
import { apiService } from '@/services/apiService'

export const useKnowledgeBase = (clientId = 'cid-83f1d585a5e842249c1fd1f177c2dfac') => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [continuationToken, setContinuationToken] = useState('')
  const [hasMore, setHasMore] = useState(false)

  // Load documents list
  const loadDocuments = useCallback(async (token = '') => {
    try {
      setLoading(true)
      setError(null)
      
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
      setError(err.message)
      console.error('Failed to load knowledge base documents:', err)
    } finally {
      setLoading(false)
    }
  }, [clientId])

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
      console.error('Failed to get document content:', err)
      throw err
    }
  }, [clientId])

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
    hasMore,
    
    // Actions
    loadDocuments,
    loadMore,
    getDocumentContent,
    refresh,
    
    // Utilities
    getFileExtension,
    formatFileSize,
  }
}