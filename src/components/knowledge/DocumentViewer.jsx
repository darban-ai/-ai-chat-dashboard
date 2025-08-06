import React, { useState, useEffect } from 'react'
import { X, Download, FileText, Loader2, Eye, Edit3, Save, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/utils/cn'
import ReactMarkdown from 'react-markdown'

export const DocumentViewer = ({ 
  document, 
  isOpen, 
  onClose, 
  onGetContent,
  onEdit,
  className 
}) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('rendered') // 'rendered' or 'raw'
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    if (isOpen && document && onGetContent) {
      setViewMode('rendered') // Reset to rendered view when opening a new document
      setIsEditing(false) // Reset edit mode
      setEditContent('')
      loadContent()
    }
  }, [isOpen, document])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const documentContent = await onGetContent(document.key)
      setContent(documentContent)
    } catch (err) {
      setError(err.message || 'Failed to load document content')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (content && document) {
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = document.key
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleEditStart = () => {
    setIsEditing(true)
    setEditContent(content)
    setViewMode('raw') // Switch to raw mode for editing
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditContent('')
  }

  const handleEditSave = async () => {
    if (!onEdit || !document) return
    
    try {
      setSaveLoading(true)
      setError(null)
      
      await onEdit(document.key, editContent)
      
      // Update the content and exit edit mode
      setContent(editContent)
      setIsEditing(false)
      setEditContent('')
    } catch (err) {
      setError(err.message || 'Failed to save document')
    } finally {
      setSaveLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
      <Card className={cn('w-full max-w-5xl h-[90vh] flex flex-col', className)}>
        <CardHeader className="flex-shrink-0 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {document?.key || 'Document'}
                </CardTitle>
                {document && (
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{formatFileSize(document.size)}</span>
                    <span>•</span>
                    <span>Modified: {formatDate(document.last_modified)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {content && (
                <>
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'rendered' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('rendered')}
                      className={cn(
                        'p-2 h-8 transition-all',
                        viewMode === 'rendered' 
                          ? 'bg-blue-600 shadow-sm text-white hover:bg-blue-700' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      )}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'raw' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('raw')}
                      className={cn(
                        'p-2 h-8 transition-all',
                        viewMode === 'raw' 
                          ? 'bg-blue-600 shadow-sm text-white hover:bg-blue-700' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      )}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditCancel}
                        disabled={saveLoading}
                        className="flex items-center space-x-2"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Cancel</span>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleEditSave}
                        disabled={saveLoading || !editContent.trim()}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                      >
                        {saveLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>{saveLoading ? 'Saving...' : 'Submit'}</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      {viewMode === 'raw' && onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditStart}
                          className="flex items-center space-x-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                    </>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 bg-white">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading document...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-600 font-medium">Failed to load document</p>
                <p className="text-gray-500 text-sm mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadContent}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : content ? (
            <div className="h-full overflow-y-auto overflow-x-hidden">
              {viewMode === 'rendered' ? (
                <div className="p-8 max-w-none">
                  <ReactMarkdown 
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-6">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-5">
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-4">
                          {children}
                        </h4>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 text-base leading-7 text-gray-800">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-4 ml-6">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-4 ml-6 list-decimal">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-2 text-base leading-7 text-gray-800 list-disc">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-gray-800">
                          {children}
                        </em>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 mb-4 italic text-gray-700">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto">
                          {children}
                        </pre>
                      ),
                      a: ({ href, children }) => (
                        <a 
                          href={href} 
                          className="text-blue-600 hover:text-blue-800 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      img: ({ src, alt }) => (
                        <img 
                          src={src} 
                          alt={alt} 
                          className="max-w-full h-auto mb-4 rounded shadow-sm"
                        />
                      )
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full bg-gray-50">
                  {isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="h-full w-full p-8 text-sm font-mono text-gray-800 bg-white border-none outline-none resize-none leading-relaxed"
                      placeholder="Enter your document content here..."
                      disabled={saveLoading}
                    />
                  ) : (
                    <pre className="h-full p-8 text-sm font-mono text-gray-800 whitespace-pre-wrap overflow-auto leading-relaxed">
                      {content}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No content available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}