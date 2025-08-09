import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { dateUtils } from '@/utils/dateUtils'
import { cn } from '@/utils/cn'

export const DatePicker = ({ 
  selectedDate, 
  onDateChange, 
  className 
}) => {
  const today = dateUtils.getTodayString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayString = yesterday.toISOString().split('T')[0]

  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(currentDate.getDate() - 1)
    onDateChange(currentDate.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate)
    const nextDay = new Date(currentDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    // Don't allow future dates
    if (nextDay <= new Date()) {
      onDateChange(nextDay.toISOString().split('T')[0])
    }
  }

  const handleDateInputChange = (e) => {
    const newDate = e.target.value
    if (newDate && new Date(newDate) <= new Date()) {
      onDateChange(newDate)
    }
  }

  const quickDateOptions = [
    {
      label: 'Today',
      value: today,
      isActive: selectedDate === today
    },
    {
      label: 'Yesterday',
      value: yesterdayString,
      isActive: selectedDate === yesterdayString
    }
  ]

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      <div className="p-3">
        <div className="space-y-3">
          {/* Header with title */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Select Date
            </h3>
            <div className="text-xs text-gray-500">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Quick date buttons */}
          <div className="grid grid-cols-2 gap-2">
            {quickDateOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onDateChange(option.value)}
                className={cn(
                  'px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                  'border focus:outline-none focus:ring-1 focus:ring-blue-500',
                  option.isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Date navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousDay}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
              title="Previous day"
            >
              <ChevronLeft className="h-3 w-3 text-gray-600" />
            </button>

            <div className="flex-1">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateInputChange}
                max={today}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>

            <button
              onClick={handleNextDay}
              disabled={selectedDate >= today}
              className={cn(
                'p-1.5 rounded-md transition-colors border',
                selectedDate >= today
                  ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                  : 'hover:bg-gray-100 border-gray-200 text-gray-600'
              )}
              title="Next day"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}