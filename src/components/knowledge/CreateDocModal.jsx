import React, { useState, useRef, useEffect } from 'react'
import { X, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export const CreateDocModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [filename, setFilename] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const contentRef = useRef(null)

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!filename.trim()) {
      setError('Filename is required')
      return
    }

    if (!content.trim()) {
      setError('Content is required')
      return
    }

    try {
      await onSubmit({
        filename: filename.trim(),
        content: content.trim()
      })
      setFilename('')
      setContent('')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create document')
    }
  }

  const handleClose = () => {
    setFilename('')
    setContent('')
    setError('')
    onClose()
  }

  const handleContentChange = (e) => {
    setContent(e.target.innerText)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Create New Document</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col space-y-4">
            <div>
              <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-2">
                Filename
              </label>
              <Input
                id="filename"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="my-document (extension will be added automatically)"
                className="w-full"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Extension will be removed and .md will be added automatically
              </p>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <div
                ref={contentRef}
                contentEditable
                onInput={handleContentChange}
                className="flex-1 w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none overflow-y-auto min-h-[300px] bg-white text-gray-900 leading-relaxed"
                style={{ 
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}
                suppressContentEditableWarning={true}
                disabled={loading}
                placeholder="Write your document content here... You can use Markdown formatting."
              />
              <p className="text-xs text-gray-500 mt-1">
                You can write in Markdown format. The content is editable.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !filename.trim() || !content.trim()}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}