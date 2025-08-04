import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { RealDashboard } from './pages/RealDashboard'
import { RealChats } from './pages/RealChats'
import { KnowledgeBase } from './pages/KnowledgeBase'
import { SimpleSettings } from './pages/SimpleSettings'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<RealDashboard />} />
        <Route path="/chats" element={<RealChats />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/settings" element={<SimpleSettings />} />
      
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App