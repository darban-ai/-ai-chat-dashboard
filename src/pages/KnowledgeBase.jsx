import React, { useEffect, useState, useRef } from 'react'
import { Search, RefreshCw, FileText, Calendar, HardDrive, ChevronDown, Plus, X, Link, Trash2, Info, AlertCircle, XCircle } from 'lucide-react'
import { SimpleLayout } from '@/components/layout/SimpleLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { DocumentViewer } from '@/components/knowledge/DocumentViewer'
import { CreateUrlModal } from '@/components/knowledge/CreateUrlModal'
import { CreateDocModal } from '@/components/knowledge/CreateDocModal'
import { CreateKnowledgeGapModal } from '@/components/knowledge/CreateKnowledgeGapModal'
import { KnowledgeBaseGaps } from '@/components/knowledge/KnowledgeBaseGaps'
import { DocumentIcon } from '@/components/icons/DocumentIcon'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { useKnowledgeBaseGaps } from '@/hooks/useKnowledgeBaseGaps'
import { cn } from '@/utils/cn'

export const KnowledgeBase = () => {
  const {
    documents,
    loading,
    error,
    hasMore,
    loadDocuments,
    loadMore,
    getDocumentContent,
    createDocument,
    deleteDocument,
    refresh,
    formatFileSize,
  } = useKnowledgeBase()

  const {
    gaps,
    loading: gapsLoading,
    error: gapsError,
    hasMore: hasMoreGaps,
    loadGaps,
    loadMore: loadMoreGaps,
    answerGap,
    deleteGap,
    refresh: refreshGaps,
    formatDate,
  } = useKnowledgeBaseGaps()

  const [activeTab, setActiveTab] = useState('knowledge-base') // 'knowledge-base' or 'knowledge-gaps'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const [isKnowledgeGapModalOpen, setIsKnowledgeGapModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createGapLoading, setCreateGapLoading] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    loadDocuments()
    loadGaps()
  }, [loadDocuments, loadGaps])

  const filteredDocuments = documents.filter(doc =>
    doc.key.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDocumentClick = (document) => {
    setSelectedDocument(document)
    setIsViewerOpen(true)
  }

  const handleCloseViewer = () => {
    setIsViewerOpen(false)
    setSelectedDocument(null)
  }

  const handleDeleteDocument = async (document, event) => {
    event.stopPropagation() // Prevent opening the document viewer
    
    const fileName = getDisplayName(document.key)
    if (confirm(`Are you sure you want to delete "${fileName}"?\n\nThis action cannot be undone.`)) {
      try {
        await deleteDocument(document.key)
        // Success feedback could be added here (toast notification, etc.)
      } catch (error) {
        // Error is already handled by the hook, but we can show additional UI feedback
        alert(`Failed to delete "${fileName}". Please try again.`)
      }
    }
  }

  const handleCreateFromUrl = async (url) => {
    setCreateLoading(true)
    try {
      await createDocument('url', { url })
      setShowAddDropdown(false)
    } catch (error) {
      throw error // Let the modal handle the error display
    } finally {
      setCreateLoading(false)
    }
  }

  const handleCreateFromDoc = async (data) => {
    setCreateLoading(true)
    try {
      await createDocument('doc', data)
      setShowAddDropdown(false)
    } catch (error) {
      throw error // Let the modal handle the error display
    } finally {
      setCreateLoading(false)
    }
  }

  const handleEditDocument = async (key, content) => {
    try {
      await createDocument('edit', { key, content })
    } catch (error) {
      throw error // Let the DocumentViewer handle the error display
    }
  }

  const handleAddClick = () => {
    setShowAddDropdown(!showAddDropdown)
  }

  const handleUrlOptionClick = () => {
    setShowAddDropdown(false)
    setIsUrlModalOpen(true)
  }

  const handleDocOptionClick = () => {
    setShowAddDropdown(false)
    setIsDocModalOpen(true)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAddDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Format date for documents (different from gaps)
  const formatDocumentDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Extract filename from full path using regex
  const getDisplayName = (fullPath) => {
    // Use regex to match everything after the last forward slash
    const match = fullPath.match(/\/([^\/]+)$/)
    return match ? match[1] : fullPath
  }

  const getFileTypeColor = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return 'text-red-600 bg-red-50'
      case 'doc':
      case 'docx': return 'text-blue-600 bg-blue-50'
      case 'txt': return 'text-gray-600 bg-gray-50'
      case 'md': return 'text-purple-600 bg-purple-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const handleDeleteConfirm = (gap, onConfirm) => {
    setDeleteConfirmation({ gap, onConfirm })
  }

  const confirmDelete = async () => {
    if (deleteConfirmation?.onConfirm) {
      await deleteConfirmation.onConfirm()
    }
    setDeleteConfirmation(null)
  }

  const cancelDelete = () => {
    setDeleteConfirmation(null)
  }

  const handleCreateCustomGap = async (gapData) => {
    setCreateGapLoading(true)
    try {
      // For now, we'll create a mock gap since we need to check the API structure
      // This should be replaced with actual API call
      const newGap = {
        id: Date.now().toString(),
        question: gapData.question,
        answer: gapData.answer,
        created_at: new Date().toISOString(),
        is_custom: true
      }
      
      // Add to the gaps list - this should be handled by the backend
      // For now, we'll just refresh the gaps to simulate success
      await refreshGaps()
      
    } catch (error) {
      throw error
    } finally {
      setCreateGapLoading(false)
    }
  }

  return (
    <SimpleLayout>
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Management</h1>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('knowledge-base')}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'knowledge-base'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('knowledge-gaps')}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2",
                activeTab === 'knowledge-gaps'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <span>Knowledge Gaps</span>
              {gaps.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {gaps.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content with Slide Animation */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out h-full"
            style={{ 
              transform: `translateX(${activeTab === 'knowledge-gaps' ? '-50%' : '0%'})`,
              width: '200%'
            }}
          >
            {/* Knowledge Base Tab Content */}
            <div className="w-1/2 flex-shrink-0 flex flex-col h-full">
              <div className="flex-1 overflow-auto p-6">
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-red-800 font-medium">Failed to load documents</p>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refresh}
                      className="text-red-600 border-red-300 hover:bg-red-100"
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Knowledge Base
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Browse and view documents in your knowledge base
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
                  </span>
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddClick}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    
                    {showAddDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={handleUrlOptionClick}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Link className="h-4 w-4 mr-3 text-blue-600" />
                            From URL
                          </button>
                          <button
                            onClick={handleDocOptionClick}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <FileText className="h-4 w-4 mr-3 text-green-600" />
                            New Document
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refresh}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                    <span>Refresh</span>
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

          {loading && documents.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredDocuments.length === 0 && !loading ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No documents found' : 'No documents available'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Your knowledge base is empty'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((document) => (
                  <Card 
                    key={document.key}
                    className="hover:shadow-md transition-shadow cursor-pointer group relative"
                    onClick={() => handleDocumentClick(document)}
                  >
                    {/* Delete button - only visible on hover */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteDocument(document, e)}
                      className="absolute top-2 right-2 p-1.5 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-red-50 hover:text-red-600 shadow-sm border border-gray-200 hover:border-red-200 z-10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                          getFileTypeColor(getDisplayName(document.key))
                        )}>
                          <DocumentIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {getDisplayName(document.key)}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <HardDrive className="h-3 w-3 mr-1" />
                              {formatFileSize(document.size)}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDocumentDate(document.last_modified)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>Load More Documents</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
              </div>
            </div>

            {/* Knowledge Gaps Tab Content */}
            <div className="w-1/2 flex-shrink-0 flex flex-col h-full bg-white">
              <div className="flex-1 flex flex-col min-h-0">
                {/* Knowledge Gaps Header */}
                <div className="flex-shrink-0 px-6 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Knowledge Gaps
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshGaps}
                        disabled={gapsLoading}
                        className="p-1.5 h-7 w-7 hover:bg-gray-200 transition-colors"
                      >
                        <RefreshCw className={cn('h-4 w-4', gapsLoading && 'animate-spin')} />
                      </Button>
                      <span className="text-xs text-red-600 italic">
                        Knowledge gaps are created every one hour
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsKnowledgeGapModalOpen(true)}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Custom Gap</span>
                      </Button>
                      <span className="text-sm text-gray-500">
                        {gaps.length} question{gaps.length !== 1 ? 's' : ''} need{gaps.length === 1 ? 's' : ''} answering
                      </span>
                    </div>
                  </div>

                  {gapsError && (
                    <Card className="mb-4 border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <FileText className="h-4 w-4 text-red-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-red-800 font-medium">Failed to load knowledge gaps</p>
                            <p className="text-red-600 text-sm mt-1">{gapsError}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshGaps}
                            className="text-red-600 border-red-300 hover:bg-red-100"
                          >
                            Try Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Scrollable Gaps Container - Full Width */}
                <div className="flex-1 bg-gray-50 p-4 min-h-0">
                  <KnowledgeBaseGaps
                    gaps={gaps}
                    onAnswerGap={answerGap}
                    onDeleteGap={deleteGap}
                    loading={gapsLoading}
                    formatDate={formatDate}
                    hasMore={hasMoreGaps}
                    onLoadMore={loadMoreGaps}
                    onDeleteConfirm={handleDeleteConfirm}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Question</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            
            <div className="bg-gray-50 p-3 rounded-md mb-6">
              <p className="text-sm text-gray-700 font-medium line-clamp-2">
                "{deleteConfirmation.gap.question}"
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="flex items-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button
                variant="default"
                onClick={confirmDelete}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
        onGetContent={getDocumentContent}
        onEdit={handleEditDocument}
      />

      {/* Create URL Modal */}
      <CreateUrlModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onSubmit={handleCreateFromUrl}
        loading={createLoading}
      />

      {/* Create Document Modal */}
      <CreateDocModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSubmit={handleCreateFromDoc}
        loading={createLoading}
      />

      {/* Create Knowledge Gap Modal */}
      <CreateKnowledgeGapModal
        isOpen={isKnowledgeGapModalOpen}
        onClose={() => setIsKnowledgeGapModalOpen(false)}
        onSubmit={handleCreateCustomGap}
        loading={createGapLoading}
      />
    </SimpleLayout>
  )
}