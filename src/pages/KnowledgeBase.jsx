import React, { useEffect, useState } from 'react'
import { Search, RefreshCw, FileText, Calendar, HardDrive, ChevronDown } from 'lucide-react'
import { SimpleLayout } from '@/components/layout/SimpleLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { DocumentViewer } from '@/components/knowledge/DocumentViewer'
import { DocumentIcon } from '@/components/icons/DocumentIcon'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
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
    refresh,
    formatFileSize,
  } = useKnowledgeBase()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  return (
    <SimpleLayout>
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
              <p className="text-gray-600 mt-1">
                Browse and view documents in your knowledge base
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              </span>
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
          <div className="mt-4 max-w-md">
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

        {/* Content */}
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
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => handleDocumentClick(document)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                          getFileTypeColor(document.key)
                        )}>
                          <DocumentIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {document.key}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <HardDrive className="h-3 w-3 mr-1" />
                              {formatFileSize(document.size)}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(document.last_modified)}
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

      {/* Document Viewer Modal */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
        onGetContent={getDocumentContent}
      />
    </SimpleLayout>
  )
}