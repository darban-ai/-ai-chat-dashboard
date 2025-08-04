/**
 * Real API service for chat application
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  /**
   * GET /sessionHistory
   * Retrieves paginated message history for a specific session
   */
  async getSessionHistory(sessionId, options = {}) {
    const { limit = 10, offset = 0 } = options
    
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('session_id is required and must be a non-empty string')
    }

    const params = new URLSearchParams({
      session_id: sessionId,
      limit: Math.min(Math.max(1, limit), 100).toString(),
      offset: Math.max(0, offset).toString(),
    })

    return this.request(`/sessionHistory?${params}`)
  }

  /**
   * GET /availableSessions
   * Retrieves paginated list of sessions for a specific client
   */
  async getAvailableSessions(clientId, options = {}) {
    const { limit = 10, offset = 0 } = options
    
    if (!clientId || typeof clientId !== 'string') {
      throw new Error('client_id is required and must be a non-empty string')
    }

    const params = new URLSearchParams({
      client_id: clientId,
      limit: Math.min(Math.max(1, limit), 100).toString(),
      offset: Math.max(0, offset).toString(),
    })

    return this.request(`/availableSessions?${params}`)
  }

  /**
   * POST /listKnowledgeBaseDocs
   * Lists documents in the knowledge base for a specific client with pagination
   */
  async listKnowledgeBaseDocs(clientId, continuationToken = '') {
    if (!clientId || typeof clientId !== 'string') {
      throw new Error('client_id is required and must be a non-empty string')
    }

    return this.request('/listKnowledgeBaseDocs', {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        continuation_token: continuationToken
      })
    })
  }

  /**
   * POST /getKnowledgeBaseDoc
   * Retrieves content of a specific document from the knowledge base
   */
  async getKnowledgeBaseDoc(clientId, key) {
    if (!clientId || typeof clientId !== 'string') {
      throw new Error('client_id is required and must be a non-empty string')
    }

    if (!key || typeof key !== 'string') {
      throw new Error('key is required and must be a non-empty string')
    }

    return this.request('/getKnowledgeBaseDoc', {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        key: key
      })
    })
  }
}

export const apiService = new ApiService()
export default apiService