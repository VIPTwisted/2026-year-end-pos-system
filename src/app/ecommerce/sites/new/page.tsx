'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Globe, ChevronRight, ChevronLeft, Loader2, CheckCircle2, Server, FileText } from 'lucide-react'

const LOCALES = ['en-us', 'fr', 'de', 'es', 'zh', 'ja']

interface Step1 { siteId: string; siteName: string; description: string; defaultLocale: string }
interface Step2 { channelId: string; domainName: string; locale: string }

export default function NewSitePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [provisioned, setProvisioned] = useState(false)
  const [error, setError] = useState('')

  const [step1, setStep1] = useState<Step1>({ siteId: '', siteName: '', description: '', defaultLocale: 'en-us' })
  const [step2, setStep2] = useState<Step2>({ channelId: '', domainName: '', locale: 'en-us' })

  const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')

  const handleProvision = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/ecommerce/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...step1 }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to provision site')
        setSubmitting(false)
        return
      }
      const site = await res.json()

      if (step2.domainName || step2.channelId) {
        await fetch(`/api/ecommerce/sites/${site.id}/bindings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...step2, isPrimary: true }),
        })
      }

      setProvisioned(true)
      setTimeout(() => router.push(`/ecommerce/sites/${site.id}`), 2000)
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  if (provisioned) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center max-w-sm w-full">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-2">Provisioning site...</h2>
          <p className="text-sm text-zinc-400">Your e-commerce environment is being set up. Redirecting to site dashboard.</p>
        </div>
      </div>
    )
  }

  const steps = ['Site details', 'Channel binding', 'Review']

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">Provision new e-commerce site</h1>
          <p className="text-sm text-zinc-400">Create a new e-commerce environment and bind it to a retail channel.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border',
                  step > i + 1
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : step === i + 1
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                )}
              >
                {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn('text-sm', step === i + 1 ? 'text-zinc-100' : 'text-zinc-500')}>{label}</span>
              {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-zinc-600 mx-1" />}
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                Site details
              </h2>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Site ID <span className="text-red-400">*</span></label>
                <input
                  value={step1.siteId}
                  onChange={(e) => setStep1({ ...step1, siteId: slugify(e.target.value) })}
                  placeholder="e.g. fabrikam-site"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-xs text-zinc-500 mt-1">Lowercase, hyphens only. Cannot be changed after creation.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Site name <span className="text-red-400">*</span></label>
                <input
                  value={step1.siteName}
                  onChange={(e) => setStep1({ ...step1, siteName: e.target.value })}
                  placeholder="e.g. Fabrikam Online Store"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
                <textarea
                  value={step1.description}
                  onChange={(e) => setStep1({ ...step1, description: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Default locale</label>
                <select
                  value={step1.defaultLocale}
                  onChange={(e) => setStep1({ ...step1, defaultLocale: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {LOCALES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                Channel binding
              </h2>
              <p className="text-xs text-zinc-500">Maps your site to a retail channel and domain. You can add more bindings after provisioning.</p>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Channel ID</label>
                <input
                  value={step2.channelId}
                  onChange={(e) => setStep2({ ...step2, channelId: e.target.value })}
                  placeholder="e.g. 68719478279"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Domain name</label>
                <input
                  value={step2.domainName}
                  onChange={(e) => setStep2({ ...step2, domainName: e.target.value })}
                  placeholder="e.g. www.fabrikam.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Locale</label>
                <select
                  value={step2.locale}
                  onChange={(e) => setStep2({ ...step2, locale: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {LOCALES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Review configuration
              </h2>
              <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 divide-y divide-zinc-700">
                {[
                  { label: 'Site ID', value: step1.siteId },
                  { label: 'Site name', value: step1.siteName },
                  { label: 'Description', value: step1.description || '—' },
                  { label: 'Default locale', value: step1.defaultLocale },
                  { label: 'Channel ID', value: step2.channelId || '—' },
                  { label: 'Domain', value: step2.domainName || '—' },
                  { label: 'Binding locale', value: step2.locale },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-zinc-400">{label}</span>
                    <span className="text-sm text-zinc-100 font-mono">{value}</span>
                  </div>
                ))}
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 rounded-md text-sm font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && (!step1.siteId || !step1.siteName)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleProvision}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-md text-sm font-medium transition-colors"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Provision Site
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
