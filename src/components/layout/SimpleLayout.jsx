import React from 'react'
import { SimpleSidebar } from './SimpleSidebar'

export const SimpleLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SimpleSidebar />
      
      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {children}
      </div>
    </div>
  )
}