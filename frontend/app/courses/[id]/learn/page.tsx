'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ButtonLoader } from '@/components/ui/content-loader'
import { useAuth } from '@/lib/auth-context'
import { showToast, toastMessages } from '@/lib/toast'
import { BookOpen, Trash2, Edit2, Save, X, StickyNote, CheckCircle, Circle, Video, FileText, FileQuestion, ClipboardList, ExternalLink } from 'lucide-react'

interface Module {
  id: string
  title: string
  description?: string
  order_index: number
  content_items: ContentItem[]
}

interface ContentItem {
  id: string
  title: string
  description?: string
  content_type: string
  content_url?: string
  content_data?: any
  duration_minutes?: number
  order_index: number
  is_completed?: boolean
}

interface Note {
  id: string
  content: string
  content_id: string
  created_at: string
  updated_at: string
}

interface QuizAnswer {
  [questionIndex: number]: number
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

  // Notes state
  const [notes, setNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [showNotes, setShowNotes] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editNoteContent, setEditNoteContent] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [enrollmentData, setEnrollmentData] = useState<any>(null)
  const [markingComplete, setMarkingComplete] = useState(false)

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  useEffect(() => {
    if (currentContent && enrollmentId) {
      fetchNotes()
      // Reset quiz state when switching content
      setQuizAnswers({})
      setQuizSubmitted(false)
      setQuizScore(0)
    }
  }, [currentContent, enrollmentId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      const { coursesApi, enrollmentsApi } = await import('@/lib/api')

      // Fetch course details
      const courseData = await coursesApi.getById(courseId)
      setCourse(courseData)

      // Fetch course modules and content
      const modulesData = await coursesApi.getModules(courseId)
      setModules(modulesData.modules || [])

      // Fetch enrollment and progress
      try {
        const enrollments = await enrollmentsApi.getMyEnrollments()
        const enrollment = enrollments.find((e: any) => e.course_id === courseId)

        if (enrollment) {
          setEnrollmentId(enrollment.id)
          setEnrollmentData(enrollment)
          setProgress(enrollment.progress_percentage || 0)

          // Fetch progress for this enrollment
          const progressData = await enrollmentsApi.getProgress(enrollment.id)
          const completedSet = new Set<string>()
          progressData.forEach((p: any) => {
            if (p.is_completed) {
              completedSet.add(p.content_item_id)
            }
          })
          setCompletedItems(completedSet)

          // Update modules with completion status
          const updatedModules = modulesData.modules.map((module: Module) => ({
            ...module,
            content_items: module.content_items.map((item: ContentItem) => ({
              ...item,
              is_completed: completedSet.has(item.id)
            }))
          }))
          setModules(updatedModules)
        }
      } catch (enrollError) {
        console.error('Failed to fetch enrollment data:', enrollError)
      }

      // Set initial content
      if (modulesData.modules && modulesData.modules.length > 0) {
        setCurrentModule(modulesData.modules[0])
        if (modulesData.modules[0].content_items && modulesData.modules[0].content_items.length > 0) {
          setCurrentContent(modulesData.modules[0].content_items[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error)
      showToast.error(toastMessages.loadError('course data'))
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async () => {
    // Notes implementation placeholder
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !currentContent) return
    // Implementation placeholder
    showToast.success('Note saved successfully')
    setNewNote('')
  }

  const handleContentSelect = (module: Module, content: ContentItem) => {
    setCurrentModule(module)
    setCurrentContent(content)
  }

  const handleMarkComplete = async () => {
    if (!enrollmentId || !currentContent) return

    try {
      setMarkingComplete(true)
      const { enrollmentsApi } = await import('@/lib/api')

      // Mark content as complete
      const result = await enrollmentsApi.markContentComplete(enrollmentId, currentContent.id)

      // Update local state
      setCompletedItems(prev => new Set(prev).add(currentContent.id))
      setProgress(result.enrollment_progress || progress)

      // Update modules to reflect completion
      setModules(prevModules =>
        prevModules.map(module => ({
          ...module,
          content_items: module.content_items.map(item =>
            item.id === currentContent.id ? { ...item, is_completed: true } : item
          )
        }))
      )

      // Show different message based on progress
      if (result.enrollment_progress >= 100) {
        showToast.success('🎉 Congratulations! You completed the course! Your certificate is being generated.')
      } else {
        showToast.success('Content marked as complete!')
      }

      // Move to next content
      handleNextContent()
    } catch (error: any) {
      console.error('Failed to mark content complete:', error)
      showToast.error(error.response?.data?.detail || 'Failed to mark content as complete')
    } finally {
      setMarkingComplete(false)
    }
  }

  const handleNextContent = () => {
    if (!currentModule || !currentContent) return

    const currentContentIndex = currentModule.content_items.findIndex(c => c.id === currentContent.id)

    if (currentContentIndex < currentModule.content_items.length - 1) {
      setCurrentContent(currentModule.content_items[currentContentIndex + 1])
    } else {
      const currentModuleIndex = modules.findIndex(m => m.id === currentModule.id)
      if (currentModuleIndex < modules.length - 1) {
        const nextModule = modules[currentModuleIndex + 1]
        setCurrentModule(nextModule)
        if (nextModule.content_items.length > 0) {
          setCurrentContent(nextModule.content_items[0])
        }
      }
    }
  }

  const handlePreviousContent = () => {
    if (!currentModule || !currentContent) return

    const currentContentIndex = currentModule.content_items.findIndex(c => c.id === currentContent.id)

    if (currentContentIndex > 0) {
      setCurrentContent(currentModule.content_items[currentContentIndex - 1])
    } else {
      const currentModuleIndex = modules.findIndex(m => m.id === currentModule.id)
      if (currentModuleIndex > 0) {
        const prevModule = modules[currentModuleIndex - 1]
        setCurrentModule(prevModule)
        if (prevModule.content_items.length > 0) {
          setCurrentContent(prevModule.content_items[prevModule.content_items.length - 1])
        }
      }
    }
  }

  const handleQuizSubmit = () => {
    if (!currentContent?.content_data?.questions) return

    const questions = currentContent.content_data.questions
    let correct = 0

    questions.forEach((q: any, index: number) => {
      if (quizAnswers[index] === q.correct_answer) {
        correct++
      }
    })

    const scorePercent = Math.round((correct / questions.length) * 100)
    setQuizScore(scorePercent)
    setQuizSubmitted(true)

    if (scorePercent >= 70) {
      showToast.success(`Great job! You scored ${scorePercent}%`)
    } else {
      showToast.warning(`You scored ${scorePercent}%. Try reviewing the material again.`)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-blue-600" />
      case 'document':
        return <FileText className="h-5 w-5 text-green-600" />
      case 'quiz':
        return <FileQuestion className="h-5 w-5 text-purple-600" />
      case 'assignment':
        return <ClipboardList className="h-5 w-5 text-orange-600" />
      case 'link':
        return <ExternalLink className="h-5 w-5 text-gray-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const renderContent = () => {
    if (!currentContent) return null

    // Text Lesson / Document
    if (currentContent.content_type === 'document') {
      const textContent = currentContent.content_data?.text_content || ''
      return (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose max-w-none">
            {textContent.split('\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="text-gray-700 mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )
    }

    // Video
    if (currentContent.content_type === 'video') {
      const videoUrl = currentContent.content_data?.url || currentContent.content_url

      // Extract video ID for YouTube/Vimeo
      let embedUrl = videoUrl
      if (videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be')) {
        const videoId = videoUrl.includes('youtu.be')
          ? videoUrl.split('/').pop()
          : new URL(videoUrl).searchParams.get('v')
        embedUrl = `https://www.youtube.com/embed/${videoId}`
      } else if (videoUrl?.includes('vimeo.com')) {
        const videoId = videoUrl.split('/').pop()
        embedUrl = `https://player.vimeo.com/video/${videoId}`
      }

      return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="w-20 h-20 mx-auto mb-4" />
                <p className="text-lg">No video URL provided</p>
              </div>
            </div>
          )}
        </div>
      )
    }

    // Quiz
    if (currentContent.content_type === 'quiz') {
      const questions = currentContent.content_data?.questions || []

      return (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <FileQuestion className="h-8 w-8 mr-3 text-purple-600" />
              Quiz
            </h3>
            <p className="text-gray-600">Test your knowledge on this topic</p>
          </div>

          {questions.length > 0 ? (
            <div className="space-y-6">
              {questions.map((question: any, qIndex: number) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold mr-3">
                      {qIndex + 1}
                    </span>
                    <p className="text-lg font-medium text-gray-900 flex-1">{question.question}</p>
                    {quizSubmitted && (
                      <span className={`ml-2 ${quizAnswers[qIndex] === question.correct_answer ? 'text-green-600' : 'text-red-600'}`}>
                        {quizAnswers[qIndex] === question.correct_answer ? '✓' : '✗'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 ml-11">
                    {question.options.map((option: string, oIndex: number) => {
                      const isSelected = quizAnswers[qIndex] === oIndex
                      const isCorrect = question.correct_answer === oIndex
                      const showCorrect = quizSubmitted && isCorrect
                      const showIncorrect = quizSubmitted && isSelected && !isCorrect

                      return (
                        <label
                          key={oIndex}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            showCorrect ? 'border-green-500 bg-green-50' :
                            showIncorrect ? 'border-red-500 bg-red-50' :
                            isSelected ? 'border-purple-500 bg-purple-50' :
                            'border-gray-200 hover:border-gray-300'
                          } ${quizSubmitted ? 'cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            checked={isSelected}
                            onChange={() => {
                              if (!quizSubmitted) {
                                setQuizAnswers({ ...quizAnswers, [qIndex]: oIndex })
                              }
                            }}
                            disabled={quizSubmitted}
                            className="mr-3"
                          />
                          <span className={`flex-1 ${showCorrect || showIncorrect ? 'font-medium' : ''}`}>
                            {option}
                          </span>
                          {showCorrect && <CheckCircle className="h-5 w-5 text-green-600 ml-2" />}
                        </label>
                      )
                    })}
                  </div>

                  {quizSubmitted && quizAnswers[qIndex] !== question.correct_answer && (
                    <div className="ml-11 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Correct answer:</strong> {question.options[question.correct_answer]}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {!quizSubmitted ? (
                <Button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length !== questions.length}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  Submit Quiz
                </Button>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    Your Score: {quizScore}%
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {quizScore >= 70 ? 'Great job! You passed the quiz.' : 'Keep learning and try again.'}
                  </p>
                  <Button
                    onClick={() => {
                      setQuizAnswers({})
                      setQuizSubmitted(false)
                    }}
                    variant="outline"
                  >
                    Retake Quiz
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No quiz questions available</p>
          )}
        </div>
      )
    }

    // Assignment
    if (currentContent.content_type === 'assignment') {
      const instructions = currentContent.content_data?.instructions || ''
      const maxPoints = currentContent.content_data?.max_points || 100
      const submissionType = currentContent.content_data?.submission_type || 'text'

      return (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <ClipboardList className="h-8 w-8 mr-3 text-orange-600" />
              Assignment
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Max Points: {maxPoints}</span>
              <span>•</span>
              <span className="capitalize">Submission: {submissionType}</span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Instructions:</h4>
            <div className="prose max-w-none">
              {instructions.split('\n').map((line: string, idx: number) => (
                <p key={idx} className="text-gray-700 mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Your Submission:</h4>
            {submissionType === 'text' && (
              <textarea
                className="w-full border border-gray-300 rounded-lg p-4 min-h-[200px] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your answer here..."
              />
            )}
            {submissionType === 'file' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input type="file" id="file-upload" className="hidden" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm">Click to upload or drag and drop</p>
                  </div>
                </label>
              </div>
            )}
            {submissionType === 'url' && (
              <input
                type="url"
                className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://example.com/your-submission"
              />
            )}
            <Button className="mt-4 bg-orange-600 hover:bg-orange-700">
              Submit Assignment
            </Button>
          </div>
        </div>
      )
    }

    // Link / Resource
    if (currentContent.content_type === 'link') {
      const resourceUrl = currentContent.content_data?.url || currentContent.content_url

      return (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center py-8">
            <ExternalLink className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">External Resource</h3>
            {currentContent.description && (
              <p className="text-gray-600 mb-6">{currentContent.description}</p>
            )}
            {resourceUrl && (
              <a
                href={resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Resource
                <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  const isFirstContent = modules[0]?.content_items[0]?.id === currentContent?.id
  const lastModule = modules[modules.length - 1]
  const isLastContent = lastModule?.content_items[lastModule.content_items.length - 1]?.id === currentContent?.id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)}>
                ← Back to Course
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course?.title}</h1>
                <p className="text-sm text-gray-600">{currentModule?.title}</p>
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
                <div className="font-semibold text-gray-900 mb-2 px-2 py-1 bg-gray-50 rounded">
                  {module.title}
                </div>

                <div className="space-y-1">
                  {module.content_items?.map((content) => (
                    <button
                      key={content.id}
                      onClick={() => handleContentSelect(module, content)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                        currentContent?.id === content.id
                          ? 'bg-blue-100 text-blue-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {getContentIcon(content.content_type)}
                      <span className="flex-1">{content.title}</span>
                      {content.is_completed && <CheckCircle className="h-4 w-4 text-green-600" />}
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
            {currentContent ? (
              <>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentContent.title}</h2>
                  {currentContent.description && (
                    <p className="text-gray-600">{currentContent.description}</p>
                  )}
                  {currentContent.duration_minutes && (
                    <p className="text-sm text-gray-500 mt-2">
                      Duration: {currentContent.duration_minutes} minutes
                    </p>
                  )}
                </div>

                {/* Content Display */}
                {renderContent()}

                {/* Navigation Controls */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousContent}
                    disabled={isFirstContent || markingComplete}
                  >
                    ← Previous
                  </Button>

                  {currentContent?.is_completed ? (
                    <Button
                      onClick={handleNextContent}
                      disabled={isLastContent}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLastContent ? '✓ Completed!' : 'Continue →'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleMarkComplete}
                      disabled={markingComplete}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {markingComplete ? (
                        <><ButtonLoader /> Marking Complete...</>
                      ) : isLastContent ? (
                        'Complete Course!'
                      ) : (
                        'Mark Complete & Continue →'
                      )}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No content available</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
