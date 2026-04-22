'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'

const FIELD = 'w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500'
const LABEL = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

export default function NewItemChargePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    chargeNo: '',
    description: '',
    genProdPostingGroup: '',
    vatProdPostingGroup: '',
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2600)
  }

  const save = async () => {
    if (!form.chargeNo) { notify('Charge No. is required', 'err'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/inventory/item-charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed')
      }
      notify('Item charge created')
      setTimeout(() => router.push('/inventory/item-charges'), 700)
    } catch (e) {
      notify(String(e), 'err')
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="New Item Charge"
        breadcrumb={[{ label: 'Inventory', href: '/inventory' }, { label: 'Item Charges', href: '/inventory/item-charges' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/inventory/item-charges" className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">Cancel</Link>
            <button onClick={save} disabled={saving}
              className="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
              {saving ? 'Saving…' : 'Create Item Charge'}
            </button>
          </div>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50">
            <h2 className="text-sm font-semibold text-zinc-100">Item Charge</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>No. <span className="text-red-400">*</span></label>
                <input type="text" value={form.chargeNo} onChange={e => setForm(f => ({ ...f, chargeNo: e.target.value }))}
                  placeholder="IC-FREIGHT" className={FIELD} />
              </div>
              <div>
                <label className={LABEL}>Description</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Freight Charge" className={FIELD} />
              </div>
              <div>
                <label className={LABEL}>Gen. Prod. Posting Group</label>
                <input type="text" value={form.genProdPostingGroup} onChange={e => setForm(f => ({ ...f, genProdPostingGroup: e.target.value }))}
                  placeholder="MISC" className={FIELD} />
              </div>
              <div>
                <label className={LABEL}>VAT Prod. Posting Group</label>
                <input type="text" value={form.vatProdPostingGroup} onChange={e => setForm(f => ({ ...f, vatProdPostingGroup: e.target.value }))}
                  placeholder="STANDARD" className={FIELD} />
              </div>
            </div>
            <div className="pt-2 text-xs text-zinc-600">
              Item charges are used to assign additional costs (freight, insurance, etc.) to item transactions.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
