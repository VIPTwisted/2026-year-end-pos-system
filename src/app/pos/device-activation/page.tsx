'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cpu, Monitor, Smartphone, Cloud, ChevronRight, ChevronLeft, CheckCircle2, Loader2, Copy } from 'lucide-react'

const STEPS = ['Device Type', 'Activation Details', 'Hardware Pairing', 'Confirmation']

const DEVICE_TYPES = [
  { id: 'StoreCommerce', label: 'Store Commerce', desc: 'Full-featured in-store POS terminal', icon: Monitor },
  { id: 'MPOS', label: 'Mobile POS', desc: 'Tablet or phone-based mobile checkout', icon: Smartphone },
  { id: 'CloudPOS', label: 'Cloud POS', desc: 'Browser-based point of sale via cloud URL', icon: Cloud },
]

const HARDWARE_PROFILES = [
  'Default Hardware Profile',
  'Cash Drawer + Printer',
  'Card Reader Only',
  'Full Peripheral Suite',
  'Kiosk Mode',
]

export default function DeviceActivationWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ activationCode: string; device: { deviceId: string; deviceName: string } } | null>(null)
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState({
    deviceType: '',
    deviceName: '',
    storeCode: '',
    registerId: '',
    cloudPOSUrl: '',
    hardwareProfileId: '',
  })

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function handleFinish() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/pos/device-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Activation failed'); return }
      setResult(data)
      setStep(3)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  function copyCode() {
    if (result?.activationCode) {
      navigator.clipboard.writeText(result.activationCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const canNext = () => {
    if (step === 0) return !!form.deviceType
    if (step === 1) return !!form.deviceName
    return true
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-3">
            <Cpu className="w-6 h-6 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Device Activation</h1>
          <p className="text-sm text-zinc-500 mt-1">Register and activate a new POS device</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step ? 'bg-violet-600 text-white'
                  : i === step ? 'bg-violet-600/20 border-2 border-violet-500 text-violet-400'
                  : 'bg-zinc-800 text-zinc-600'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-zinc-200' : i < step ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 bg-zinc-800 mx-2 hidden sm:block">
                    <div className={`h-full bg-violet-600 transition-all ${i < step ? 'w-full' : 'w-0'}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 transition-all duration-300"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {/* Step Content */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          {/* Step 0: Device Type */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-zinc-200">Select Device Type</h2>
              <div className="grid grid-cols-1 gap-3">
                {DEVICE_TYPES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set('deviceType', t.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      form.deviceType === t.id
                        ? 'bg-violet-600/10 border-violet-500 text-violet-400'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      form.deviceType === t.id ? 'bg-violet-500/20' : 'bg-zinc-800'
                    }`}>
                      <t.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">{t.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{t.desc}</p>
                    </div>
                    {form.deviceType === t.id && (
                      <CheckCircle2 className="w-5 h-5 text-violet-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Activation Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-zinc-200">Activation Details</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Device Name *</label>
                  <input
                    value={form.deviceName}
                    onChange={e => set('deviceName', e.target.value)}
                    placeholder="e.g. Register 1 — Main Floor"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Store Code</label>
                    <input
                      value={form.storeCode}
                      onChange={e => set('storeCode', e.target.value)}
                      placeholder="STORE-001"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Register ID</label>
                    <input
                      value={form.registerId}
                      onChange={e => set('registerId', e.target.value)}
                      placeholder="REG-001"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
                {form.deviceType === 'CloudPOS' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Cloud POS URL</label>
                    <input
                      value={form.cloudPOSUrl}
                      onChange={e => set('cloudPOSUrl', e.target.value)}
                      placeholder="https://pos.yourdomain.com"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Hardware Pairing */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-zinc-200">Hardware Pairing</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Hardware Profile</label>
                  <select
                    value={form.hardwareProfileId}
                    onChange={e => set('hardwareProfileId', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="">— Select profile —</option>
                    {HARDWARE_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-zinc-300">Connection Test</p>
                  <p className="text-xs text-zinc-500">Verify hardware connectivity before proceeding</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['Printer', 'Cash Drawer', 'Card Reader'].map(hw => (
                      <div key={hw} className="bg-zinc-800 rounded-lg p-3 text-center">
                        <div className="w-2 h-2 rounded-full bg-zinc-600 mx-auto mb-2" />
                        <p className="text-xs text-zinc-500">{hw}</p>
                        <p className="text-xs text-zinc-600 mt-0.5">Not tested</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600">Hardware testing available after activation</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && result && (
            <div className="space-y-5 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-100">Device Registered!</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  <span className="text-zinc-300 font-medium">{result.device.deviceName}</span> ({result.device.deviceId}) is ready to activate
                </p>
              </div>
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-5">
                <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Activation Code</p>
                <p className="font-mono text-3xl font-bold text-violet-400 tracking-widest mb-3">{result.activationCode}</p>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-2 mx-auto text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <p className="text-xs text-zinc-600">Enter this code in the NovaPOS application to complete device setup</p>
              <button
                onClick={() => router.push('/channels/store-commerce')}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                View All Devices
              </button>
            </div>
          )}
        </div>

        {/* Nav Buttons */}
        {step < 3 && (
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={step === 2 ? handleFinish : () => setStep(s => s + 1)}
              disabled={!canNext() || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {step === 2 ? 'Activate Device' : 'Next'}
              {step < 2 && !loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
