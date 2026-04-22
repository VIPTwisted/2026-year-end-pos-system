'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Printer, Plus, Trash2, Edit2, CheckCircle, AlertCircle, Clock, Wifi } from 'lucide-react'

interface FiscalDevice {
  id: string
  name: string
  deviceType: string
  manufacturer: string | null
  model: string | null
  serialNumber: string | null
  registerId: string | null
  storeId: string | null
  storeName: string | null
  status: string
  ipAddress: string | null
  port: number | null
  lastHeartbeat: string | null
  errorMessage: string | null
  createdAt: string
  _count?: { documents: number }
}

const DEVICE_TYPES = ['fiscal-printer', 'esdr', 'cloud-fiscal', 'audit-unit']

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    active: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: 'Active' },
    inactive: { color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20', label: 'Inactive' },
    error: { color: 'bg-red-500/15 text-red-400 border-red-500/20', label: 'Error' },
    maintenance: { color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', label: 'Maintenance' },
  }
  const c = cfg[status] ?? cfg.inactive
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium border rounded-full px-2 py-0.5 ${c.color}`}>
      {c.label}
    </span>
  )
}

function formatHeartbeat(dt: string | null) {
  if (!dt) return 'Never'
  const diff = Date.now() - new Date(dt).getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(dt).toLocaleDateString()
}

export default function FiscalDevicesPage() {
  const [devices, setDevices] = useState<FiscalDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [pinging, setPinging] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', deviceType: 'fiscal-printer', manufacturer: '', model: '',
    serialNumber: '', storeName: '', ipAddress: '', port: '',
  })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/fiscal/devices')
    const data = await res.json()
    setDevices(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handlePing = async (id: string) => {
    setPinging(id)
    await fetch(`/api/fiscal/devices/${id}/heartbeat`, { method: 'POST' })
    await load()
    setPinging(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this device?')) return
    await fetch(`/api/fiscal/devices/${id}`, { method: 'DELETE' })
    setDevices(prev => prev.filter(d => d.id !== id))
  }

  const handleEdit = (d: FiscalDevice) => {
    setEditId(d.id)
    setForm({
      name: d.name, deviceType: d.deviceType, manufacturer: d.manufacturer ?? '',
      model: d.model ?? '', serialNumber: d.serialNumber ?? '', storeName: d.storeName ?? '',
      ipAddress: d.ipAddress ?? '', port: d.port?.toString() ?? '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name, deviceType: form.deviceType,
      manufacturer: form.manufacturer || null, model: form.model || null,
      serialNumber: form.serialNumber || null, storeName: form.storeName || null,
      ipAddress: form.ipAddress || null, port: form.port ? Number(form.port) : null,
    }
    if (editId) {
      await fetch(`/api/fiscal/devices/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      await fetch('/api/fiscal/devices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    await load()
    setShowForm(false); setEditId(null)
    setForm({ name: '', deviceType: 'fiscal-printer', manufacturer: '', model: '', serialNumber: '', storeName: '', ipAddress: '', port: '' })
    setSaving(false)
  }

  return (
    <>
      <TopBar title="Fiscal Devices" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Fiscal Devices</h2>
            <p className="text-xs text-zinc-500">{devices.length} device(s) registered</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', deviceType: 'fiscal-printer', manufacturer: '', model: '', serialNumber: '', storeName: '', ipAddress: '', port: '' }) }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Device
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">{editId ? 'Edit Device' : 'New Fiscal Device'}</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Device Name *', placeholder: 'e.g. Register 1 Printer', required: true },
                { key: 'manufacturer', label: 'Manufacturer', placeholder: 'e.g. Epson' },
                { key: 'model', label: 'Model', placeholder: 'e.g. TM-T88VI' },
                { key: 'serialNumber', label: 'Serial Number', placeholder: 'SN-12345' },
                { key: 'storeName', label: 'Store Name', placeholder: 'Main Street Store' },
                { key: 'ipAddress', label: 'IP Address', placeholder: '192.168.1.100' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                  <input required={f.required} value={form[f.key as keyof typeof form] as string} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                    placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Device Type</label>
                <select value={form.deviceType} onChange={e => setForm(p => ({ ...p, deviceType: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Port</label>
                <input type="number" value={form.port} onChange={e => setForm(p => ({ ...p, port: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                  placeholder="9100" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Saving...' : editId ? 'Update' : 'Create Device'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12 text-zinc-600 text-sm">Loading...</div>
        ) : devices.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <Printer className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No fiscal devices registered</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map(device => (
              <div key={device.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{device.name}</p>
                    <p className="text-xs text-zinc-500">{device.deviceType}</p>
                  </div>
                  <StatusBadge status={device.status} />
                </div>
                <div className="space-y-1 text-xs text-zinc-400">
                  {device.manufacturer && <p><span className="text-zinc-600">Mfr:</span> {device.manufacturer} {device.model}</p>}
                  {device.serialNumber && <p><span className="text-zinc-600">S/N:</span> {device.serialNumber}</p>}
                  {device.storeName && <p><span className="text-zinc-600">Store:</span> {device.storeName}</p>}
                  {device.ipAddress && <p><span className="text-zinc-600">IP:</span> {device.ipAddress}{device.port ? `:${device.port}` : ''}</p>}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                  <Clock className="w-3 h-3" />
                  <span>Heartbeat: {formatHeartbeat(device.lastHeartbeat)}</span>
                </div>
                {device.status === 'error' && device.errorMessage && (
                  <div className="flex items-start gap-1.5 bg-red-950/20 border border-red-500/20 rounded p-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-400">{device.errorMessage}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                  <button onClick={() => handlePing(device.id)} disabled={pinging === device.id}
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors">
                    <Wifi className="w-3.5 h-3.5" />{pinging === device.id ? 'Pinging...' : 'Ping'}
                  </button>
                  <button onClick={() => handleEdit(device)} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors ml-auto">
                    <Edit2 className="w-3.5 h-3.5" />Edit
                  </button>
                  <button onClick={() => handleDelete(device.id)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
