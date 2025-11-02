'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle } from 'lucide-react'

export default function TakeAssessmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [assessment, setAssessment] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssessment()
  }, [params.id])

  const fetchAssessment = async () => {
    try {
      const { assessmentsApi } = await import('@/lib/api')
      const data = await assessmentsApi.getById(params.id)
      setAssessment(data)
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Failed to fetch assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const { assessmentsApi } = await import('@/lib/api')
      await assessmentsApi.submit(params.id, answers)
      router.push('/dashboard/my-learning')
    } catch (error) {
      console.error('Failed to submit assessment:', error)
    }
  }

  if (loading) {
    return (
      <ModernDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ModernDashboardLayout>
    )
  }

  if (!assessment || questions.length === 0) {
    return (
      <ModernDashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">No assessment found</p>
        </div>
      </ModernDashboardLayout>
    )
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{assessment?.title || 'Assessment'}</h1>
            <div className="flex items-center text-gray-600">
              <Clock className="mr-2 h-5 w-5" />
              <span>45:00</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Question {currentQuestion + 1} of {questions.length}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{questions[currentQuestion].question}</h2>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion] === String(index)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={index}
                    checked={answers[currentQuestion] === String(index)}
                    onChange={(e) => setAnswers({ ...answers, [currentQuestion]: e.target.value })}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            {currentQuestion < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
