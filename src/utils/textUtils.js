/**
 * Process chat text by filtering out thinking blocks and showing only response content
 * @param {string} text - Raw text that may contain thinking/response blocks
 * @returns {string} - Processed text ready for display
 */
export const processChatText = (text) => {
  if (!text || typeof text !== 'string') {
    return text || ''
  }
  
  // First decode escaped characters
  let decoded = text.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 16))
  })
  
  decoded = decoded
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
  
  // Extract only response content, filter out thinking blocks
  const responseMatch = decoded.match(/<response>(.*?)<\/response>/s)
  if (responseMatch) {
    const responseContent = responseMatch[1].trim()
    return responseContent.length > 0 ? responseContent : ''
  }
  
  // If no response tags but has thinking, remove thinking blocks
  if (decoded.includes('<thinking>')) {
    return decoded.replace(/<thinking>.*?<\/thinking>/gs, '').trim()
  }
  
  return decoded
}