/**
 * Real API service for chat application with comprehensive error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Custom Error Classes for better error categorization
class ApiError extends Error {
  constructor(message, status, code, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(message, 422, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

class ServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'SERVER_ERROR')
    this.name = 'ServerError'
  }
}

class NetworkError extends ApiError {
  constructor(message = 'Network connection failed') {
    super(message, 0, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

class TimeoutError extends ApiError {
  constructor(message = 'Request timeout') {
    super(message, 0, 'TIMEOUT_ERROR')
    this.name = 'TimeoutError'
  }
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultTimeout = 30000 // 30 seconds
    this.retryAttempts = 3
    this.retryDelay = 1000 // 1 second
  }

  /**
   * Create AbortController with timeout
   */
  createTimeoutController(timeout = this.defaultTimeout) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    return { controller, timeoutId }
  }

  /**
   * Parse error response and create appropriate error instance
   */
  async parseErrorResponse(response) {
    let errorData = null
    
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json()
      } else {
        errorData = { message: await response.text() }
      }
    } catch (parseError) {
      errorData = { message: `HTTP ${response.status} ${response.statusText}` }
    }

    const message = errorData.message || errorData.error || `HTTP ${response.status} ${response.statusText}`
    const details = errorData.details || errorData.errors || null

    switch (response.status) {
      case 400:
        return new ValidationError(`Bad Request: ${message}`, details)
      case 401:
        return new AuthenticationError(message)
      case 403:
        return new AuthorizationError(message)
      case 404:
        return new NotFoundError(message)
      case 422:
        return new ValidationError(message, details)
      case 429:
        const retryAfter = response.headers.get('retry-after')
        return new RateLimitError(message, retryAfter)
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message)
      default:
        return new ApiError(message, response.status, 'HTTP_ERROR', details)
    }
  }

  /**
   * Retry logic for failed requests
   */
  async retryRequest(requestFn, attempt = 1) {
    try {
      return await requestFn()
    } catch (error) {
      // Don't retry client errors (4xx) except for 429 (rate limit)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error
      }

      // Don't retry if we've exceeded max attempts
      if (attempt >= this.retryAttempts) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = this.retryDelay * Math.pow(2, attempt - 1)
      
      console.warn(`API request failed (attempt ${attempt}/${this.retryAttempts}), retrying in ${delay}ms...`, error.message)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return this.retryRequest(requestFn, attempt + 1)
    }
  }

  /**
   * Main request method with comprehensive error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const timeout = options.timeout || this.defaultTimeout
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const requestFn = async () => {
      const { controller, timeoutId } = this.createTimeoutController(timeout)
      
      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw await this.parseErrorResponse(response)
        }
        
        // Handle empty responses
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return await response.json()
        } else {
          return await response.text()
        }
        
      } catch (error) {
        clearTimeout(timeoutId)
        
        // Handle AbortError (timeout)
        if (error.name === 'AbortError') {
          throw new TimeoutError(`Request timeout after ${timeout}ms`)
        }
        
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new NetworkError(`Network error: ${error.message}`)
        }
        
        // Re-throw API errors as-is
        if (error instanceof ApiError) {
          throw error
        }
        
        // Handle unexpected errors
        throw new ApiError(`Unexpected error: ${error.message}`, 0, 'UNKNOWN_ERROR')
      }
    }

    // Apply retry logic
    return this.retryRequest(requestFn)
  }

  /**
   * Validate required parameters
   */
  validateRequired(params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined || value === '') {
        throw new ValidationError(`${key} is required and cannot be empty`)
      }
      if (typeof value === 'string' && value.trim() === '') {
        throw new ValidationError(`${key} must be a non-empty string`)
      }
    }
  }

  /**
   * Validate parameter types
   */
  validateTypes(params) {
    for (const [key, { value, type }] of Object.entries(params)) {
      if (typeof value !== type) {
        throw new ValidationError(`${key} must be of type ${type}, got ${typeof value}`)
      }
    }
  }

  /**
   * Validate numeric ranges
   */
  validateRange(value, min, max, paramName) {
    if (value < min || value > max) {
      throw new ValidationError(`${paramName} must be between ${min} and ${max}, got ${value}`)
    }
  }

  /**
   * GET /sessionHistory
   * Retrieves paginated message history for a specific session
   * 
   * @param {string} sessionId - The session ID to retrieve history for
   * @param {Object} options - Optional parameters
   * @param {number} options.limit - Number of messages to retrieve (1-100, default: 10)
   * @param {number} options.offset - Number of messages to skip (default: 0)
   * @param {number} options.timeout - Request timeout in milliseconds
   * @returns {Promise<Object>} Session history response
   * @throws {ValidationError} When parameters are invalid
   * @throws {NotFoundError} When session is not found
   * @throws {AuthenticationError} When authentication is required
   */
  async getSessionHistory(sessionId, options = {}) {
    try {
      const { limit = 10, offset = 0, timeout } = options
      
      // Validate required parameters
      this.validateRequired({ session_id: sessionId })
      this.validateTypes({ 
        session_id: { value: sessionId, type: 'string' },
        limit: { value: limit, type: 'number' },
        offset: { value: offset, type: 'number' }
      })

      // Validate ranges
      this.validateRange(limit, 1, 100, 'limit')
      this.validateRange(offset, 0, Number.MAX_SAFE_INTEGER, 'offset')

      const params = new URLSearchParams({
        session_id: sessionId.trim(),
        limit: limit.toString(),
        offset: offset.toString(),
      })

      return await this.request(`/sessionHistory?${params}`, { timeout })
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ValidationError(`Invalid parameters for getSessionHistory: ${error.message}`)
    }
  }

  /**
   * GET /availableSessions
   * Retrieves paginated list of sessions for a specific client
   * 
   * @param {string} clientId - The client ID to retrieve sessions for
   * @param {Object} options - Optional parameters
   * @param {number} options.limit - Number of sessions to retrieve (1-100, default: 10)
   * @param {number} options.offset - Number of sessions to skip (default: 0)
   * @param {number} options.timeout - Request timeout in milliseconds
   * @returns {Promise<Object>} Available sessions response
   * @throws {ValidationError} When parameters are invalid
   * @throws {NotFoundError} When client is not found
   * @throws {AuthenticationError} When authentication is required
   */
  async getAvailableSessions(clientId, options = {}) {
    try {
      const { limit = 10, offset = 0, timeout } = options
      
      // Validate required parameters
      this.validateRequired({ client_id: clientId })
      this.validateTypes({ 
        client_id: { value: clientId, type: 'string' },
        limit: { value: limit, type: 'number' },
        offset: { value: offset, type: 'number' }
      })

      // Validate ranges
      this.validateRange(limit, 1, 100, 'limit')
      this.validateRange(offset, 0, Number.MAX_SAFE_INTEGER, 'offset')

      const params = new URLSearchParams({
        client_id: clientId.trim(),
        limit: limit.toString(),
        offset: offset.toString(),
      })

      return await this.request(`/availableSessions?${params}`, { timeout })
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ValidationError(`Invalid parameters for getAvailableSessions: ${error.message}`)
    }
  }

  /**
   * POST /listKnowledgeBaseDocs
   * Lists documents in the knowledge base for a specific client with pagination
   * 
   * @param {string} clientId - The client ID to list documents for
   * @param {string} continuationToken - Token for pagination (optional)
   * @param {Object} options - Optional parameters
   * @param {number} options.timeout - Request timeout in milliseconds
   * @returns {Promise<Object>} Knowledge base documents list
   * @throws {ValidationError} When parameters are invalid
   * @throws {NotFoundError} When client is not found
   * @throws {AuthenticationError} When authentication is required
   */
  async listKnowledgeBaseDocs(clientId, continuationToken = '', options = {}) {
    try {
      const { timeout } = options
      
      // Validate required parameters
      this.validateRequired({ client_id: clientId })
      this.validateTypes({ 
        client_id: { value: clientId, type: 'string' }
      })

      // Validate continuation token if provided
      if (continuationToken && typeof continuationToken !== 'string') {
        throw new ValidationError('continuation_token must be a string')
      }

      const requestBody = {
        client_id: clientId.trim(),
        continuation_token: continuationToken.trim()
      }

      return await this.request('/listKnowledgeBaseDocs', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        timeout
      })
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ValidationError(`Invalid parameters for listKnowledgeBaseDocs: ${error.message}`)
    }
  }

  /**
   * POST /getKnowledgeBaseDoc
   * Retrieves content of a specific document from the knowledge base
   * 
   * @param {string} clientId - The client ID
   * @param {string} key - The document key/identifier
   * @param {Object} options - Optional parameters
   * @param {number} options.timeout - Request timeout in milliseconds
   * @returns {Promise<Object>} Document content
   * @throws {ValidationError} When parameters are invalid
   * @throws {NotFoundError} When document is not found
   * @throws {AuthenticationError} When authentication is required
   */
  async getKnowledgeBaseDoc(clientId, key, options = {}) {
    try {
      const { timeout } = options
      
      // Validate required parameters
      this.validateRequired({ client_id: clientId, key: key })
      this.validateTypes({ 
        client_id: { value: clientId, type: 'string' },
        key: { value: key, type: 'string' }
      })

      const requestBody = {
        client_id: clientId.trim(),
        key: key.trim()
      }

      return await this.request('/getKnowledgeBaseDoc', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        timeout
      })
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ValidationError(`Invalid parameters for getKnowledgeBaseDoc: ${error.message}`)
    }
  }

  /**
   * POST /deleteKnowledgeBaseDoc
   * Deletes a specific document from the knowledge base
   * @param {string} clientId - Client identifier
   * @param {string} key - Document key/filename to delete
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Delete confirmation
   */
  async deleteKnowledgeBaseDoc(clientId, key, options = {}) {
    try {
      // Validate required parameters
      if (!clientId || typeof clientId !== 'string') {
        throw new ValidationError('clientId is required and must be a non-empty string')
      }
      
      if (!key || typeof key !== 'string') {
        throw new ValidationError('key is required and must be a non-empty string')
      }

      const { timeout = this.defaultTimeout } = options
      
      const requestBody = {
        client_id: clientId,
        key: key
      }

      return await this.request('/deleteKnowledgeBaseDoc', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        timeout
      })
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ValidationError(`Invalid parameters for deleteKnowledgeBaseDoc: ${error.message}`)
    }
  }

  /**
   * POST /createKnowledgeBaseDoc
   * Creates a new document in the knowledge base by processing content based on the specified type
   * @param {string} clientId - Client identifier
   * @param {string} type - Document processing type ("url" or "doc")
   * @param {Object} data - Additional data based on type
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Created document info
   */
  async createKnowledgeBaseDoc(clientId, type, data, options = {}) {
    try {
      // Validate required parameters
      if (!clientId || typeof clientId !== 'string') {
        throw new ValidationError('clientId is required and must be a non-empty string')
      }
      
      if (!type || typeof type !== 'string') {
        throw new ValidationError('type is required and must be a non-empty string')
      }

      if (!['url', 'doc', 'edit'].includes(type)) {
        throw new ValidationError('type must be either "url", "doc", or "edit"')
      }

      const { timeout = this.defaultTimeout } = options
      
      const requestBody = {
        client_id: clientId,
        type: type,
        ...data
      }

      // Validate conditional parameters
      if (type === 'url') {
        if (!data.url || typeof data.url !== 'string') {
          throw new ValidationError('url is required when type is "url"')
        }
        // Validate that URL is from accepted domain
        if (!data.url.includes('homespice')) {
          throw new ValidationError('We only accept your domain\'s URL.')
        }
      } else if (type === 'doc') {
        if (!data.filename || typeof data.filename !== 'string') {
          throw new ValidationError('filename is required when type is "doc"')
        }
        if (!data.content || typeof data.content !== 'string') {
          throw new ValidationError('content is required when type is "doc"')
        }
      } else if (type === 'edit') {
        if (!data.key || typeof data.key !== 'string') {
          throw new ValidationError('key is required when type is "edit"')
        }
        if (!data.content || typeof data.content !== 'string') {
          throw new ValidationError('content is required when type is "edit"')
        }
      }

      return await this.request('/createKnowledgeBaseDoc', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        timeout
      })
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ValidationError(`Invalid parameters for createKnowledgeBaseDoc: ${error.message}`)
    }
  }

  /**
   * POST /getKnowledgeBaseGaps
   * Retrieves paginated list of unanswered knowledge base gaps for a specific client
   * @param {string} clientId - Client identifier
   * @param {Object} options - Request options
   * @param {number} options.limit - Number of gaps to return (default: 10, max: 100)
   * @param {number} options.offset - Number of gaps to skip (default: 0, min: 0)
   * @param {number} options.timeout - Request timeout
   * @returns {Promise<Object>} Gaps data with pagination
   */
  async getKnowledgeBaseGaps(clientId, options = {}) {
    try {
      // Validate required parameters
      if (!clientId || typeof clientId !== 'string') {
        throw new ValidationError('clientId is required and must be a non-empty string')
      }

      const { limit = 10, offset = 0, timeout = this.defaultTimeout } = options
      
      // Validate optional parameters
      if (typeof limit !== 'number' || limit < 1 || limit > 100) {
        throw new ValidationError('limit must be a number between 1 and 100')
      }
      
      if (typeof offset !== 'number' || offset < 0) {
        throw new ValidationError('offset must be a number >= 0')
      }

      const requestBody = {
        client_id: clientId,
        limit,
        offset
      }

      return await this.request('/getKnowledgeBaseGaps', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        timeout
      })
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ValidationError(`Invalid parameters for getKnowledgeBaseGaps: ${error.message}`)
    }
  }

  /**
   * POST /answerKnowledgeBaseGap
   * Provides an answer to a specific knowledge base gap and marks it as answered
   * @param {string} clientId - Client identifier
   * @param {string} gapId - Knowledge base gap ID to answer
   * @param {string} answer - Answer text for the question
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Success message
   */
  async answerKnowledgeBaseGap(clientId, gapId, answer, options = {}) {
    try {
      // Validate required parameters
      if (!clientId || typeof clientId !== 'string') {
        throw new ValidationError('clientId is required and must be a non-empty string')
      }
      
      if (!gapId || typeof gapId !== 'string') {
        throw new ValidationError('gapId is required and must be a non-empty string')
      }
      
      if (!answer || typeof answer !== 'string') {
        throw new ValidationError('answer is required and must be a non-empty string')
      }

      const { timeout = this.defaultTimeout } = options
      
      const requestBody = {
        client_id: clientId,
        gap_id: gapId,
        answer: answer.trim()
      }

      return await this.request('/answerKnowledgeBaseGap', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        timeout
      })
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ValidationError(`Invalid parameters for answerKnowledgeBaseGap: ${error.message}`)
    }
  }

  /**
   * POST /deleteKnowledgeBaseGap
   * Deletes a specific knowledge base gap for a client
   * @param {string} clientId - Client identifier
   * @param {string} gapId - Knowledge base gap ID to delete
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Success message
   */
  async deleteKnowledgeBaseGap(clientId, gapId, options = {}) {
    try {
      // Validate required parameters
      if (!clientId || typeof clientId !== 'string') {
        throw new ValidationError('clientId is required and must be a non-empty string')
      }
      
      if (!gapId || typeof gapId !== 'string') {
        throw new ValidationError('gapId is required and must be a non-empty string')
      }

      const { timeout = this.defaultTimeout } = options
      
      const requestBody = {
        client_id: clientId,
        gap_id: gapId
      }

      return await this.request('/deleteKnowledgeBaseGap', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        timeout
      })
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ValidationError(`Invalid parameters for deleteKnowledgeBaseGap: ${error.message}`)
    }
  }

  /**
   * Health check endpoint
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      return await this.request('/health', { 
        timeout: 5000 // Short timeout for health checks
      })
    } catch (error) {
      throw new ServerError(`Health check failed: ${error.message}`)
    }
  }

  /**
   * Get API service configuration and status
   * @returns {Object} Service configuration
   */
  getConfig() {
    return {
      baseURL: this.baseURL,
      defaultTimeout: this.defaultTimeout,
      retryAttempts: this.retryAttempts,
      retryDelay: this.retryDelay
    }
  }
}

// Export error classes for use in other modules
export {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError
}

export const apiService = new ApiService()
export default apiService