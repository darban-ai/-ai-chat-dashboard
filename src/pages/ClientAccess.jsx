import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SimpleLayout } from '@/components/layout/SimpleLayout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import ReactMarkdown from 'react-markdown'
import { ShieldCheck, RefreshCcw, Save, Loader2, AlertTriangle } from 'lucide-react'
import { apiService } from '@/services/apiService'

const instructionOrder = ['about', 'tone', 'response_style', 'restrictions', 'contact_info', 'custom_instructions']
const defaultClientId = 'cid-83f1d585a5e842249c1fd1f177c2dfac'

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-xl font-semibold text-gray-900 mb-3">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-gray-900 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-gray-900 mb-2">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-gray-900 mb-2">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 mb-3 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 mb-3 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm text-gray-700 leading-relaxed">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-700">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-200 pl-4 text-sm text-gray-700 italic mb-3 last:mb-0">{children}</blockquote>
  ),
  code: ({ children }) => (
    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800">{children}</code>
  ),
}

const cloneDeep = (value) => JSON.parse(JSON.stringify(value))

const buildInstructionsPayload = (data) => {
  const payload = {}
  instructionOrder.forEach((key) => {
    const section = data[key] || {}
    if (key === 'contact_info') {
      const content = section.content || {}
      payload[key] = {
        heading: section.heading || '',
        content: {
          email: content.email || '',
          phone: content.phone || ''
        }
      }
    } else {
      payload[key] = {
        heading: section.heading || '',
        content: section.content || ''
      }
    }
  })
  return payload
}

export const ClientAccess = () => {
  const [clientIdInput, setClientIdInput] = useState(defaultClientId)
  const [activeClientId, setActiveClientId] = useState('')
  const [instructions, setInstructions] = useState(null)
  const [defaults, setDefaults] = useState(null)
  const [lastFetchedInstructions, setLastFetchedInstructions] = useState(null)
  const [metadata, setMetadata] = useState({ clientName: '', updatedBy: '', lastUpdated: '' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')

  const formattedUpdatedAt = useMemo(() => (
    metadata.lastUpdated ? new Date(metadata.lastUpdated).toLocaleString() : '—'
  ), [metadata.lastUpdated])

  const fetchInstructions = useCallback(async (id) => {
    const targetId = (id || '').trim()
    if (!targetId) {
      setError('Client ID is required')
      return
    }
    setLoading(true)
    setError('')
    setStatusMessage('')
    try {
      const data = await apiService.getClientInstructions(targetId)
      setClientIdInput(data.client_id || targetId)
      setActiveClientId(data.client_id || targetId)
      setInstructions(cloneDeep(data.instructions))
      setDefaults(cloneDeep(data.defaults))
      setLastFetchedInstructions(cloneDeep(data.instructions))
      setMetadata({
        clientName: data.client_name || '',
        updatedBy: data.updated_by || '',
        lastUpdated: data.last_updated || ''
      })
    } catch (err) {
      setError(err.message || 'Failed to load client instructions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInstructions(defaultClientId)
  }, [fetchInstructions])

  const handleClientSubmit = async (event) => {
    event.preventDefault()
    await fetchInstructions(clientIdInput)
  }

  const handleTextChange = (key, value) => {
    setStatusMessage('')
    setInstructions((prev) => {
      if (!prev) {
        return prev
      }
      const next = cloneDeep(prev)
      if (!next[key]) {
        next[key] = { heading: '', content: '' }
      }
      next[key].content = value
      return next
    })
  }

  const handleContactChange = (field, value) => {
    setStatusMessage('')
    setInstructions((prev) => {
      if (!prev) {
        return prev
      }
      const next = cloneDeep(prev)
      if (!next.contact_info) {
        next.contact_info = { heading: '', content: {} }
      }
      next.contact_info.content = next.contact_info.content || {}
      next.contact_info.content[field] = value
      return next
    })
  }

  const handleReset = () => {
    if (!lastFetchedInstructions) {
      return
    }
    setInstructions(cloneDeep(lastFetchedInstructions))
    setStatusMessage('')
  }

  const handleSave = async () => {
    if (!instructions) {
      return
    }
    const targetId = (activeClientId || clientIdInput || '').trim()
    if (!targetId) {
      setError('Client ID is required')
      return
    }
    setSaving(true)
    setError('')
    setStatusMessage('')
    try {
      const payload = buildInstructionsPayload(instructions)
      const data = await apiService.updateClientInstructions(targetId, payload)
      setInstructions(cloneDeep(data.instructions))
      setDefaults(cloneDeep(data.defaults))
      setLastFetchedInstructions(cloneDeep(data.instructions))
      setActiveClientId(data.client_id || targetId)
      setClientIdInput(data.client_id || targetId)
      setMetadata({
        clientName: data.client_name || metadata.clientName,
        updatedBy: data.updated_by || metadata.updatedBy,
        lastUpdated: data.last_updated || metadata.lastUpdated
      })
      setStatusMessage('Client settings updated successfully.')
    } catch (err) {
      setError(err.message || 'Failed to save client instructions')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SimpleLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">Client AI Settings Access</CardTitle>
                  <CardDescription>Manage client-specific instructions using the live API.</CardDescription>
                </div>
                <ShieldCheck className="h-8 w-8 text-teal-600" />
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleClientSubmit} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                    <Input
                      value={clientIdInput}
                      onChange={(event) => setClientIdInput(event.target.value)}
                      placeholder="Enter client identifier"
                      disabled={loading || saving}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || saving || !clientIdInput.trim()}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading
                      </>
                    ) : (
                      'Load Client'
                    )}
                  </Button>
                </form>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Client</p>
                    <p className="text-xl font-semibold text-gray-900">{metadata.clientName || '—'}</p>
                    <p className="text-sm text-gray-500">ID: {activeClientId || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Last updated</p>
                    <p className="text-sm text-gray-900">{formattedUpdatedAt}</p>
                    <p className="text-sm text-gray-500">By {metadata.updatedBy || '—'}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 bg-gray-50">
                {statusMessage ? (
                  <span className="text-sm text-green-600">{statusMessage}</span>
                ) : (
                  <span className="text-sm text-gray-500">Use these controls to manage client-facing instruction updates.</span>
                )}
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading || saving || !lastFetchedInstructions}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={loading || saving || !instructions}
                    className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">{error}</p>
                    <p className="text-xs text-red-600 mt-1">Verify the client ID and try again.</p>
                  </div>
                </div>
              </div>
            )}

            {loading && !instructions && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              </div>
            )}

            {!loading && instructions && defaults && instructionOrder.map((key) => {
              const section = instructions[key]
              const defaultSection = defaults[key]
              if (!section || !defaultSection) {
                return null
              }
              const isContact = key === 'contact_info'
              const hasClientContent = isContact
                ? Boolean(section.content?.email || section.content?.phone)
                : Boolean((section.content || '').trim())

              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">{section.heading || defaultSection.heading || key}</CardTitle>
                    <CardDescription>{hasClientContent ? 'Client override currently in use.' : 'Client override empty. Default fallback will be used.'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-8 lg:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Client override</p>
                        {isContact ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                              <Input
                                value={section.content?.email || ''}
                                onChange={(event) => handleContactChange('email', event.target.value)}
                                placeholder="client@example.com"
                                disabled={saving}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                              <Input
                                value={section.content?.phone || ''}
                                onChange={(event) => handleContactChange('phone', event.target.value)}
                                placeholder="+1 000 000 0000"
                                disabled={saving}
                              />
                            </div>
                          </div>
                        ) : (
                          <textarea
                            value={section.content || ''}
                            onChange={(event) => handleTextChange(key, event.target.value)}
                            placeholder="Provide client-specific instructions..."
                            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm leading-relaxed resize-none bg-white"
                            disabled={saving}
                          />
                        )}
                        {!hasClientContent && (
                          <p className="mt-2 text-xs text-gray-500">Currently using default instructions.</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Default fallback</p>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                          {isContact ? (
                            <div className="space-y-3 text-sm text-gray-700">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800">Email</span>
                                <span>{defaultSection.content?.email || '—'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800">Phone</span>
                                <span>{defaultSection.content?.phone || '—'}</span>
                              </div>
                            </div>
                          ) : (
                            <ReactMarkdown components={markdownComponents}>{defaultSection.content || ''}</ReactMarkdown>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </SimpleLayout>
  )
}
