import React, { useState, useEffect } from 'react'
import { SimpleLayout } from '@/components/layout/SimpleLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MessageSquare, Users, Bot, Clock } from 'lucide-react'
import { apiService } from '@/services/apiService'

export const RealDashboard = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    activeCustomers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get sessions for the default client to calculate basic stats
      const clientId = 'cid-83f1d585a5e842249c1fd1f177c2dfac'
      const response = await apiService.getAvailableSessions(clientId, { limit: 100 })
      
      const sessions = response.sessions || []
      const uniqueCustomers = new Set(sessions.map(s => s.customer_id)).size
      
      setStats({
        totalSessions: sessions.length,
        totalMessages: 0, // We'd need to fetch all session histories to get this
        activeCustomers: uniqueCustomers,
      })
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statsCards = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Customers',
      value: stats.activeCustomers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'AI Assistant',
      value: 'Online',
      icon: Bot,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'System Status',
      value: error ? 'Error' : 'Healthy',
      icon: Clock,
      color: error ? 'text-red-600' : 'text-green-600',
      bgColor: error ? 'bg-red-100' : 'bg-green-100'
    }
  ]

  return (
    <SimpleLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Overview of your AI chatbot sessions and activity
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                  <strong>Connection Error:</strong> {error}
                </p>
                <button 
                  onClick={fetchStats}
                  className="mt-2 text-sm text-red-700 underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            {loading ? '...' : stat.value}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </SimpleLayout>
  )
}