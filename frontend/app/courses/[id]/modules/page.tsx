'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, Edit, Trash2, GripVertical, Video, FileText, File, Save, X, ClipboardList, FileQuestion } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { ButtonLoader } from '@/components/ui/content-loader'

interface ContentItem {
  id?: string
  title: string
  description?: string
  content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'link'
  content_url?: string
  content_data?: any
  duration_minutes?: number
  order_index: number
}

interface Module {
  id?: string
  title: string
  description: string
  order_index: number
  content_items: ContentItem[]
}

export default function CourseModulesPage({ params }: { params: { id: string } }) {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showModuleForm, setShowModuleForm] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [showContentForm, setShowContentForm] = useState<{ moduleIndex: number } | null>(null)
  const [saving, setSaving] = useState(false)

  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: ''
  })

  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    content_type: 'document' as 'video' | 'document' | 'quiz' | 'assignment' | 'link',
    content_url: '',
    duration_minutes: 0,
    order_index: 0,
    // Document/Text content
    text_content: '',
    // Quiz content
    quiz_questions: [
      {
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: 0,
        points: 1
      }
    ],
    // Assignment content
    assignment_instructions: '',
    assignment_max_points: 100,
    assignment_submission_type: 'text'
  })

  useEffect(() => {
    fetchModules()
  }, [params.id])

  const fetchModules = async () => {
    try {
      const { coursesApi } = await import('@/lib/api')
      const data = await coursesApi.getModules(params.id)
      setModules(data.modules || [])
    } catch (error) {
      console.error('Failed to fetch modules:', error)
      showToast.error('Failed to load modules')
    } finally {
      setLoading(false)
    }
  }

  const handleAddModule = () => {
    setModuleForm({ title: '', description: '' })
    setEditingModule(null)
    setShowModuleForm(true)
  }

  const handleEditModule = (module: Module, index: number) => {
    setModuleForm({ title: module.title, description: module.description })
    setEditingModule({ ...module, order_index: index })
    setShowModuleForm(true)
  }

  const handleSaveModule = async () => {
    if (!moduleForm.title.trim()) {
      showToast.warning('Please enter a module title')
      return
    }

    setSaving(true)
    try {
      const { coursesApi } = await import('@/lib/api')

      if (editingModule) {
        await coursesApi.updateModule(params.id, editingModule.id!, {
          ...moduleForm,
          order_index: editingModule.order_index
        })
        showToast.success('Module updated successfully')
      } else {
        const moduleData = {
          course_id: params.id,
          title: moduleForm.title,
          description: moduleForm.description,
          order_index: modules.length
        }
        await coursesApi.createModule(params.id, moduleData)
        showToast.success('Module created successfully')
      }

      setShowModuleForm(false)
      fetchModules()
    } catch (error: any) {
      console.error('Failed to save module:', error)
      let errorMessage = 'Failed to save module'
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ')
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        }
      }
      showToast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? All content items will be deleted.')) {
      return
    }

    try {
      const { coursesApi } = await import('@/lib/api')
      await coursesApi.deleteModule(params.id, moduleId)
      showToast.success('Module deleted successfully')
      fetchModules()
    } catch (error) {
      console.error('Failed to delete module:', error)
      showToast.error('Failed to delete module')
    }
  }

  const handleAddContent = (moduleIndex: number) => {
    setContentForm({
      title: '',
      description: '',
      content_type: 'document',
      content_url: '',
      duration_minutes: 0,
      order_index: modules[moduleIndex].content_items.length,
      text_content: '',
      quiz_questions: [
        {
          question: '',
          type: 'multiple_choice',
          options: ['', '', '', ''],
          correct_answer: 0,
          points: 1
        }
      ],
      assignment_instructions: '',
      assignment_max_points: 100,
      assignment_submission_type: 'text'
    })
    setShowContentForm({ moduleIndex })
  }

  const handleSaveContent = async () => {
    if (!contentForm.title.trim()) {
      showToast.warning('Please enter a content title')
      return
    }

    // Validate based on content type
    if (contentForm.content_type === 'document' && !contentForm.text_content.trim()) {
      showToast.warning('Please enter text content for the lesson')
      return
    }

    if (contentForm.content_type === 'quiz') {
      const hasEmptyQuestions = contentForm.quiz_questions.some(q => !q.question.trim())
      if (hasEmptyQuestions) {
        showToast.warning('Please fill in all quiz questions')
        return
      }
    }

    if (contentForm.content_type === 'assignment' && !contentForm.assignment_instructions.trim()) {
      showToast.warning('Please enter assignment instructions')
      return
    }

    if (!showContentForm) return

    setSaving(true)
    try {
      const { coursesApi } = await import('@/lib/api')
      const module = modules[showContentForm.moduleIndex]

      // Build content_data based on type
      let contentData: any = {}

      switch (contentForm.content_type) {
        case 'document':
          contentData = {
            text_content: contentForm.text_content
          }
          break
        case 'quiz':
          contentData = {
            questions: contentForm.quiz_questions.filter(q => q.question.trim())
          }
          break
        case 'assignment':
          contentData = {
            instructions: contentForm.assignment_instructions,
            max_points: contentForm.assignment_max_points,
            submission_type: contentForm.assignment_submission_type
          }
          break
        case 'video':
        case 'link':
          contentData = {
            url: contentForm.content_url
          }
          break
      }

      const payload = {
        module_id: module.id,
        title: contentForm.title,
        description: contentForm.description || null,
        content_type: contentForm.content_type,
        content_url: contentForm.content_url || null,
        duration_minutes: contentForm.duration_minutes || null,
        order_index: contentForm.order_index,
        content_data: contentData
      }

      await coursesApi.addContentItem(params.id, module.id!, payload)
      showToast.success('Content added successfully')
      setShowContentForm(null)
      fetchModules()
    } catch (error: any) {
      console.error('Failed to add content:', error)
      let errorMessage = 'Failed to add content'
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ')
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        }
      }
      showToast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteContent = async (moduleId: string, contentId: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) {
      return
    }

    try {
      const { coursesApi } = await import('@/lib/api')
      await coursesApi.deleteContentItem(params.id, moduleId, contentId)
      showToast.success('Content deleted successfully')
      fetchModules()
    } catch (error) {
      console.error('Failed to delete content:', error)
      showToast.error('Failed to delete content')
    }
  }

  // Quiz question handlers
  const addQuizQuestion = () => {
    setContentForm({
      ...contentForm,
      quiz_questions: [
        ...contentForm.quiz_questions,
        {
          question: '',
          type: 'multiple_choice',
          options: ['', '', '', ''],
          correct_answer: 0,
          points: 1
        }
      ]
    })
  }

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...contentForm.quiz_questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setContentForm({ ...contentForm, quiz_questions: updatedQuestions })
  }

  const updateQuizOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...contentForm.quiz_questions]
    updatedQuestions[questionIndex].options[optionIndex] = value
    setContentForm({ ...contentForm, quiz_questions: updatedQuestions })
  }

  const removeQuizQuestion = (index: number) => {
    if (contentForm.quiz_questions.length === 1) {
      showToast.warning('Quiz must have at least one question')
      return
    }
    setContentForm({
      ...contentForm,
      quiz_questions: contentForm.quiz_questions.filter((_, i) => i !== index)
    })
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
        return <File className="h-5 w-5 text-gray-600" />
      default:
        return <File className="h-5 w-5 text-gray-600" />
    }
  }

  // Render content form based on type
  const renderContentTypeForm = () => {
    switch (contentForm.content_type) {
      case 'document':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Content *</label>
            <textarea
              rows={12}
              value={contentForm.text_content}
              onChange={(e) => setContentForm({ ...contentForm, text_content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter your lesson content here. You can use plain text or markdown formatting..."
            />
            <p className="text-xs text-gray-500 mt-1">Supports basic markdown formatting</p>
          </div>
        )

      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Quiz Questions *</label>
              <Button type="button" variant="outline" size="sm" onClick={addQuizQuestion}>
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </Button>
            </div>

            {contentForm.quiz_questions.map((question, qIndex) => (
              <div key={qIndex} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <label className="text-sm font-medium text-gray-700">Question {qIndex + 1}</label>
                  {contentForm.quiz_questions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuizQuestion(qIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={question.question}
                  onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your question"
                />

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Answer Options</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={question.correct_answer === oIndex}
                        onChange={() => updateQuizQuestion(qIndex, 'correct_answer', oIndex)}
                        className="text-blue-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">Select the correct answer</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Points</label>
                    <input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => updateQuizQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'assignment':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Instructions *</label>
              <textarea
                rows={6}
                value={contentForm.assignment_instructions}
                onChange={(e) => setContentForm({ ...contentForm, assignment_instructions: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what students need to do for this assignment..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Points</label>
                <input
                  type="number"
                  min="1"
                  value={contentForm.assignment_max_points}
                  onChange={(e) => setContentForm({ ...contentForm, assignment_max_points: parseInt(e.target.value) || 100 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Submission Type</label>
                <select
                  value={contentForm.assignment_submission_type}
                  onChange={(e) => setContentForm({ ...contentForm, assignment_submission_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text Submission</option>
                  <option value="file">File Upload</option>
                  <option value="url">URL/Link</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video URL *</label>
              <input
                type="url"
                value={contentForm.content_url}
                onChange={(e) => setContentForm({ ...contentForm, content_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">Supports YouTube, Vimeo, and direct video links</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <input
                type="number"
                min="0"
                value={contentForm.duration_minutes}
                onChange={(e) => setContentForm({ ...contentForm, duration_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15"
              />
            </div>
          </div>
        )

      case 'link':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resource URL *</label>
            <input
              type="url"
              value={contentForm.content_url}
              onChange={(e) => setContentForm({ ...contentForm, content_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/resource"
            />
            <p className="text-xs text-gray-500 mt-1">External resource or document link</p>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <ModernDashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </ModernDashboardLayout>
    )
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="mr-3 h-8 w-8 text-blue-600" />
              Course Modules
            </h1>
            <p className="text-gray-600 mt-2">Organize your course content into modules and lessons</p>
          </div>
          <Button onClick={handleAddModule} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Module
          </Button>
        </div>

        {/* Module List */}
        <div className="space-y-6">
          {modules.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
              <p className="text-gray-600 mb-6">Start building your course by adding modules</p>
              <Button onClick={handleAddModule} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add First Module
              </Button>
            </div>
          ) : (
            modules.map((module, moduleIndex) => (
              <div key={module.id || moduleIndex} className="bg-white rounded-xl shadow-lg p-6">
                {/* Module Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <GripVertical className="h-6 w-6 text-gray-400 cursor-move mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Module {moduleIndex + 1}: {module.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{module.description}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {module.content_items?.length || 0} content items
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditModule(module, moduleIndex)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteModule(module.id!)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Content Items */}
                <div className="ml-10 space-y-3">
                  {module.content_items && module.content_items.length > 0 ? (
                    module.content_items.map((item, itemIndex) => (
                      <div key={item.id || itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getContentIcon(item.content_type)}
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-500">
                              {item.content_type} • {item.duration_minutes || 0} mins
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteContent(module.id!, item.id!)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No content items yet</p>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddContent(moduleIndex)}
                    className="w-full mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Content
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Module Form Modal */}
        {showModuleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingModule ? 'Edit Module' : 'Add New Module'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module Title *</label>
                  <input
                    type="text"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Introduction to React"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What will students learn in this module?"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSaveModule} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {saving ? <ButtonLoader /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save Module'}
                </Button>
                <Button variant="outline" onClick={() => setShowModuleForm(false)} disabled={saving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Form Modal */}
        {showContentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Content Item</h2>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Title *</label>
                    <input
                      type="text"
                      value={contentForm.title}
                      onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Lesson 1: Getting Started"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={2}
                      value={contentForm.description}
                      onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of this content"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Type *</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { value: 'document', label: 'Text Lesson', icon: FileText },
                        { value: 'video', label: 'Video', icon: Video },
                        { value: 'quiz', label: 'Quiz', icon: FileQuestion },
                        { value: 'assignment', label: 'Assignment', icon: ClipboardList },
                        { value: 'link', label: 'Resource Link', icon: File }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setContentForm({ ...contentForm, content_type: value as any })}
                          className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                            contentForm.content_type === value
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`h-6 w-6 ${contentForm.content_type === value ? 'text-blue-600' : 'text-gray-600'}`} />
                          <span className={`text-xs font-medium ${contentForm.content_type === value ? 'text-blue-600' : 'text-gray-600'}`}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Type-specific Form */}
                <div className="border-t pt-6">
                  {renderContentTypeForm()}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSaveContent} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {saving ? <ButtonLoader /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? 'Adding...' : 'Add Content'}
                </Button>
                <Button variant="outline" onClick={() => setShowContentForm(null)} disabled={saving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  )
}
