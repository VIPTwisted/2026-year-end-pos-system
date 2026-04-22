'use client'

import { TopBar } from '@/components/layout/TopBar'
import { ReceiptPreview } from '@/components/receipts/ReceiptPreview'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'

interface FormState {
  name: string
  headerLine1: string
  headerLine2: string
  headerLine3: string
  footerLine1: string
  footerLine2: string
  footerLine3: string
  showLogo: boolean
  logoUrl: string
  showStoreName: boolean
  showStoreAddress: boolean
  showStorePhone: boolean
  showCashier: boolean
  showOrderNumber: boolean
  showDateTime: boolean
  showBarcode: boolean
  showQrCode: boolean
  showTaxDetail: boolean
  showLoyaltyBalance: boolean
  showReturnPolicy: boolean
  returnPolicyText: string
  paperWidth: string
  fontSize: string
  isDefault: boolean
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

const DEFAULT_FORM: FormState = {
  name: '',
  headerLine1: '',
  headerLine2: '',
  headerLine3: '',
  footerLine1: 'Thank you for shopping with us!',
  footerLine2: '',
  footerLine3: '',
  showLogo: false,
  logoUrl: '',
  showStoreName: true,
  showStoreAddress: true,
  showStorePhone: true,
  showCashier: true,
  showOrderNumber: true,
  showDateTime: true,
  showBarcode: false,
  showQrCode: false,
  showTaxDetail: true,
  showLoyaltyBalance: true,
  showReturnPolicy: true,
  returnPolicyText: '',
  paperWidth: '80',
  fontSize: 'normal',
  isDefault: false,
}

export default function EditReceiptProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    fetch(`/api/configuration/receipt-profiles/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((data: Record<string, unknown>) => {
        setForm({
          name: (data.name as string) ?? '',
          headerLine1: (data.headerLine1 as string) ?? '',
          headerLine2: (data.headerLine2 as string) ?? '',
          headerLine3: (data.headerLine3 as string) ?? '',
          footerLine1: (data.footerLine1 as string) ?? 'Thank you for shopping with us!',
          footerLine2: (data.footerLine2 as string) ?? '',
          footerLine3: (data.footerLine3 as string) ?? '',
          showLogo: (data.showLogo as boolean) ?? false,
          logoUrl: (data.logoUrl as string) ?? '',
          showStoreName: (data.showStoreName as boolean) ?? true,
          showStoreAddress: (data.showStoreAddress as boolean) ?? true,
          showStorePhone: (data.showStorePhone as boolean) ?? true,
          showCashier: (data.showCashier as boolean) ?? true,
          showOrderNumber: (data.showOrderNumber as boolean) ?? true,
          showDateTime: (data.showDateTime as boolean) ?? true,
          showBarcode: (data.showBarcode as boolean) ?? false,
          showQrCode: (data.showQrCode as boolean) ?? false,
          showTaxDetail: (data.showTaxDetail as boolean) ?? true,
          showLoyaltyBalance: (data.showLoyaltyBalance as boolean) ?? true,
          showReturnPolicy: (data.showReturnPolicy as boolean) ?? true,
          returnPolicyText: (data.returnPolicyText as string) ?? '',
          paperWidth: String((data.paperWidth as number) ?? 80),
          fontSize: (data.fontSize as string) ?? 'normal',
          isDefault: (data.isDefault as boolean) ?? false,
        })
      })
      .catch(() => notify('Failed to load receipt profile', 'err'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/configuration/receipt-profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          paperWidth: parseInt(form.paperWidth) || 80,
          headerLine1: form.headerLine1 || null,
          headerLine2: form.headerLine2 || null,
          headerLine3: form.headerLine3 || null,
          footerLine2: form.footerLine2 || null,
          footerLine3: form.footerLine3 || null,
          logoUrl: form.logoUrl || null,
          returnPolicyText: form.returnPolicyText || null,
        }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        notify(data.error ?? 'Failed to save', 'err')
        return
      }
      notify('Receipt profile saved')
      router.refresh()
    } catch {
      notify('Network error', 'err')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/configuration/receipt-profiles/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        notify(data.error ?? 'Failed to delete', 'err')
        setConfirmDelete(false)
        return
      }
      router.push('/configuration/receipt-profiles')
      router.refresh()
    } catch {
      notify('Network error', 'err')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'
  const inputCls =
    'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none transition-colors'
  const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4'

  function Toggle({
    label,
    fieldKey,
    description,
  }: {
    label: string
    fieldKey: keyof FormState
    description?: string
  }) {
    return (
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form[fieldKey] as boolean}
          onChange={e => set(fieldKey, e.target.checked as FormState[typeof fieldKey])}
          className="mt-0.5 w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
        />
        <div>
          <div className="text-[13px] text-zinc-200 font-medium">{label}</div>
          {description && <div className="text-[11px] text-zinc-500 mt-0.5">{description}</div>}
        </div>
      </label>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a]">
        <TopBar title="Edit Receipt Profile" />
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-500 text-sm animate-pulse">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`Edit: ${form.name || 'Receipt Profile'}`} />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-[13px] font-medium shadow-xl transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/20 border border-red-500/40 text-red-300'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-[15px] font-bold text-zinc-100 mb-2">Delete Receipt Profile?</h3>
            <p className="text-[13px] text-zinc-400 mb-5">
              This will permanently delete <span className="text-zinc-200 font-semibold">{form.name}</span>. Any
              registers linked to this profile will lose the association.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-[13px] font-semibold py-2.5 rounded transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-[13px] font-semibold py-2.5 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/configuration/receipt-profiles"
            className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Receipt Profiles
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-[12px] text-zinc-400">{form.name}</span>
          <div className="ml-auto">
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-[12px] text-red-400 hover:text-red-300 transition-colors"
            >
              Delete Profile
            </button>
          </div>
        </div>

        {/* Two-column layout: editor left, preview right */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
          {/* ── LEFT: Editor ── */}
          <form onSubmit={handleSave} className="space-y-5">
            {/* General */}
            <div className={sectionCls}>
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">General</h2>
              <div>
                <label className={labelCls}>Profile Name *</label>
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Standard Receipt"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Paper Width</label>
                  <div className="flex gap-2">
                    {['58', '72', '80', '112'].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => set('paperWidth', w)}
                        className={`flex-1 py-2 rounded text-[12px] font-semibold transition-colors ${
                          form.paperWidth === w
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {w}mm
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Font Size</label>
                  <select
                    className={inputCls}
                    value={form.fontSize}
                    onChange={e => set('fontSize', e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
              <Toggle label="Set as Default Receipt Profile" fieldKey="isDefault" />
            </div>

            {/* Header Text */}
            <div className={sectionCls}>
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                Custom Header Lines
              </h2>
              <p className="text-[11px] text-zinc-500 -mt-1">
                Printed after store info. Use for taglines, promotions, or custom messaging.
              </p>
              {(
                [
                  ['headerLine1', 'Header Line 1', 'e.g. "OFFICIAL RECEIPT"'],
                  ['headerLine2', 'Header Line 2', 'e.g. "Valid for returns within 30 days"'],
                  ['headerLine3', 'Header Line 3', 'e.g. "www.yourstore.com"'],
                ] as const
              ).map(([field, label, placeholder]) => (
                <div key={field}>
                  <label className={labelCls}>{label}</label>
                  <input
                    className={inputCls}
                    value={form[field]}
                    onChange={e => set(field, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            {/* Footer Text */}
            <div className={sectionCls}>
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                Footer Lines
              </h2>
              <p className="text-[11px] text-zinc-500 -mt-1">
                Printed at the bottom of every receipt.
              </p>
              {(
                [
                  ['footerLine1', 'Footer Line 1', 'Thank you for shopping with us!'],
                  ['footerLine2', 'Footer Line 2', 'e.g. "Follow us @yourstore"'],
                  ['footerLine3', 'Footer Line 3', 'e.g. "Survey: survey.yourstore.com"'],
                ] as const
              ).map(([field, label, placeholder]) => (
                <div key={field}>
                  <label className={labelCls}>{label}</label>
                  <input
                    className={inputCls}
                    value={form[field]}
                    onChange={e => set(field, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            {/* Display Options */}
            <div className={sectionCls}>
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                Display Sections
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Store Info</p>
                  <Toggle label="Logo" fieldKey="showLogo" />
                  <Toggle label="Store Name" fieldKey="showStoreName" />
                  <Toggle label="Store Address" fieldKey="showStoreAddress" />
                  <Toggle label="Store Phone" fieldKey="showStorePhone" />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Transaction</p>
                  <Toggle label="Order Number" fieldKey="showOrderNumber" />
                  <Toggle label="Date & Time" fieldKey="showDateTime" />
                  <Toggle label="Cashier Name" fieldKey="showCashier" />
                  <Toggle label="Tax Detail" fieldKey="showTaxDetail" description="Show tax rate %" />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Extras</p>
                  <Toggle label="Loyalty Balance" fieldKey="showLoyaltyBalance" />
                  <Toggle label="Barcode" fieldKey="showBarcode" description="Transaction barcode" />
                  <Toggle label="QR Code" fieldKey="showQrCode" description="Digital receipt link" />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Policies</p>
                  <Toggle label="Return Policy" fieldKey="showReturnPolicy" />
                </div>
              </div>

              {/* Conditional sub-fields */}
              {form.showLogo && (
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <label className={labelCls}>Logo URL</label>
                  <input
                    className={inputCls}
                    value={form.logoUrl}
                    onChange={e => set('logoUrl', e.target.value)}
                    placeholder="https://yourstore.com/logo.png"
                  />
                </div>
              )}

              {form.showReturnPolicy && (
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <label className={labelCls}>Return Policy Text</label>
                  <textarea
                    className={inputCls + ' resize-none'}
                    rows={2}
                    value={form.returnPolicyText}
                    onChange={e => set('returnPolicyText', e.target.value)}
                    placeholder="Returns accepted within 30 days with receipt."
                  />
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Leave blank to use the default return policy message.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pb-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[13px] font-semibold px-6 py-2.5 rounded transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/configuration/receipt-profiles"
                className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* ── RIGHT: Live Preview ── */}
          <div className="xl:sticky xl:top-20">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                  Live Preview
                </h2>
                <span className="text-[10px] text-zinc-600">{form.paperWidth}mm paper</span>
              </div>

              {/* Thermal paper background */}
              <div
                className="rounded overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #f5f0e8 0%, #faf8f4 100%)',
                  padding: '8px',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                }}
              >
                <ReceiptPreview
                  headerLine1={form.headerLine1}
                  headerLine2={form.headerLine2}
                  headerLine3={form.headerLine3}
                  footerLine1={form.footerLine1}
                  footerLine2={form.footerLine2}
                  footerLine3={form.footerLine3}
                  paperWidth={parseInt(form.paperWidth) || 80}
                  fontSize={form.fontSize}
                  showLogo={form.showLogo}
                  logoUrl={form.logoUrl}
                  showStoreName={form.showStoreName}
                  showStoreAddress={form.showStoreAddress}
                  showStorePhone={form.showStorePhone}
                  showCashier={form.showCashier}
                  showOrderNumber={form.showOrderNumber}
                  showDateTime={form.showDateTime}
                  showBarcode={form.showBarcode}
                  showQrCode={form.showQrCode}
                  showTaxDetail={form.showTaxDetail}
                  showLoyaltyBalance={form.showLoyaltyBalance}
                  showReturnPolicy={form.showReturnPolicy}
                  returnPolicyText={form.returnPolicyText}
                />
              </div>

              <div className="mt-3 text-[11px] text-zinc-600 text-center">
                Preview uses sample data — real receipts show live transaction info
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
