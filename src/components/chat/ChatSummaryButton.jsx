import React from 'react'
import { FileText } from 'lucide-react'
import { cn } from '@/utils/cn'

export const ChatSummaryButton = ({ hasValidSummary, onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      disabled={!hasValidSummary}
      className={cn(
        'w-full py-2 px-3 rounded-md text-xs font-medium transition-all duration-200',
        'flex items-center justify-center gap-1.5',
        hasValidSummary
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50',
        isOpen && 'bg-blue-700'
      )}
    >
      <FileText className="h-3 w-3" />
      Chat Summary
    </button>
  )
}