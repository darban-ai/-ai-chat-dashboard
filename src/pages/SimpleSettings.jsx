import React from 'react'
import { SimpleLayout } from '@/components/layout/SimpleLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Settings, Bot, Database, Bell } from 'lucide-react'

export const SimpleSettings = () => {
  return (
    <SimpleLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">
              Configure your AI chatbot and system preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Bot Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>Bot Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bot Name
                  </label>
                  <Input 
                    type="text" 
                    defaultValue="Darban AI Assistant"
                    className="max-w-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Message
                  </label>
                  <textarea 
                    className="w-full max-w-2xl p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                    defaultValue="Hello! I'm here to help you with any questions you might have. How can I assist you today?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Delay (seconds)
                  </label>
                  <Input 
                    type="number" 
                    defaultValue="1"
                    min="0"
                    max="10"
                    className="max-w-xs"
                  />
                </div>
                
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Save Bot Settings
                </Button>
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>API Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Base URL
                  </label>
                  <Input 
                    type="url" 
                    defaultValue="http://localhost:8000/api"
                    className="max-w-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WebSocket URL
                  </label>
                  <Input 
                    type="url" 
                    defaultValue="ws://localhost:8000"
                    className="max-w-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <Input 
                    type="password" 
                    placeholder="Enter your API key"
                    className="max-w-lg"
                  />
                </div>
                
                <Button variant="outline">
                  Test Connection
                </Button>
                
                <Button className="bg-teal-600 hover:bg-teal-700 ml-2">
                  Save API Settings
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">New Message Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when users send new messages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Daily Reports</p>
                    <p className="text-sm text-gray-500">Receive daily summary of chat activity</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
                
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </SimpleLayout>
  )
}