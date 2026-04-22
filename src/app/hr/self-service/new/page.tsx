'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Upload, Send } from 'lucide-react'

const REQUEST_TYPES = [
  { value: 'time_off', label: 'Time Off Request', description: 'Request vacation, sick, or personal days' },
  { value: 'address_change', label: 'Address Change', description: 'Update your home address on file' },
  { value: 'benefit_change', label: 'Benefit Change', description: 'Modify health, dental, or 401k enrollment' },
  { value: 'document', label: 'Document Request', description: 'Request employment verification, tax forms, etc.' },
  { value: 'expense', label: 'Expense Report', description: 'Submit a business expense for reimbursement' },
]

export default function NewSelfServiceRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultType = searchParams.get('type') ?? 'time_off'

  const [requestType, setRequestType] = useState(defaultType)
  const [details, setDetails] = useState('')
  const [fileName, setFileName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/hr/self-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType,
          details,
          // employeeId would come from session in production
          employeeId: 'placeholder-employee-id',
        }),
      })
      if (!res.ok) throw new Error('Failed to submit request')
      router.push('/hr/self-service')
    } catch (err) {
      setError('Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <TopBar title="New Self Service Request" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Link
              href="/hr/self-service"
              className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Self Service
            </Link>
          </div>

          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">New Request</h1>
            <p className="text-[13px] text-zinc-500">Submit a request for HR review</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Request Type */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2 mb-3">Request Type</p>
              <div className="grid grid-cols-1 gap-2">
                {REQUEST_TYPES.map(t => (
                  <label
                    key={t.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      requestType === t.value
                        ? 'border-blue-500/60 bg-blue-500/10'
                        : 'border-zinc-800/40 bg-zinc-900/40 hover:border-zinc-700/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="requestType"
                      value={t.value}
                      checked={requestType === t.value}
                      onChange={() => setRequestType(t.value)}
                      className="mt-0.5 accent-blue-500"
                    />
                    <div>
                      <p className="text-[13px] font-medium text-zinc-200">{t.label}</p>
                      <p className="text-[12px] text-zinc-500">{t.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2 mb-3">Details</p>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Describe your request in detail..."
                rows={5}
                className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md px-3 py-2.5 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60 resize-none"
              />
            </div>

            {/* Attachment */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2 mb-3">Attachment (optional)</p>
              <label className="flex items-center gap-3 p-3 border border-dashed border-zinc-700/60 rounded-lg cursor-pointer hover:border-zinc-600/60 transition-colors">
                <Upload className="w-4 h-4 text-zinc-500" />
                <span className="text-[13px] text-zinc-400">
                  {fileName || 'Click to attach a file'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
                />
              </label>
              <p className="text-[11px] text-zinc-600 mt-2">Supported: PDF, PNG, JPG, DOCX (max 10MB)</p>
            </div>

            {error && (
              <p className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</p>
            )}

            <div className="flex items-center gap-3 justify-end">
              <Link
                href="/hr/self-service"
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
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>

        </div>
      </main>
    </>
  )
}
