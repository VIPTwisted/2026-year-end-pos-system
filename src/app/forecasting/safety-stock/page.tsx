'use client'

import { useEffect, useState } from 'react'
import { Zap, Plus, RefreshCw, X, Pencil, Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SafetyStockRule {
  id: string
  productId: string | null
  productName: string | null
  sku: string | null
  storeId: string | null
  storeName: string | null
  minQty: number
  maxQty: number
  reorderPoint: number
  reorderQty: number
  leadTimeDays: number
  isActive: boolean
  lastTriggeredAt: string | null
  createdAt: string
}

type EditFields = {
  minQty: string
  maxQty: string
  reorderPoint: string
  reorderQty: string
  leadTimeDays: string
}

export default function SafetyStockPage() {
  const [rules, setRules] = useState<SafetyStockRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<EditFields>({ minQty: '', maxQty: '', reorderPoint: '', reorderQty: '', leadTimeDays: '' })
  const [form, setForm] = useState({
    productName: '', sku: '', storeName: '', storeId: '',
    minQty: '', maxQty: '', reorderPoint: '', reorderQty: '', leadTimeDays: '7',
  })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/forecasting/safety-stock')
      const data = await res.json()
      setRules(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createRule() {
    if (!form.minQty || !form.maxQty || !form.reorderPoint || !form.reorderQty) return
    setCreating(true)
    try {
      await fetch('/api/forecasting/safety-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: form.productName || undefined,
          sku: form.sku || undefined,
          storeId: form.storeId || undefined,
          storeName: form.storeName || undefined,
          minQty: Number(form.minQty),
          maxQty: Number(form.maxQty),
          reorderPoint: Number(form.reorderPoint),
          reorderQty: Number(form.reorderQty),
          leadTimeDays: Number(form.leadTimeDays),
        }),
      })
      setShowModal(false)
      setForm({ productName: '', sku: '', storeName: '', storeId: '', minQty: '', maxQty: '', reorderPoint: '', reorderQty: '', leadTimeDays: '7' })
      load()
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  async function saveEdit(id: string) {
    await fetch(`/api/forecasting/safety-stock/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        minQty: Number(editFields.minQty),
        maxQty: Number(editFields.maxQty),
        reorderPoint: Number(editFields.reorderPoint),
        reorderQty: Number(editFields.reorderQty),
        leadTimeDays: Number(editFields.leadTimeDays),
      }),
    })
    setEditId(null)
    load()
  }

  async function toggleActive(rule: SafetyStockRule) {
    await fetch(`/api/forecasting/safety-stock/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !rule.isActive }),
    })
    load()
  }

  async function deleteRule(id: string) {
    await fetch(`/api/forecasting/safety-stock/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(rule: SafetyStockRule) {
    setEditId(rule.id)
    setEditFields({
      minQty: rule.minQty.toString(),
      maxQty: rule.maxQty.toString(),
      reorderPoint: rule.reorderPoint.toString(),
      reorderQty: rule.reorderQty.toString(),
      leadTimeDays: rule.leadTimeDays.toString(),
    })
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Safety Stock Rules
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Min/max quantities and reorder triggers per product/store</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Rule
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Store</th>
                <th className="text-center px-4 py-3">Min</th>
                <th className="text-center px-4 py-3">Max</th>
                <th className="text-center px-4 py-3">Reorder Pt</th>
                <th className="text-center px-4 py-3">Reorder Qty</th>
                <th className="text-center px-4 py-3">Lead Days</th>
                <th className="text-center px-4 py-3">Active</th>
                <th className="text-left px-4 py-3">Last Triggered</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center text-zinc-500 py-12">
                    No safety stock rules. Create your first rule.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => {
                  const isEditing = editId === rule.id
                  return (
                    <tr
                      key={rule.id}
                      className={cn(
                        'transition-colors hover:bg-zinc-800/30',
                        !rule.isActive && 'opacity-50'
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{rule.sku ?? '—'}</td>
                      <td className="px-4 py-3 text-zinc-200">{rule.productName ?? '—'}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{rule.storeName ?? 'All'}</td>

                      {(['minQty', 'maxQty', 'reorderPoint', 'reorderQty', 'leadTimeDays'] as const).map((field) => (
                        <td key={field} className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editFields[field]}
                              onChange={(e) => setEditFields({ ...editFields, [field]: e.target.value })}
                              className="w-16 bg-zinc-800 border border-zinc-600 rounded px-1.5 py-1 text-xs text-center text-zinc-100 focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <span className="text-zinc-300">{rule[field]}</span>
                          )}
                        </td>
                      ))}

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleActive(rule)}
                          className={cn(
                            'w-10 h-5 rounded-full transition-colors relative',
                            rule.isActive ? 'bg-emerald-600' : 'bg-zinc-700'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                              rule.isActive ? 'translate-x-5' : 'translate-x-0.5'
                            )}
                          />
                        </button>
                      </td>

                      <td className="px-4 py-3 text-zinc-500 text-xs">
                        {rule.lastTriggeredAt
                          ? new Date(rule.lastTriggeredAt).toLocaleDateString()
                          : '—'}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(rule.id)}
                                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditId(null)}
                                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(rule)}
                                className="text-zinc-500 hover:text-blue-400 transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteRule(rule.id)}
                                className="text-zinc-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Safety Stock Rule</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'productName', label: 'Product Name', placeholder: 'e.g. Widget A' },
                { key: 'sku', label: 'SKU', placeholder: 'e.g. SKU-001' },
                { key: 'storeName', label: 'Store Name', placeholder: 'Optional' },
                { key: 'storeId', label: 'Store ID', placeholder: 'Optional' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
                  <input
                    type="text"
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              {[
                { key: 'minQty', label: 'Min Qty *', placeholder: '10' },
                { key: 'maxQty', label: 'Max Qty *', placeholder: '100' },
                { key: 'reorderPoint', label: 'Reorder Point *', placeholder: '20' },
                { key: 'reorderQty', label: 'Reorder Qty *', placeholder: '50' },
                { key: 'leadTimeDays', label: 'Lead Time (days)', placeholder: '7' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
                  <input
                    type="number"
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createRule}
                disabled={creating || !form.minQty || !form.maxQty || !form.reorderPoint || !form.reorderQty}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                {creating ? 'Creating…' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
