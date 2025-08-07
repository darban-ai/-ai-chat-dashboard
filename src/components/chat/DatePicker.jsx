import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
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
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Quick date buttons */}
          <div className="flex space-x-2">
            {quickDateOptions.map((option) => (
              <Button
                key={option.value}
                variant={option.isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDateChange(option.value)}
                className="flex-1"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Date navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousDay}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={handleDateInputChange}
                max={today}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextDay}
              disabled={selectedDate >= today}
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected date display */}
          <div className="text-center">
            <div className="inline-block bg-teal-500 text-white px-4 py-2 rounded-lg">
              <p className="font-medium">
                {selectedDate === today ? 'Today' : selectedDate === yesterdayString ? 'Yesterday' : dateUtils.formatDate(selectedDate, 'MMMM dd yyyy')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}