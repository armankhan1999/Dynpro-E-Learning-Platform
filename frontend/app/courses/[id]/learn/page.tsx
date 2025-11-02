'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

interface Module {
  id: string
  title: string
  order_index: number
  contents: ContentItem[]
}

interface ContentItem {
  id: string
  title: string
  content_type: string
  duration: number
  is_completed: boolean
}

export default function CoursePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const courseId = params.id as string

  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      const { coursesApi, contentApi, enrollmentsApi } = await import('@/lib/api')
      
      // Fetch course details
      const courseData = await coursesApi.getById(courseId)
      setCourse(courseData)
      
      // Fetch course modules and content
      const modulesData = await contentApi.getModules(courseId)
      setModules(modulesData.modules || [])
      
      // Fetch user progress
      const progressData = await enrollmentsApi.getProgress(courseId)
      setProgress(progressData.progress_percentage || 0)
      
      // Set initial content
      if (modulesData.modules && modulesData.modules.length > 0) {
        setCurrentModule(modulesData.modules[0])
        if (modulesData.modules[0].contents && modulesData.modules[0].contents.length > 0) {
          setCurrentContent(modulesData.modules[0].contents[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContentSelect = (module: Module, content: ContentItem) => {
    setCurrentModule(module)
    setCurrentContent(content)
  }

  const handleMarkComplete = async () => {
    if (currentContent && currentModule) {
      try {
        const { enrollmentsApi } = await import('@/lib/api')
        await enrollmentsApi.updateProgress(courseId, currentModule.id, {
          content_id: currentContent.id,
          completed: true
        })
        
        // Refresh progress
        const progressData = await enrollmentsApi.getProgress(courseId)
        setProgress(progressData.progress_percentage || 0)
        
        // Move to next content
        handleNextContent()
      } catch (error) {
        console.error('Failed to mark content as complete:', error)
      }
    }
  }

  const handleNextContent = () => {
    if (!currentModule || !currentContent) return

    const currentContentIndex = currentModule.contents.findIndex(c => c.id === currentContent.id)
    
    if (currentContentIndex < currentModule.contents.length - 1) {
      // Next content in same module
      setCurrentContent(currentModule.contents[currentContentIndex + 1])
    } else {
      // Move to next module
      const currentModuleIndex = modules.findIndex(m => m.id === currentModule.id)
      if (currentModuleIndex < modules.length - 1) {
        const nextModule = modules[currentModuleIndex + 1]
        setCurrentModule(nextModule)
        setCurrentContent(nextModule.contents[0])
      }
    }
  }

  const handlePreviousContent = () => {
    if (!currentModule || !currentContent) return

    const currentContentIndex = currentModule.contents.findIndex(c => c.id === currentContent.id)
    
    if (currentContentIndex > 0) {
      // Previous content in same module
      setCurrentContent(currentModule.contents[currentContentIndex - 1])
    } else {
      // Move to previous module
      const currentModuleIndex = modules.findIndex(m => m.id === currentModule.id)
      if (currentModuleIndex > 0) {
        const prevModule = modules[currentModuleIndex - 1]
        setCurrentModule(prevModule)
        setCurrentContent(prevModule.contents[prevModule.contents.length - 1])
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)}>
                ← Back to Course
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course?.title}</h1>
                <p className="text-sm text-gray-600">by {course?.instructor}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Progress: <span className="font-bold text-blue-600">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Course Content */}
        <aside className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Course Content</h2>
            
            {modules.map((module) => (
              <div key={module.id} className="mb-4">
                <div className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">📚</span>
                  {module.title}
                </div>
                
                <div className="space-y-1 ml-6">
                  {module.contents.map((content) => (
                    <button
                      key={content.id}
                      onClick={() => handleContentSelect(module, content)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        currentContent?.id === content.id
                          ? 'bg-blue-100 text-blue-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {content.is_completed && <span className="text-green-600">✓</span>}
                          <span className={content.is_completed ? 'line-through' : ''}>
                            {content.title}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.floor(content.duration / 60)}m
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {currentContent && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.title}</h2>
                
                {/* Content Display */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                  {currentContent.content_type === 'video' && (
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                        <p className="text-lg">Video Player</p>
                        <p className="text-sm text-gray-400 mt-2">Duration: {Math.floor(currentContent.duration / 60)} minutes</p>
                      </div>
                    </div>
                  )}
                  
                  {currentContent.content_type === 'document' && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700">Document content would be displayed here...</p>
                      <p className="text-gray-600 mt-4">This is where the actual course content, articles, or reading materials would appear.</p>
                    </div>
                  )}
                  
                  {currentContent.content_type === 'quiz' && (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 mx-auto mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Assessment</h3>
                      <p className="text-gray-600 mb-6">Test your knowledge with this quiz</p>
                      <Button size="lg">Start Quiz</Button>
                    </div>
                  )}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousContent}
                    disabled={modules[0].contents[0].id === currentContent.id}
                  >
                    ← Previous
                  </Button>
                  
                  <Button onClick={handleMarkComplete}>
                    Mark Complete & Continue →
                  </Button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
