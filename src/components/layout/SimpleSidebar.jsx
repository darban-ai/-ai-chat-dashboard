import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings,
  BookOpen
} from 'lucide-react'
import { cn } from '@/utils/cn'

const navigation = [
  {
    name: 'Home',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Messages',
    href: '/chats',
    icon: MessageSquare,
  },
  {
    name: 'Knowledge Base',
    href: '/knowledge-base',
    icon: BookOpen,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export const SimpleSidebar = ({ className }) => {
  return (
    <div className={cn('w-16 bg-teal-600 flex flex-col items-center py-4 space-y-4', className)}>
      {/* Logo */}
      <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center mb-4">
        <MessageSquare className="h-6 w-6 text-white" />
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
                isActive
                  ? 'bg-teal-700 text-white'
                  : 'text-teal-100 hover:bg-teal-700 hover:text-white'
              )}
              title={item.name}
            >
              <Icon className="h-6 w-6" />
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}