import { format, isToday, isYesterday, parseISO, formatDistanceToNow } from 'date-fns'

/**
 * Date utility functions
 */
export const dateUtils = {
  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @param {string} formatStr - Format string (default: 'MMM dd, yyyy')
   * @returns {string} - Formatted date
   */
  formatDate: (date, formatStr = 'MMM dd, yyyy') => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
  },
  
  /**
   * Format time for display
   * @param {string|Date} date - Date to format
   * @returns {string} - Formatted time
   */
  formatTime: (date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'HH:mm')
  },
  
  /**
   * Format datetime for display
   * @param {string|Date} date - Date to format
   * @returns {string} - Formatted datetime
   */
  formatDateTime: (date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'MMM dd, yyyy HH:mm')
  },
  
  /**
   * Get relative time (e.g., "2 hours ago")
   * @param {string|Date} date - Date to format
   * @returns {string} - Relative time
   */
  getRelativeTime: (date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  },
  
  /**
   * Get smart date format (Today, Yesterday, or date)
   * @param {string|Date} date - Date to format
   * @returns {string} - Smart formatted date
   */
  getSmartDate: (date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    
    if (isToday(dateObj)) {
      return 'Today'
    } else if (isYesterday(dateObj)) {
      return 'Yesterday'
    } else {
      return format(dateObj, 'MMM dd, yyyy')
    }
  },
  
  /**
   * Get today's date in YYYY-MM-DD format
   * @returns {string} - Today's date
   */
  getTodayString: () => {
    return format(new Date(), 'yyyy-MM-dd')
  },
  
  /**
   * Check if date is today
   * @param {string|Date} date - Date to check
   * @returns {boolean} - Is today
   */
  isToday: (date) => {
    if (!date) return false
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isToday(dateObj)
  },
  
  /**
   * Get date range for filtering
   * @param {string} period - Period ('today', 'yesterday', 'week', 'month')
   * @returns {Object} - Start and end dates
   */
  getDateRange: (period) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (period) {
      case 'today':
        return {
          start: format(today, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        }
      case 'yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return {
          start: format(yesterday, 'yyyy-MM-dd'),
          end: format(yesterday, 'yyyy-MM-dd')
        }
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(weekStart.getDate() - 7)
        return {
          start: format(weekStart, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        }
      case 'month':
        const monthStart = new Date(today)
        monthStart.setDate(monthStart.getDate() - 30)
        return {
          start: format(monthStart, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        }
      default:
        return {
          start: format(today, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        }
    }
  }
}