'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import {
  Save, X, Plus, Trash2, Printer, Send, ChevronDown,
  CheckCircle2, FileText, MoreHorizontal, ChevronRight,
  User, CreditCard, AlertCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  id: string
  firstName: string
  lastName: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  creditLimit: number
  totalSpent: number
}

type LineItem = {
  id: string
  lineType: string
  itemNo: string
  description: string
  quantity: number
  unitOfMeasure: string
  unitPrice: number
  discountPct: number
  vatPct: number
  lineTotal: number
}

type ShipToMode = 'customer' | 'another' | 'custom'

// ─── Constants ────────────────────────────────────────────────────────────────

const LINE_TYPES = ['Item', 'G/L Account', 'Resource', 'Fixed Asset', 'Comment']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MXN', 'JPY', 'CHF']
const UOM_OPTIONS = ['PCS', 'EA', 'BOX', 'CASE', 'KG', 'LB', 'OZ', 'L', 'ML', 'M', 'FT', 'PACK', 'DOZ']
const SHIPMENT_METHODS = ['EXW', 'FOB', 'CIF', 'DDP', 'DAP', 'FCA']
const SHIPPING_AGENTS = ['UPS', 'FedEx', 'USPS', 'DHL', 'Amazon Logistics', 'Freight', 'Will Call']
const SHIPPING_SERVICES = ['Ground', '2-Day', 'Overnight', 'International', 'Priority Mail', 'Economy']
const LOCATION_CODES = ['MAIN', 'WEST', 'EAST', 'NORTH']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function newLine(): LineItem {
  return {
    id: crypto.randomUUID(),
    lineType: 'Item',
    itemNo: '',
    description: '',
    quantity: 1,
    unitOfMeasure: 'PCS',
    unitPrice: 0,
    discountPct: 0,
    vatPct: 8.25,
    lineTotal: 0,
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FastTab({
  title, defaultOpen = true, children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details open={defaultOpen} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden group">
      <summary className="px-5 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-800/30 flex items-center justify-between list-none select-none">
        <span>{title}</span>
        <ChevronDown className="w-4 h-4 text-zinc-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5 pt-3 border-t border-zinc-800/40">
        {children}
      </div>
    </details>
  )
}

const inputCls = 'w-full bg-[#0d0e24] border border-zinc-700/60 rounded px-3 py-1.5 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/70 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'
const readonlyCls = 'w-full bg-zinc-800/40 border border-zinc-700/40 rounded px-3 py-1.5 text-[13px] text-zinc-400 cursor-not-allowed'

function Field({ label, required, children, span }: { label: string; required?: boolean; children: React.ReactNode; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <label className={labelCls}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewSalesOrderPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [showCustomerDrop, setShowCustomerDrop] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [shipToMode, setShipToMode] = useState<ShipToMode>('customer')
  const [showProcessMenu, setShowProcessMenu] = useState(false)

  // Document Header
  const [header, setHeader] = useState({
    orderNo: 'SO-' + String(Math.floor(Math.random() * 99999 + 1)).padStart(5, '0'),
    orderDate: today(),
    customerNo: '',
    customerName: '',
    externalDocNo: '',
    currencyCode: 'USD',
    salespersonCode: '',
    locationCode: 'MAIN',
    requestedDeliveryDate: '',
  })

  // Shipping
  const [shipping, setShipping] = useState({
    shipToName: '',
    shipToAddress: '',
    shipToCity: '',
    shipToState: '',
    shipToZip: '',
    shipToCountry: 'US',
    shipmentMethodCode: '',
    shippingAgentCode: '',
    shippingAgentService: '',
    shipmentDate: '',
  })

  // Lines
  const [lines, setLines] = useState<LineItem[]>([newLine()])

  // ── Customer search ──
  const searchCustomers = useCallback(async (q: string) => {
    if (q.length < 1) { setCustomerResults([]); return }
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(q)}&limit=8`)
      if (res.ok) {
        const data = await res.json()
        setCustomerResults(Array.isArray(data) ? data : (data.customers ?? []))
      }
    } catch { /* silently ignore */ }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => searchCustomers(customerSearch), 250)
    return () => clearTimeout(t)
  }, [customerSearch, searchCustomers])

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c)
    const name = `${c.firstName} ${c.lastName}`.trim()
    setHeader(p => ({ ...p, customerNo: c.id.slice(-8).toUpperCase(), customerName: name }))
    setCustomerSearch(name)
    setCustomerResults([])
    setShowCustomerDrop(false)
    if (shipToMode === 'customer') {
      setShipping(p => ({
        ...p,
        shipToName: name,
        shipToAddress: c.address ?? '',
        shipToCity: c.city ?? '',
        shipToState: c.state ?? '',
        shipToZip: c.zip ?? '',
      }))
    }
  }

  // ── Line management ──
  function updateLine(id: string, field: keyof LineItem, value: string | number) {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l
      const updated = { ...l, [field]: value }
      const discountedPrice = updated.unitPrice * (1 - updated.discountPct / 100)
      updated.lineTotal = updated.quantity * discountedPrice
      return updated
    }))
  }

  function removeLine(id: string) {
    setLines(prev => prev.filter(l => l.id !== id))
  }

  // ── Computed totals ──
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const discountAmount = lines.reduce((s, l) => s + (l.quantity * l.unitPrice * l.discountPct / 100), 0)
  const vatAmount = lines.reduce((s, l) => s + l.lineTotal * (l.vatPct / 100), 0)
  const totalInclVat = subtotal + vatAmount

  // ── Save ──
  async function save() {
    setError('')
    if (!header.customerName.trim()) { setError('Customer is required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/sales/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellToCustomerId: selectedCustomer?.id ?? null,
          sellToCustomerName: header.customerName,
          externalDocNo: header.externalDocNo || null,
          salespersonCode: header.salespersonCode || null,
          orderDate: header.orderDate,
          postingDate: header.orderDate,
          dueDate: header.requestedDeliveryDate || null,
          shipToName: shipping.shipToName || null,
          shipToAddress: shipping.shipToAddress || null,
          shipToCity: shipping.shipToCity || null,
          shipToState: shipping.shipToState || null,
          shipToZip: shipping.shipToZip || null,
          shippingAgentCode: shipping.shippingAgentCode || null,
          subtotal,
          discountAmount,
          taxAmount: vatAmount,
          totalAmount: totalInclVat,
          status: 'Open',
          items: lines
            .filter(l => l.lineType !== 'Comment' && (l.itemNo || l.description))
            .map(({ id: _id, ...rest }) => rest),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Server error')
      }
      const data = await res.json()
      router.push(`/sales/orders/${data.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create sales order')
      setSaving(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-[#0d0e24] text-zinc-100 flex flex-col">

      {/* TopBar */}
      <TopBar
        title="New Sales Order"
        breadcrumb={[
          { label: 'Sales', href: '/sales' },
          { label: 'Sales Orders', href: '/sales/orders' },
        ]}
      />

      {/* ── Action Ribbon ── */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-5 py-2.5 flex items-center gap-1 flex-wrap shrink-0">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-xs font-semibold text-white transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={async () => { await save() }}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] disabled:opacity-40 rounded text-xs font-medium text-zinc-200 transition-colors"
        >
          <Save className="w-3.5 h-3.5" /> Save &amp; Close
        </button>
        <Link
          href="/sales/orders/new"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New
        </Link>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-300 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>

        <div className="h-4 w-px bg-zinc-700 mx-0.5" />

        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <Printer className="w-3.5 h-3.5" /> Print
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProcessMenu(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Process
            <ChevronDown className="w-3 h-3 ml-0.5 text-zinc-500" />
          </button>
          {showProcessMenu && (
            <div
              className="absolute left-0 top-full mt-1 w-48 bg-[#16213e] border border-zinc-700 rounded-lg shadow-xl z-50 py-1"
              onMouseLeave={() => setShowProcessMenu(false)}
            >
              {['Post', 'Post and Print', 'Release', 'Reopen', 'Create Invoice', 'Create Warehouse Shipment'].map(a => (
                <button key={a} className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-[#243558] transition-colors">
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <Send className="w-3.5 h-3.5" /> Email
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Open
          </span>
          <Link
            href="/sales/orders"
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Discard
          </Link>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2.5 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-[13px] text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── Main Form Area ── */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-5xl space-y-3">

            {/* ── Document Header FastTab ── */}
            <FastTab title="Document Header">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">

                <Field label="Order No.">
                  <input readOnly value={header.orderNo} className={readonlyCls} />
                </Field>

                <Field label="Order Date">
                  <input
                    type="date"
                    value={header.orderDate}
                    onChange={e => setHeader(p => ({ ...p, orderDate: e.target.value }))}
                    className={inputCls}
                  />
                </Field>

                {/* Customer No. with typeahead */}
                <Field label="Customer No." required>
                  <div className="relative">
                    <input
                      value={customerSearch}
                      onChange={e => {
                        setCustomerSearch(e.target.value)
                        setShowCustomerDrop(true)
                        if (!e.target.value) {
                          setSelectedCustomer(null)
                          setHeader(p => ({ ...p, customerNo: '', customerName: '' }))
                        }
                      }}
                      onFocus={() => customerSearch && setShowCustomerDrop(true)}
                      placeholder="Search customers…"
                      className={inputCls}
                      autoComplete="off"
                    />
                    {showCustomerDrop && customerResults.length > 0 && (
                      <div className="absolute left-0 top-full mt-1 w-full bg-[#1a2540] border border-zinc-700 rounded-lg shadow-xl z-50 max-h-52 overflow-y-auto">
                        {customerResults.map(c => (
                          <button
                            key={c.id}
                            onClick={() => selectCustomer(c)}
                            className="w-full text-left px-3 py-2.5 hover:bg-[#243558] transition-colors border-b border-zinc-800/50 last:border-0"
                          >
                            <div className="text-[13px] text-zinc-100 font-medium">
                              {c.firstName} {c.lastName}
                            </div>
                            {c.email && (
                              <div className="text-[11px] text-zinc-500">{c.email}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>

                <Field label="Customer Name">
                  <input
                    readOnly={!!selectedCustomer}
                    value={header.customerName}
                    onChange={e => setHeader(p => ({ ...p, customerName: e.target.value }))}
                    placeholder="Auto-filled from customer"
                    className={selectedCustomer ? readonlyCls : inputCls}
                  />
                </Field>

                <Field label="External Document No.">
                  <input
                    value={header.externalDocNo}
                    onChange={e => setHeader(p => ({ ...p, externalDocNo: e.target.value }))}
                    placeholder="Customer PO number"
                    className={inputCls}
                  />
                </Field>

                <Field label="Currency Code">
                  <select
                    value={header.currencyCode}
                    onChange={e => setHeader(p => ({ ...p, currencyCode: e.target.value }))}
                    className={inputCls}
                  >
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Salesperson Code">
                  <input
                    value={header.salespersonCode}
                    onChange={e => setHeader(p => ({ ...p, salespersonCode: e.target.value }))}
                    placeholder="SP-001"
                    className={inputCls}
                  />
                </Field>

                <Field label="Location Code">
                  <select
                    value={header.locationCode}
                    onChange={e => setHeader(p => ({ ...p, locationCode: e.target.value }))}
                    className={inputCls}
                  >
                    {LOCATION_CODES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Requested Delivery Date" span>
                  <input
                    type="date"
                    value={header.requestedDeliveryDate}
                    onChange={e => setHeader(p => ({ ...p, requestedDeliveryDate: e.target.value }))}
                    className="w-64 bg-[#0d0e24] border border-zinc-700/60 rounded px-3 py-1.5 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/70 transition-colors"
                  />
                </Field>

              </div>
            </FastTab>

            {/* ── Shipping FastTab ── */}
            <FastTab title="Shipping" defaultOpen={false}>
              <div className="space-y-4">

                {/* Ship-to radio */}
                <div>
                  <label className={labelCls}>Ship-to</label>
                  <div className="flex items-center gap-5 mt-1">
                    {(['customer', 'another', 'custom'] as ShipToMode[]).map(m => (
                      <label key={m} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="shipToMode"
                          value={m}
                          checked={shipToMode === m}
                          onChange={() => {
                            setShipToMode(m)
                            if (m === 'customer' && selectedCustomer) {
                              setShipping(p => ({
                                ...p,
                                shipToName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
                                shipToAddress: selectedCustomer.address ?? '',
                                shipToCity: selectedCustomer.city ?? '',
                                shipToState: selectedCustomer.state ?? '',
                                shipToZip: selectedCustomer.zip ?? '',
                              }))
                            }
                          }}
                          className="accent-blue-500"
                        />
                        <span className="text-[13px] text-zinc-300 capitalize">
                          {m === 'customer' ? 'Customer Address' : m === 'another' ? 'Another Customer' : 'Custom Address'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Field label="Ship-to Name">
                    <input
                      value={shipping.shipToName}
                      onChange={e => setShipping(p => ({ ...p, shipToName: e.target.value }))}
                      placeholder="Ship-to name"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      value={shipping.shipToCountry}
                      onChange={e => setShipping(p => ({ ...p, shipToCountry: e.target.value }))}
                      placeholder="US"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Address" span>
                    <input
                      value={shipping.shipToAddress}
                      onChange={e => setShipping(p => ({ ...p, shipToAddress: e.target.value }))}
                      placeholder="Street address"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="City">
                    <input
                      value={shipping.shipToCity}
                      onChange={e => setShipping(p => ({ ...p, shipToCity: e.target.value }))}
                      placeholder="City"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="State / ZIP">
                    <div className="flex gap-2">
                      <input
                        value={shipping.shipToState}
                        onChange={e => setShipping(p => ({ ...p, shipToState: e.target.value }))}
                        placeholder="ST"
                        className="w-20 bg-[#0d0e24] border border-zinc-700/60 rounded px-3 py-1.5 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/70"
                      />
                      <input
                        value={shipping.shipToZip}
                        onChange={e => setShipping(p => ({ ...p, shipToZip: e.target.value }))}
                        placeholder="ZIP"
                        className="flex-1 bg-[#0d0e24] border border-zinc-700/60 rounded px-3 py-1.5 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/70"
                      />
                    </div>
                  </Field>
                  <Field label="Shipment Method Code">
                    <select
                      value={shipping.shipmentMethodCode}
                      onChange={e => setShipping(p => ({ ...p, shipmentMethodCode: e.target.value }))}
                      className={inputCls}
                    >
                      <option value="">— Select —</option>
                      {SHIPMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Shipping Agent Code">
                    <select
                      value={shipping.shippingAgentCode}
                      onChange={e => setShipping(p => ({ ...p, shippingAgentCode: e.target.value }))}
                      className={inputCls}
                    >
                      <option value="">— Select —</option>
                      {SHIPPING_AGENTS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </Field>
                  <Field label="Shipping Agent Service">
                    <select
                      value={shipping.shippingAgentService}
                      onChange={e => setShipping(p => ({ ...p, shippingAgentService: e.target.value }))}
                      className={inputCls}
                    >
                      <option value="">— Select —</option>
                      {SHIPPING_SERVICES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Shipment Date">
                    <input
                      type="date"
                      value={shipping.shipmentDate}
                      onChange={e => setShipping(p => ({ ...p, shipmentDate: e.target.value }))}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            </FastTab>

            {/* ── Order Lines ── */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-200">Lines</span>
                <button
                  onClick={() => setLines(p => [...p, newLine()])}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#0f1829]">
                      <th className="text-left px-3 py-2.5 text-zinc-500 font-semibold uppercase tracking-wide w-28">Type</th>
                      <th className="text-left px-3 py-2.5 text-zinc-500 font-semibold uppercase tracking-wide w-24">No.</th>
                      <th className="text-left px-3 py-2.5 text-zinc-500 font-semibold uppercase tracking-wide min-w-[140px]">Description</th>
                      <th className="text-right px-3 py-2.5 text-zinc-500 font-semibold uppercase tracking-wide w-20">Qty</th>
                      <th className="text-left px-3 py-2.5 text-zinc-500 font-semibold uppercase tracking-wide w-20">UoM</th>
                      <th className="text-right px-3 py-2.5 text-zinc-500 font-semibold uppercase tracking-wide w-28">Unit Price</th>
                      <th className="text-right px-3 py-2.5 text-zinc-500 font-semibold uppercase tracking-wide w-20">Disc %</th>
                      <th className="text-right px-3 py-2.5 text-zinc-500 font-semibold uppercase tracking-wide w-20">VAT %</th>
                      <th className="text-right px-3 py-2.5 text-zinc-500 font-semibold uppercase tracking-wide w-28">Line Amount</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {lines.map(line => (
                      <tr key={line.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-3 py-2">
                          <select
                            value={line.lineType}
                            onChange={e => updateLine(line.id, 'lineType', e.target.value)}
                            className="w-full bg-[#0d0e24] border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/60"
                          >
                            {LINE_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={line.itemNo}
                            onChange={e => updateLine(line.id, 'itemNo', e.target.value)}
                            placeholder="Item no."
                            className="w-full bg-[#0d0e24] border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/60"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={line.description}
                            onChange={e => updateLine(line.id, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full bg-[#0d0e24] border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/60"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.quantity}
                            onChange={e => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0d0e24] border border-zinc-700/60 rounded px-2 py-1 text-xs text-right text-zinc-200 focus:outline-none focus:border-blue-500/60"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={line.unitOfMeasure}
                            onChange={e => updateLine(line.id, 'unitOfMeasure', e.target.value)}
                            className="w-full bg-[#0d0e24] border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/60"
                          >
                            {UOM_OPTIONS.map(u => <option key={u}>{u}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={e => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0d0e24] border border-zinc-700/60 rounded px-2 py-1 text-xs text-right text-zinc-200 focus:outline-none focus:border-blue-500/60"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={line.discountPct}
                            onChange={e => updateLine(line.id, 'discountPct', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0d0e24] border border-zinc-700/60 rounded px-2 py-1 text-xs text-right text-zinc-200 focus:outline-none focus:border-blue-500/60"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={line.vatPct}
                            onChange={e => updateLine(line.id, 'vatPct', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0d0e24] border border-zinc-700/60 rounded px-2 py-1 text-xs text-right text-zinc-200 focus:outline-none focus:border-blue-500/60"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-200 font-mono tabular-nums">
                          {line.lineTotal.toFixed(2)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => removeLine(line.id)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {lines.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-zinc-600 text-xs">
                          No lines added — click &quot;+ Add Line&quot; to start
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Line Totals ── */}
              <div className="border-t border-zinc-800/60 px-5 py-4 flex justify-end">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Discount Amount</span>
                    <span className="font-mono tabular-nums text-amber-400">−{fmt(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400 border-t border-zinc-700/50 pt-1.5">
                    <span>Total Excl. VAT</span>
                    <span className="font-mono tabular-nums">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>VAT Amount</span>
                    <span className="font-mono tabular-nums">{fmt(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-100 font-semibold border-t border-zinc-700/50 pt-2">
                    <span>Total Incl. VAT</span>
                    <span className="font-mono tabular-nums">{fmt(totalInclVat)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Statistics FactBox sidebar ── */}
        <aside className="w-64 shrink-0 border-l border-zinc-800/60 bg-[#16213e] self-start sticky top-[89px] overflow-y-auto">

          {/* General statistics */}
          <div className="border-b border-zinc-800/60">
            <div className="px-4 py-2.5 flex items-center gap-2 bg-[#0f1829]">
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">General</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-zinc-500">Subtotal</span>
                <span className="text-[12px] font-mono text-zinc-200 tabular-nums">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-zinc-500">Discount Amt.</span>
                <span className="text-[12px] font-mono text-amber-400 tabular-nums">−{fmt(discountAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-zinc-800/60 pt-2">
                <span className="text-[11px] text-zinc-500">Total Excl. VAT</span>
                <span className="text-[12px] font-mono text-zinc-200 tabular-nums">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-zinc-500">VAT Amount</span>
                <span className="text-[12px] font-mono text-zinc-200 tabular-nums">{fmt(vatAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-zinc-700/50 pt-2">
                <span className="text-[12px] font-semibold text-zinc-300">Total Incl. VAT</span>
                <span className="text-[13px] font-mono font-bold text-blue-400 tabular-nums">{fmt(totalInclVat)}</span>
              </div>
            </div>
          </div>

          {/* Customer details */}
          <div>
            <div className="px-4 py-2.5 flex items-center gap-2 bg-[#0f1829]">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Customer Details</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {selectedCustomer ? (
                <>
                  <div>
                    <div className="text-[12px] font-medium text-zinc-200">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </div>
                    {selectedCustomer.email && (
                      <div className="text-[11px] text-zinc-500 mt-0.5">{selectedCustomer.email}</div>
                    )}
                  </div>
                  <div className="border-t border-zinc-800/60 pt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> Credit Limit
                      </span>
                      <span className="text-[12px] font-mono text-zinc-200 tabular-nums">
                        {fmt(selectedCustomer.creditLimit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-zinc-500">Balance</span>
                      <span className="text-[12px] font-mono text-zinc-200 tabular-nums">
                        {fmt(selectedCustomer.totalSpent)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-zinc-500">Balance (LCY)</span>
                      <span className="text-[12px] font-mono text-zinc-200 tabular-nums">
                        {fmt(selectedCustomer.totalSpent)}
                      </span>
                    </div>
                    {selectedCustomer.creditLimit > 0 && selectedCustomer.totalSpent > selectedCustomer.creditLimit * 0.8 && (
                      <div className="flex items-center gap-1.5 mt-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] text-amber-400">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        Near credit limit
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-[12px] text-zinc-600 py-2">
                  Select a customer to view details
                </div>
              )}
            </div>
          </div>

          {/* Quick nav */}
          <div className="border-t border-zinc-800/60 px-4 py-3">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Related</div>
            <div className="space-y-1">
              {['Sales Quotes', 'Invoices', 'Shipments', 'Return Orders'].map(r => (
                <button
                  key={r}
                  className="w-full flex items-center justify-between text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors py-0.5"
                >
                  <span>{r}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}
