import React, { useState } from 'react'
import { X, Save, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export const CreateKnowledgeGapModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!question.trim()) {
      setError('Question is required')
      return
    }
    
    if (!answer.trim()) {
      setError('Answer is required')
      return
    }

    try {
      setError('')
      await onSubmit({ question: question.trim(), answer: answer.trim() })
      // Reset form on success
      setQuestion('')
      setAnswer('')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create knowledge gap')
    }
  }

  const handleCancel = () => {
    setQuestion('')
    setAnswer('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Custom Knowledge Gap</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="p-2 h-8 w-8 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Question Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <Input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter the question that needs to be answered..."
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* Answer Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer *
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Provide a comprehensive answer to the question..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm leading-relaxed"
                disabled={loading}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This will create a custom knowledge gap entry that can be used to improve your AI assistant's knowledge base.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <XCircle className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
            
            <Button
              type="submit"
              variant="default"
              disabled={loading || !question.trim() || !answer.trim()}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Knowledge Gap</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}