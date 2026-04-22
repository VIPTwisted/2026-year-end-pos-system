'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Suspense } from 'react'

function NewPriceAttributeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') === 'component' ? 'component' : 'attribute'

  const [tab, setTab] = useState<'attribute' | 'component'>(defaultTab as 'attribute' | 'component')
  const [saving, setSaving] = useState(false)

  const [attrForm, setAttrForm] = useState({
    code: '', name: '', attributeType: 'product', dataType: 'text',
    optionsJson: '', sortOrder: '0', description: '', isActive: true,
  })
  const [compForm, setCompForm] = useState({
    code: '', name: '', componentType: 'base', description: '', isActive: true,
  })

  function setAttr(k: keyof typeof attrForm, v: string | boolean) {
    setAttrForm(f => ({ ...f, [k]: v }))
  }
  function setComp(k: keyof typeof compForm, v: string | boolean) {
    setCompForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (tab === 'attribute') {
        const res = await fetch('/api/pricing/price-attributes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...attrForm,
            sortOrder: parseInt(attrForm.sortOrder) || 0,
            optionsJson: attrForm.optionsJson || null,
          }),
        })
        if (!res.ok) throw new Error()
      } else {
        const res = await fetch('/api/pricing/price-component-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(compForm),
        })
        if (!res.ok) throw new Error()
      }
      router.push('/pricing/price-attributes')
    } catch {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 placeholder:text-zinc-600'
  const selectCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500'
  const labelCls = 'block text-[11px] uppercase tracking-wide text-zinc-500 mb-1'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Price Attribute Setup" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Tab Switcher */}
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
            {(['attribute', 'component'] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}>
                {t === 'attribute' ? 'Price Attribute' : 'Component Code'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
            {tab === 'attribute' ? (
              <>
                <h2 className="text-sm font-semibold text-zinc-200 mb-2">New Price Attribute</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Code *</label>
                    <input required value={attrForm.code} onChange={e => setAttr('code', e.target.value)}
                      className={inputCls} placeholder="CUST_TIER" />
                  </div>
                  <div>
                    <label className={labelCls}>Name *</label>
                    <input required value={attrForm.name} onChange={e => setAttr('name', e.target.value)}
                      className={inputCls} placeholder="Customer Tier" />
                  </div>
                  <div>
                    <label className={labelCls}>Attribute Type</label>
                    <select value={attrForm.attributeType} onChange={e => setAttr('attributeType', e.target.value)} className={selectCls}>
                      <option value="product">Product</option>
                      <option value="customer">Customer</option>
                      <option value="order">Order</option>
                      <option value="channel">Channel</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Data Type</label>
                    <select value={attrForm.dataType} onChange={e => setAttr('dataType', e.target.value)} className={selectCls}>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                      <option value="list">List</option>
                    </select>
                  </div>
                  {attrForm.dataType === 'list' && (
                    <div className="md:col-span-2">
                      <label className={labelCls}>Options (comma-separated)</label>
                      <input value={attrForm.optionsJson} onChange={e => setAttr('optionsJson', e.target.value)}
                        className={inputCls} placeholder="Gold,Silver,Bronze" />
                    </div>
                  )}
                  <div>
                    <label className={labelCls}>Sort Order</label>
                    <input type="number" value={attrForm.sortOrder} onChange={e => setAttr('sortOrder', e.target.value)}
                      className={inputCls} min="0" />
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <label className={labelCls + ' mb-0'}>Active</label>
                    <input type="checkbox" checked={attrForm.isActive} onChange={e => setAttr('isActive', e.target.checked)}
                      className="w-4 h-4 accent-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea value={attrForm.description} onChange={e => setAttr('description', e.target.value)}
                      className={`${inputCls} h-20 resize-none`} placeholder="Optional description..." />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-sm font-semibold text-zinc-200 mb-2">New Price Component Code</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Code *</label>
                    <input required value={compForm.code} onChange={e => setComp('code', e.target.value)}
                      className={inputCls} placeholder="BASE_PRICE" />
                  </div>
                  <div>
                    <label className={labelCls}>Name *</label>
                    <input required value={compForm.name} onChange={e => setComp('name', e.target.value)}
                      className={inputCls} placeholder="Base Price" />
                  </div>
                  <div>
                    <label className={labelCls}>Component Type</label>
                    <select value={compForm.componentType} onChange={e => setComp('componentType', e.target.value)} className={selectCls}>
                      <option value="base">Base</option>
                      <option value="discount">Discount</option>
                      <option value="surcharge">Surcharge</option>
                      <option value="tax">Tax</option>
                      <option value="freight">Freight</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <label className={labelCls + ' mb-0'}>Active</label>
                    <input type="checkbox" checked={compForm.isActive} onChange={e => setComp('isActive', e.target.checked)}
                      className="w-4 h-4 accent-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea value={compForm.description} onChange={e => setComp('description', e.target.value)}
                      className={`${inputCls} h-20 resize-none`} placeholder="Optional description..." />
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => router.push('/pricing/price-attributes')}
                className="px-4 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function NewPriceAttributePage() {
  return (
    <Suspense>
      <NewPriceAttributeForm />
    </Suspense>
  )
}
