'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Plus, Trash2, Send } from 'lucide-react'

type Question = {
  id: string
  questionText: string
  questionType: 'text' | 'rating' | 'multiple_choice' | 'yes_no'
  required: boolean
  options: string[]
}

const QUESTION_TYPES = [
  { value: 'text', label: 'Text Answer' },
  { value: 'rating', label: 'Rating (1-5)' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'yes_no', label: 'Yes / No' },
]

const QUESTIONNAIRE_TYPES = [
  { value: 'survey', label: 'Survey' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'exit', label: 'Exit Interview' },
  { value: 'performance', label: 'Performance Review' },
]

export default function NewQuestionnairePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('survey')
  const [anonymous, setAnonymous] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    { id: crypto.randomUUID(), questionText: '', questionType: 'text', required: true, options: [] },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function addQuestion() {
    setQuestions(prev => [...prev, {
      id: crypto.randomUUID(),
      questionText: '',
      questionType: 'text',
      required: true,
      options: [],
    }])
  }

  function removeQuestion(id: string) {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  function updateQuestion(id: string, updates: Partial<Question>) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  function addOption(questionId: string) {
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, options: [...q.options, ''] } : q
    ))
  }

  function updateOption(questionId: string, idx: number, value: string) {
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, options: q.options.map((o, i) => i === idx ? value : o) }
        : q
    ))
  }

  function removeOption(questionId: string, idx: number) {
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, options: q.options.filter((_, i) => i !== idx) }
        : q
    ))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/hr/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type,
          anonymous,
          dueDate: dueDate || null,
          questions: questions.map((q, i) => ({
            sortOrder: i + 1,
            questionText: q.questionText,
            questionType: q.questionType,
            required: q.required,
            optionsJson: q.options.length > 0 ? JSON.stringify(q.options) : null,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed to create questionnaire')
      const data = await res.json()
      router.push(`/hr/questionnaires/${data.id}`)
    } catch {
      setError('Failed to create questionnaire. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <TopBar title="New Questionnaire" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="flex items-center gap-3">
            <Link
              href="/hr/questionnaires"
              className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Questionnaires
            </Link>
          </div>

          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">New Questionnaire</h1>
            <p className="text-[13px] text-zinc-500">Build a survey, assessment, or form</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Basic info */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2">Details</p>

              <div>
                <label className="block text-[12px] text-zinc-400 mb-1">Title <span className="text-red-400">*</span></label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Q2 Employee Satisfaction Survey"
                  className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60"
                />
              </div>

              <div>
                <label className="block text-[12px] text-zinc-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional description shown to respondents"
                  rows={2}
                  className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500/60"
                  >
                    {QUESTIONNAIRE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500/60"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={e => setAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-blue-500"
                />
                <div>
                  <p className="text-[13px] text-zinc-200">Anonymous Responses</p>
                  <p className="text-[11px] text-zinc-500">Employee identities will not be recorded</p>
                </div>
              </label>
            </div>

            {/* Questions */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Questions</p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Question
                </button>
              </div>

              {questions.map((q, idx) => (
                <div key={q.id} className="border border-zinc-700/40 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 font-mono">Q{idx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    value={q.questionText}
                    onChange={e => updateQuestion(q.id, { questionText: e.target.value })}
                    placeholder="Enter question text..."
                    className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60"
                  />

                  <div className="flex items-center gap-3">
                    <select
                      value={q.questionType}
                      onChange={e => updateQuestion(q.id, { questionType: e.target.value as Question['questionType'] })}
                      className="bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-blue-500/60"
                    >
                      {QUESTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>

                    <label className="flex items-center gap-2 text-[12px] text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={e => updateQuestion(q.id, { required: e.target.checked })}
                        className="accent-blue-500"
                      />
                      Required
                    </label>
                  </div>

                  {q.questionType === 'multiple_choice' && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-zinc-500">Answer Options</p>
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            value={opt}
                            onChange={e => updateOption(q.id, i, e.target.value)}
                            placeholder={`Option ${i + 1}`}
                            className="flex-1 bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(q.id, i)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(q.id)}
                        className="text-[12px] text-blue-400 hover:underline"
                      >
                        + Add option
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <p className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</p>
            )}

            <div className="flex items-center gap-3 justify-end">
              <Link
                href="/hr/questionnaires"
                className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[13px] font-medium transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-medium transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Creating...' : 'Create Questionnaire'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </>
  )
}
