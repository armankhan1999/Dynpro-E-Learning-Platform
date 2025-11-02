'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Calendar as CalendarIcon, Clock, Video, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarEvent {
  id: string
  title: string
  type: 'live_session' | 'assignment' | 'assessment' | 'course_deadline'
  start_time: string
  end_time: string
  course_title: string
  location?: string
  meeting_url?: string
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
    try {
      const { liveSessionsApi } = await import('@/lib/api')
      const data = await liveSessionsApi.getCalendarEvents()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'live_session': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'assignment': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'assessment': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'course_deadline': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="mr-3 h-8 w-8 text-blue-600" />
            Calendar
          </h1>
          <p className="mt-2 text-gray-600">Manage your schedule and upcoming events</p>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button onClick={previousMonth} variant="outline" className="p-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button onClick={nextMonth} variant="outline" className="p-2">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex gap-2">
              {(['month', 'week', 'day'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    view === v
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const date = new Date(year, month, day)
              const dayEvents = getEventsForDate(date)
              const isToday = date.toDateString() === new Date().toDateString()
              const isSelected = selectedDate?.toDateString() === date.toDateString()

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square border rounded-lg p-2 cursor-pointer transition-all ${
                    isToday ? 'border-blue-600 bg-blue-50' :
                    isSelected ? 'border-blue-400 bg-blue-50' :
                    'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${getEventColor(event.type)}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-600">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h3>
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`border-l-4 p-4 rounded-r-lg ${getEventColor(event.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{event.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{event.course_title}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {new Date(event.start_time).toLocaleString()}
                        </span>
                        {event.meeting_url && (
                          <a
                            href={event.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <Video className="mr-1 h-4 w-4" />
                            Join Meeting
                          </a>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No upcoming events
            </div>
          )}
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
