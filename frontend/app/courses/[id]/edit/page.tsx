'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { BookOpen, Save, X, Plus, Trash2 } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { ButtonLoader } from '@/components/ui/content-loader'

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [learningObjectives, setLearningObjectives] = useState([''])
  const [prerequisites, setPrerequisites] = useState([''])
  const [tags, setTags] = useState([''])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    duration_hours: '',
    thumbnail_url: '',
    intro_video_url: '',
    is_published: false,
    max_students: '',
    language: 'English'
  })

  useEffect(() => {
    fetchCourseData()
  }, [params.id])

  const fetchCourseData = async () => {
    try {
      const { coursesApi } = await import('@/lib/api')
      const course = await coursesApi.getById(params.id)

      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        level: course.level || 'beginner',
        duration_hours: course.duration_hours?.toString() || '',
        thumbnail_url: course.thumbnail_url || '',
        intro_video_url: course.intro_video_url || '',
        is_published: course.is_published || false,
        max_students: course.max_students?.toString() || '',
        language: course.language || 'English'
      })

      setLearningObjectives(course.learning_objectives?.length > 0 ? course.learning_objectives : [''])
      setPrerequisites(course.prerequisites?.length > 0 ? course.prerequisites : [''])
      setTags(course.tags?.length > 0 ? course.tags : [''])

    } catch (error) {
      console.error('Failed to fetch course:', error)
      showToast.error('Failed to load course data')
      router.back()
    } finally {
      setLoading(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      showToast.warning('Please enter a course title')
      return
    }

    if (!formData.description.trim()) {
      showToast.warning('Please enter a course description')
      return
    }

    if (!formData.category.trim()) {
      showToast.warning('Please enter a category')
      return
    }

    setSaving(true)
    try {
      const { coursesApi } = await import('@/lib/api')

      const courseData = {
        ...formData,
        duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : null,
        max_students: formData.max_students ? parseInt(formData.max_students) : null,
        learning_objectives: learningObjectives.filter(obj => obj.trim()),
        prerequisites: prerequisites.filter(pre => pre.trim()),
        tags: tags.filter(tag => tag.trim())
      }

      await coursesApi.update(params.id, courseData)
      showToast.success('Course updated successfully')
      router.push(`/courses/${params.id}/modules`)
    } catch (error: any) {
      console.error('Failed to update course:', error)
      showToast.error(error.response?.data?.detail || 'Failed to update course')
    } finally {
      setSaving(false)
    }
  }

  const addLearningObjective = () => {
    setLearningObjectives([...learningObjectives, ''])
  }

  const removeLearningObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index))
  }

  const updateLearningObjective = (index: number, value: string) => {
    const updated = [...learningObjectives]
    updated[index] = value
    setLearningObjectives(updated)
  }

  const addPrerequisite = () => {
    setPrerequisites([...prerequisites, ''])
  }

  const removePrerequisite = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index))
  }

  const updatePrerequisite = (index: number, value: string) => {
    const updated = [...prerequisites]
    updated[index] = value
    setPrerequisites(updated)
  }

  const addTag = () => {
    setTags([...tags, ''])
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const updateTag = (index: number, value: string) => {
    const updated = [...tags]
    updated[index] = value
    setTags(updated)
  }

  if (loading) {
    return (
      <ModernDashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </ModernDashboardLayout>
    )
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpen className="mr-3 h-8 w-8 text-blue-600" />
            Edit Course
          </h1>
          <p className="mt-2 text-gray-600">Update course information and settings</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Introduction to Python Programming"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what employees will learn in this course..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Programming, Design, Business"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Employees</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Media</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Intro Video URL</label>
                <input
                  type="url"
                  value={formData.intro_video_url}
                  onChange={(e) => setFormData({ ...formData, intro_video_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Learning Objectives</h2>
              {learningObjectives.map((obj, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => updateLearningObjective(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What will employees learn?"
                  />
                  {learningObjectives.length > 1 && (
                    <Button type="button" variant="outline" onClick={() => removeLearningObjective(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLearningObjective}>
                <Plus className="mr-2 h-4 w-4" />
                Add Learning Objective
              </Button>
            </div>

            {/* Prerequisites */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Prerequisites</h2>
              {prerequisites.map((pre, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={pre}
                    onChange={(e) => updatePrerequisite(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What should employees know beforehand?"
                  />
                  {prerequisites.length > 1 && (
                    <Button type="button" variant="outline" onClick={() => removePrerequisite(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addPrerequisite}>
                <Plus className="mr-2 h-4 w-4" />
                Add Prerequisite
              </Button>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tag"
                    />
                    {tags.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeTag(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="mr-2 h-4 w-4" />
                Add Tag
              </Button>
            </div>

            {/* Publish Status */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Publish Settings</h2>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_published" className="ml-2 text-sm font-medium text-gray-700">
                  Publish course (employees can enroll)
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {saving ? <ButtonLoader /> : <Save className="mr-2 h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ModernDashboardLayout>
  )
}
