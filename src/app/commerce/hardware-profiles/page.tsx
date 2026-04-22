'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Cpu, Plus, RefreshCw, Printer, ScanLine, CreditCard, Save } from 'lucide-react'

interface HardwareProfile {
  id: string
  profileId: string
  name: string
  printerType: string
  printerIp: string | null
  drawerPort: string | null
  scannerType: string
  paymentTerminal: string
  paymentIp: string | null
  displayType: string
  signatureCapture: boolean
  createdAt: string
}

const PRINTER_TYPES = ['none', 'network', 'usb', 'opos']
const SCANNER_TYPES = ['none', 'usb', 'keyboard_wedge']
const PAYMENT_TYPES = ['none', 'adyen', 'verifone', 'ingenico']
const DISPLAY_TYPES = ['none', 'pole_display', 'tablet', 'touchscreen']

const EMPTY_FORM = {
  profileId: '',
  name: '',
  printerType: 'none',
  printerIp: '',
  drawerPort: '',
  scannerType: 'none',
  paymentTerminal: 'none',
  paymentIp: '',
  displayType: 'none',
  signatureCapture: false,
}

export default function HardwareProfilesPage() {
  const [profiles, setProfiles] = useState<HardwareProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ ...EMPTY_FORM })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/commerce/hardware-profiles')
      setProfiles(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function startEdit(p: HardwareProfile) {
    setEditId(p.id)
    setForm({
      profileId: p.profileId,
      name: p.name,
      printerType: p.printerType,
      printerIp: p.printerIp ?? '',
      drawerPort: p.drawerPort ?? '',
      scannerType: p.scannerType,
      paymentTerminal: p.paymentTerminal,
      paymentIp: p.paymentIp ?? '',
      displayType: p.displayType,
      signatureCapture: p.signatureCapture,
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        ...form,
        printerIp: form.printerIp || undefined,
        drawerPort: form.drawerPort || undefined,
        paymentIp: form.paymentIp || undefined,
      }

      if (editId) {
        const res = await fetch(`/api/commerce/hardware-profiles/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Failed to update'); return }
        setSuccess('Profile updated.')
      } else {
        const res = await fetch('/api/commerce/hardware-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Failed to create'); return }
        setSuccess('Profile created.')
      }

      setShowForm(false)
      setEditId(null)
      setForm({ ...EMPTY_FORM })
      load()
    } finally {
      setSaving(false)
    }
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setForm({ ...EMPTY_FORM })
    setError('')
    setSuccess('')
  }

  return (
    <>
      <TopBar title="Hardware Profiles" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Hardware Profiles</h1>
            <p className="text-sm text-zinc-500">{profiles.length} profile(s) configured</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { cancelForm(); setShowForm(v => !v) }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> New Profile
            </button>
          </div>
        </div>

        {showForm && (
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">
                {editId ? 'Edit Hardware Profile' : 'Create Hardware Profile'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Profile ID *</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    placeholder="HW-MAIN-001"
                    value={form.profileId}
                    onChange={e => setForm(f => ({ ...f, profileId: e.target.value }))}
                    disabled={!!editId}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="Main Floor Hardware"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-span-2 border-t border-zinc-700 pt-3 flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide">
                  <Printer className="w-3 h-3" /> Printer
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Printer Type</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.printerType}
                    onChange={e => setForm(f => ({ ...f, printerType: e.target.value }))}
                  >
                    {PRINTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Printer IP</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="192.168.1.100"
                    value={form.printerIp}
                    onChange={e => setForm(f => ({ ...f, printerIp: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Cash Drawer Port</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="COM1"
                    value={form.drawerPort}
                    onChange={e => setForm(f => ({ ...f, drawerPort: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 border-t border-zinc-700 pt-3 flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide">
                  <ScanLine className="w-3 h-3" /> Scanner
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Scanner Type</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.scannerType}
                    onChange={e => setForm(f => ({ ...f, scannerType: e.target.value }))}
                  >
                    {SCANNER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2 border-t border-zinc-700 pt-3 flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide">
                  <CreditCard className="w-3 h-3" /> Payment Terminal
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Terminal Type</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.paymentTerminal}
                    onChange={e => setForm(f => ({ ...f, paymentTerminal: e.target.value }))}
                  >
                    {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Terminal IP</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="192.168.1.200"
                    value={form.paymentIp}
                    onChange={e => setForm(f => ({ ...f, paymentIp: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 border-t border-zinc-700 pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Display Type</label>
                      <select
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                        value={form.displayType}
                        onChange={e => setForm(f => ({ ...f, displayType: e.target.value }))}
                      >
                        {DISPLAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.signatureCapture}
                          onChange={e => setForm(f => ({ ...f, signatureCapture: e.target.checked }))}
                          className="w-4 h-4 accent-blue-500"
                        />
                        <span className="text-sm text-zinc-300">Signature Capture</span>
                      </label>
                    </div>
                  </div>
                </div>
                {error && <p className="col-span-2 text-xs text-rose-400">{error}</p>}
                {success && <p className="col-span-2 text-xs text-emerald-400">{success}</p>}
                <div className="col-span-2 flex gap-3 justify-end">
                  <button type="button" onClick={cancelForm} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Profile'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16 text-zinc-600">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
            </CardContent>
          </Card>
        ) : profiles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Cpu className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No hardware profiles configured yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
            {profiles.map(p => (
              <Card key={p.id} className="hover:border-zinc-700 transition-colors">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{p.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">{p.profileId}</p>
                    </div>
                    <button
                      onClick={() => startEdit(p)}
                      className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-500/10"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Printer className="w-3 h-3" />
                      <span>Printer: <span className="text-zinc-300">{p.printerType}{p.printerIp ? ` (${p.printerIp})` : ''}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <ScanLine className="w-3 h-3" />
                      <span>Scanner: <span className="text-zinc-300">{p.scannerType}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <CreditCard className="w-3 h-3" />
                      <span>Payment: <span className="text-zinc-300">{p.paymentTerminal}{p.paymentIp ? ` (${p.paymentIp})` : ''}</span></span>
                    </div>
                    <div className="text-zinc-500">Display: <span className="text-zinc-300">{p.displayType}</span></div>
                    {p.drawerPort && <div className="text-zinc-500">Drawer: <span className="text-zinc-300">{p.drawerPort}</span></div>}
                    {p.signatureCapture && <div className="text-emerald-400">Signature capture enabled</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
