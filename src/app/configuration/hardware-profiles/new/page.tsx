'use client'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FormState {
  name: string
  description: string
  printerType: string
  printerPort: string
  printerWidth: string
  cashDrawerPort: string
  cashDrawerOpenCode: string
  paymentTerminalType: string
  paymentTerminalPort: string
  paymentTerminalId: string
  barcodeScanner: string
  customerDisplay: boolean
  customerDisplayPort: string
  signatureCapture: boolean
  isActive: boolean
}

export default function NewHardwareProfilePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    printerType: 'none',
    printerPort: '',
    printerWidth: '40',
    cashDrawerPort: 'printer',
    cashDrawerOpenCode: '27,112,0,25,250',
    paymentTerminalType: 'none',
    paymentTerminalPort: '',
    paymentTerminalId: '',
    barcodeScanner: 'keyboard',
    customerDisplay: false,
    customerDisplayPort: '',
    signatureCapture: false,
    isActive: true,
  })

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/configuration/hardware-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          printerWidth: parseInt(form.printerWidth) || 40,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create profile')
        return
      }
      router.push('/configuration/hardware-profiles')
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'
  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none transition-colors'
  const selectCls = inputCls
  const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4'

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Hardware Profile" />
      <div className="p-6 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic */}
          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">General</h2>
            <div>
              <label className={labelCls}>Profile Name *</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Standard Register"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <input
                className={inputCls}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>

          {/* Printer */}
          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Receipt Printer</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Printer Type</label>
                <select className={selectCls} value={form.printerType} onChange={e => set('printerType', e.target.value)}>
                  <option value="none">None</option>
                  <option value="epson">Epson</option>
                  <option value="star">Star</option>
                  <option value="bixolon">Bixolon</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Printer Port</label>
                <input className={inputCls} value={form.printerPort} onChange={e => set('printerPort', e.target.value)} placeholder="COM1 / USB / LPT1" />
              </div>
              <div>
                <label className={labelCls}>Paper Width (chars)</label>
                <input className={inputCls} type="number" value={form.printerWidth} onChange={e => set('printerWidth', e.target.value)} min={32} max={80} />
              </div>
            </div>
          </div>

          {/* Cash Drawer */}
          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Cash Drawer</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Cash Drawer Port</label>
                <select className={selectCls} value={form.cashDrawerPort} onChange={e => set('cashDrawerPort', e.target.value)}>
                  <option value="printer">Via Printer</option>
                  <option value="com1">COM1</option>
                  <option value="com2">COM2</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Open Code (ESC/POS)</label>
                <input className={inputCls} value={form.cashDrawerOpenCode} onChange={e => set('cashDrawerOpenCode', e.target.value)} placeholder="27,112,0,25,250" />
              </div>
            </div>
          </div>

          {/* Payment Terminal */}
          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Payment Terminal</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Terminal Type</label>
                <select className={selectCls} value={form.paymentTerminalType} onChange={e => set('paymentTerminalType', e.target.value)}>
                  <option value="none">None</option>
                  <option value="verifone">Verifone</option>
                  <option value="ingenico">Ingenico</option>
                  <option value="square">Square</option>
                  <option value="stripe">Stripe Terminal</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Terminal Port</label>
                <input className={inputCls} value={form.paymentTerminalPort} onChange={e => set('paymentTerminalPort', e.target.value)} placeholder="COM3 / IP Address" />
              </div>
              <div>
                <label className={labelCls}>Terminal ID</label>
                <input className={inputCls} value={form.paymentTerminalId} onChange={e => set('paymentTerminalId', e.target.value)} placeholder="Terminal identifier" />
              </div>
            </div>
          </div>

          {/* Other Peripherals */}
          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Peripherals</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Barcode Scanner</label>
                <select className={selectCls} value={form.barcodeScanner} onChange={e => set('barcodeScanner', e.target.value)}>
                  <option value="keyboard">Keyboard Wedge</option>
                  <option value="usb">USB HID</option>
                  <option value="bluetooth">Bluetooth</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.customerDisplay}
                  onChange={e => set('customerDisplay', e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
                />
                <span className="text-[13px] text-zinc-300">Customer Display</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.signatureCapture}
                  onChange={e => set('signatureCapture', e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
                />
                <span className="text-[13px] text-zinc-300">Signature Capture Pad</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => set('isActive', e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
                />
                <span className="text-[13px] text-zinc-300">Active</span>
              </label>
            </div>
            {form.customerDisplay && (
              <div>
                <label className={labelCls}>Customer Display Port</label>
                <input className={inputCls} value={form.customerDisplayPort} onChange={e => set('customerDisplayPort', e.target.value)} placeholder="COM4 / USB" />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-800/50 rounded px-4 py-3 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors"
            >
              {saving ? 'Saving...' : 'Create Profile'}
            </button>
            <Link
              href="/configuration/hardware-profiles"
              className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
