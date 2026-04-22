'use client'

import { TopBar } from '@/components/layout/TopBar'
import { useEffect, useState, useCallback } from 'react'
import { Plus, CreditCard, Check, X } from 'lucide-react'

interface StoreOption { id: string; name: string }

interface PaymentMethod {
  id: string
  method: string
  displayName: string
  isActive: boolean
  allowChange: boolean
  allowOverTender: boolean
  maxOverTender: number | null
  minAmount: number | null
  maxAmount: number | null
  requireSignature: boolean
  signatureThreshold: number | null
  processorType: string | null
  sortOrder: number
  store: { id: string; name: string }
}

const METHOD_ICONS: Record<string, string> = {
  cash: 'Cash',
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  debit: 'Debit',
  'gift-card': 'Gift',
  'store-credit': 'Credit',
  loyalty: 'Points',
}

export default function PaymentMethodsPage() {
  const [stores, setStores] = useState<StoreOption[]>([])
  const [selectedStore, setSelectedStore] = useState('')
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then((data: StoreOption[]) => {
      setStores(data)
      if (data.length > 0) setSelectedStore(data[0].id)
    })
  }, [])

  const loadMethods = useCallback(async (storeId: string) => {
    if (!storeId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/configuration/payment-methods?storeId=${storeId}`)
      if (res.ok) setMethods(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedStore) loadMethods(selectedStore)
  }, [selectedStore, loadMethods])

  async function toggleActive(id: string, current: boolean) {
    setToggling(id)
    try {
      const res = await fetch(`/api/configuration/payment-methods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      if (res.ok) {
        setMethods(prev => prev.map(m => m.id === id ? { ...m, isActive: !current } : m))
      }
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Payment Methods" />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <select
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none"
              value={selectedStore}
              onChange={e => setSelectedStore(e.target.value)}
            >
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors"
            onClick={() => {/* future: open modal */}}
          >
            <Plus className="w-4 h-4" />
            Add Method
          </button>
        </div>

        {loading ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <p className="text-zinc-500 text-sm">Loading...</p>
          </div>
        ) : methods.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <CreditCard className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No payment methods configured for this store.</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Method</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Display Name</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Allow Change</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Over-tender</th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Max Amount</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Signature</th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Processor</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Active</th>
                </tr>
              </thead>
              <tbody>
                {methods.map((m) => (
                  <tr key={m.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                        {METHOD_ICONS[m.method] ?? m.method.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-zinc-100">{m.displayName}</td>
                    <td className="px-3 py-3 text-center">
                      {m.allowChange ? <Check className="w-3.5 h-3.5 text-green-400 mx-auto" /> : <X className="w-3.5 h-3.5 text-zinc-600 mx-auto" />}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {m.allowOverTender ? <Check className="w-3.5 h-3.5 text-green-400 mx-auto" /> : <X className="w-3.5 h-3.5 text-zinc-600 mx-auto" />}
                    </td>
                    <td className="px-3 py-3 text-[13px] text-zinc-400">
                      {m.maxAmount != null ? `$${m.maxAmount.toLocaleString()}` : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {m.requireSignature
                        ? <span className="text-[11px] text-yellow-400">{m.signatureThreshold != null ? `>$${m.signatureThreshold}` : 'Always'}</span>
                        : <X className="w-3.5 h-3.5 text-zinc-600 mx-auto" />}
                    </td>
                    <td className="px-3 py-3 text-[13px] text-zinc-500">
                      {m.processorType ?? <span className="text-zinc-600 italic">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => toggleActive(m.id, m.isActive)}
                        disabled={toggling === m.id}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          m.isActive
                            ? 'bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400'
                            : 'bg-zinc-700/50 text-zinc-500 hover:bg-green-500/15 hover:text-green-400'
                        }`}
                      >
                        {toggling === m.id ? '...' : m.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
