'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Trash2, AlertTriangle, ChevronDown, ChevronRight,
  Phone, MessageSquare, Mail, Globe, User, ShoppingCart, Shield,
} from 'lucide-react'

type OrderLine = {
  productId?: string
  productName: string
  sku?: string
  qty: number
  unitPrice: number
  discount: number
  lineTotal: number
  overrideBy?: string
  overrideReason?: string
  _isOverride?: boolean
}

type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  totalSpent: number
  visitCount: number
}

type Script = {
  id: string
  name: string
  trigger: string
  content: string
  isActive: boolean
}

type FraudRule = {
  id: string
  ruleName: string
  ruleType: string
  threshold: number | null
  points: number
}

const CHANNELS = [
  { value: 'phone', label: 'Phone', Icon: Phone },
  { value: 'chat', label: 'Chat', Icon: MessageSquare },
  { value: 'email', label: 'Email', Icon: Mail },
  { value: 'web', label: 'Web', Icon: Globe },
]

const PAYMENT_METHODS = ['credit_card', 'check', 'cash', 'gift_card']
const SCRIPT_TRIGGERS = ['greeting', 'objection', 'upsell', 'closing', 'hold', 'return']

function computeFraudScore(lines: OrderLine[], customerId: string | null, total: number, rules: FraudRule[]) {
  let score = 0
  const flags: string[] = []
  for (const rule of rules) {
    let triggered = false
    if (rule.ruleType === 'order-amount' && rule.threshold != null && total >= rule.threshold) triggered = true
    if (rule.ruleType === 'new-customer' && !customerId) triggered = true
    if (rule.ruleType === 'multiple-cards' && lines.some((l) => l._isOverride)) triggered = true
    if (rule.ruleType === 'shipping-mismatch' && !customerId) triggered = true
    if (rule.ruleType === 'velocity' && rule.threshold != null && total >= rule.threshold) triggered = true
    if (triggered) { score += rule.points; flags.push(rule.ruleName) }
  }
  return { score, flags }
}

export default function NewCallCenterOrder() {
  const router = useRouter()
  const [agentName, setAgentName] = useState('')
  const [channel, setChannel] = useState('phone')
  const [customerSearch, setCustomerSearch] = useState('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [lines, setLines] = useState<OrderLine[]>([])
  const [newLine, setNewLine] = useState<Partial<OrderLine>>({ productName: '', qty: 1, unitPrice: 0, discount: 0 })
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [paymentRef, setPaymentRef] = useState('')
  const [notes, setNotes] = useState('')
  const [shipping, setShipping] = useState(0)
  const [taxRate] = useState(0.0825)
  const [fraudRules, setFraudRules] = useState<FraudRule[]>([])
  const [fraudScore, setFraudScore] = useState(0)
  const [fraudFlags, setFraudFlags] = useState<string[]>([])
  const [scripts, setScripts] = useState<Script[]>([])
  const [scriptsOpen, setScriptsOpen] = useState(true)
  const [openTrigger, setOpenTrigger] = useState<string | null>('greeting')
  const [submitting, setSubmitting] = useState(false)
  const [holdReason, setHoldReason] = useState('')
  const [showHoldModal, setShowHoldModal] = useState(false)

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const tax = subtotal * taxRate
  const total = subtotal + tax + shipping

  const recomputeFraud = useCallback(() => {
    const { score, flags } = computeFraudScore(lines, customer?.id ?? null, total, fraudRules)
    setFraudScore(score); setFraudFlags(flags)
  }, [lines, customer, total, fraudRules])

  useEffect(() => { recomputeFraud() }, [recomputeFraud])
  useEffect(() => {
    fetch('/api/call-center/fraud-rules').then((r) => r.json()).then(setFraudRules)
    fetch('/api/call-center/scripts').then((r) => r.json()).then(setScripts)
  }, [])
  useEffect(() => {
    if (customerSearch.length < 2) { setCustomers([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}`)
      setCustomers(await res.json())
      setShowCustomerDropdown(true)
    }, 300)
    return () => clearTimeout(t)
  }, [customerSearch])

  function addLine() {
    if (!newLine.productName || !newLine.unitPrice) return
    const qty = newLine.qty ?? 1; const unitPrice = newLine.unitPrice ?? 0; const discount = newLine.discount ?? 0
    const lineTotal = qty * unitPrice * (1 - discount / 100)
    setLines((prev) => [...prev, { productName: newLine.productName!, sku: newLine.sku, qty, unitPrice, discount, lineTotal, overrideBy: newLine._isOverride ? agentName : undefined, overrideReason: newLine.overrideReason, _isOverride: newLine._isOverride }])
    setNewLine({ productName: '', qty: 1, unitPrice: 0, discount: 0 })
  }

  async function saveOrder(status: string) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/call-center/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName, channel, customerId: customer?.id ?? null, status, subtotal, tax, shipping, total, paymentMethod, paymentRef, notes, fraudScore, fraudFlags: JSON.stringify(fraudFlags), lines: lines.map(({ _isOverride, ...l }) => l) }),
      })
      const data = await res.json()
      router.push(`/call-center/orders/${data.id}`)
    } finally { setSubmitting(false) }
  }

  async function placeHold() {
    setSubmitting(true)
    try {
      const orderRes = await fetch('/api/call-center/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName, channel, customerId: customer?.id ?? null, status: 'draft', subtotal, tax, shipping, total, paymentMethod, paymentRef, notes, fraudScore, fraudFlags: JSON.stringify(fraudFlags), lines: lines.map(({ _isOverride, ...l }) => l) }),
      })
      const order = await orderRes.json()
      await fetch(`/api/call-center/orders/${order.id}/hold`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ holdType: 'manager', reason: holdReason, placedBy: agentName }) })
      router.push(`/call-center/orders/${order.id}`)
    } finally { setSubmitting(false); setShowHoldModal(false) }
  }

  const fraudBar = Math.min(fraudScore, 100)
  const fraudColor = fraudScore >= 50 ? 'bg-red-500' : fraudScore >= 25 ? 'bg-yellow-500' : 'bg-green-500'
  const scriptsByTrigger = SCRIPT_TRIGGERS.reduce<Record<string, Script[]>>((acc, t) => { acc[t] = scripts.filter((s) => s.trigger === t && s.isActive); return acc }, {})

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="w-6 h-6 text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">New Call Center Order</h1>
          <p className="text-zinc-500 text-sm">D365 Commerce — Call Center Order Entry</p>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex-1 space-y-4 min-w-0">
          {/* Top Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Agent Name</label>
              <input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Agent name" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Channel</label>
              <div className="flex gap-2">
                {CHANNELS.map(({ value, label, Icon }) => (
                  <button key={value} onClick={() => setChannel(value)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${channel === value ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                    <Icon className="w-3 h-3" />{label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <label className="text-xs text-zinc-500 block mb-1">Customer Search</label>
              <input value={customerSearch} onChange={(e) => { setCustomerSearch(e.target.value); setCustomer(null) }} placeholder="Name, email, phone..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              {showCustomerDropdown && customers.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl">
                  {customers.map((c) => (
                    <button key={c.id} onClick={() => { setCustomer(c); setCustomerSearch(`${c.firstName} ${c.lastName}`); setShowCustomerDropdown(false) }} className="w-full text-left px-3 py-2 hover:bg-zinc-700 text-sm text-zinc-200">
                      {c.firstName} {c.lastName}<span className="text-zinc-500 ml-2">{c.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {customer && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-6">
              <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-blue-400" /></div>
              <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                <div><div className="text-zinc-500 text-xs">Name</div><div className="text-zinc-100 font-medium">{customer.firstName} {customer.lastName}</div></div>
                <div><div className="text-zinc-500 text-xs">Email</div><div className="text-zinc-300">{customer.email ?? '—'}</div></div>
                <div><div className="text-zinc-500 text-xs">Phone</div><div className="text-zinc-300">{customer.phone ?? '—'}</div></div>
                <div><div className="text-zinc-500 text-xs">Orders / Spent</div><div className="text-zinc-300">{customer.visitCount} / ${customer.totalSpent.toFixed(2)}</div></div>
              </div>
            </div>
          )}
          {/* Order Lines */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800"><h2 className="font-semibold text-zinc-100">Order Lines</h2></div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Product', 'SKU', 'Qty', 'Unit Price', 'Discount %', 'Line Total', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className={`border-b border-zinc-800/50 ${line._isOverride ? 'bg-red-950/20' : ''}`}>
                    <td className="px-4 py-2 text-zinc-200">{line._isOverride && <span className="text-red-400 mr-1" title={`Override: ${line.overrideReason}`}>*</span>}{line.productName}</td>
                    <td className="px-4 py-2 text-zinc-500 font-mono text-xs">{line.sku ?? '—'}</td>
                    <td className="px-4 py-2 text-zinc-300">{line.qty}</td>
                    <td className="px-4 py-2 text-zinc-300">${line.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 text-zinc-300">{line.discount}%</td>
                    <td className="px-4 py-2 text-zinc-200 font-medium">${line.lineTotal.toFixed(2)}</td>
                    <td className="px-4 py-2"><button onClick={() => setLines((p) => p.filter((_, i) => i !== idx))} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
                <tr className="border-b border-zinc-800/50 bg-zinc-800/20">
                  <td className="px-4 py-2"><input value={newLine.productName ?? ''} onChange={(e) => setNewLine((p) => ({ ...p, productName: e.target.value }))} placeholder="Product name" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none" /></td>
                  <td className="px-4 py-2"><input value={newLine.sku ?? ''} onChange={(e) => setNewLine((p) => ({ ...p, sku: e.target.value }))} placeholder="SKU" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none" /></td>
                  <td className="px-4 py-2"><input type="number" min={1} value={newLine.qty ?? 1} onChange={(e) => setNewLine((p) => ({ ...p, qty: parseInt(e.target.value) }))} className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" /></td>
                  <td className="px-4 py-2"><input type="number" min={0} step={0.01} value={newLine.unitPrice ?? 0} onChange={(e) => setNewLine((p) => ({ ...p, unitPrice: parseFloat(e.target.value) }))} className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" /></td>
                  <td className="px-4 py-2"><input type="number" min={0} max={100} value={newLine.discount ?? 0} onChange={(e) => setNewLine((p) => ({ ...p, discount: parseFloat(e.target.value) }))} className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" /></td>
                  <td className="px-4 py-2 text-zinc-500 text-xs">${(((newLine.qty ?? 1) * (newLine.unitPrice ?? 0)) * (1 - (newLine.discount ?? 0) / 100)).toFixed(2)}</td>
                  <td className="px-4 py-2"><button onClick={addLine} className="bg-blue-600 hover:bg-blue-500 text-white rounded p-1"><Plus className="w-3 h-3" /></button></td>
                </tr>
              </tbody>
            </table>
            <div className="p-4 border-t border-zinc-800 bg-zinc-800/20">
              <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={newLine._isOverride ?? false} onChange={(e) => setNewLine((p) => ({ ...p, _isOverride: e.target.checked }))} className="accent-red-500" />
                <span className="text-red-400 font-medium">Manual Price Override</span>
              </label>
              {newLine._isOverride && (
                <input value={newLine.overrideReason ?? ''} onChange={(e) => setNewLine((p) => ({ ...p, overrideReason: e.target.value }))} placeholder="Override reason (required)" className="mt-2 w-full bg-zinc-800 border border-red-800 rounded px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none" />
              )}
            </div>
          </div>
          {/* Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="font-semibold text-zinc-100 mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-400"><span>Tax (8.25%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-400 items-center"><span>Shipping</span><input type="number" min={0} step={0.01} value={shipping} onChange={(e) => setShipping(parseFloat(e.target.value))} className="w-24 text-right bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-zinc-100 text-xs focus:outline-none" /></div>
              <div className="flex justify-between text-zinc-100 font-bold text-base border-t border-zinc-800 pt-2"><span>TOTAL</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>
          {/* Fraud Meter */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className={`w-4 h-4 ${fraudScore >= 50 ? 'text-red-400' : fraudScore >= 25 ? 'text-yellow-400' : 'text-green-400'}`} />
              <h2 className="font-semibold text-zinc-100">Fraud Score</h2>
              <span className={`ml-auto text-lg font-bold ${fraudScore >= 50 ? 'text-red-400' : fraudScore >= 25 ? 'text-yellow-400' : 'text-green-400'}`}>{fraudScore} / 100</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 mb-3"><div className={`h-3 rounded-full transition-all ${fraudColor}`} style={{ width: `${fraudBar}%` }} /></div>
            {fraudFlags.length > 0 ? (
              <div className="flex flex-wrap gap-2">{fraudFlags.map((flag) => (<span key={flag} className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2 py-0.5 rounded"><AlertTriangle className="w-3 h-3 inline mr-1" />{flag}</span>))}</div>
            ) : <p className="text-xs text-zinc-600">No fraud flags triggered.</p>}
            {fraudScore >= 50 && <p className="text-xs text-red-400 mt-2 font-medium">Score 50+ — order will be placed on fraud hold automatically.</p>}
          </div>
          {/* Payment */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="font-semibold text-zinc-100 mb-3">Payment</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none">
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Reference / Auth Code</label>
                <input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="Auth code, check #, etc." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none" />
              </div>
            </div>
          </div>
          {/* Notes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <label className="text-xs text-zinc-500 block mb-1">Order Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Internal notes..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none" />
          </div>
          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => saveOrder('draft')} disabled={submitting} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">Save Draft</button>
            <button onClick={() => setShowHoldModal(true)} disabled={submitting} className="flex-1 bg-orange-600/80 hover:bg-orange-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">Place Hold</button>
            <button onClick={() => saveOrder('submitted')} disabled={submitting || lines.length === 0} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">Submit Order</button>
          </div>
        </div>
        {/* Scripts Sidebar */}
        <div className={`transition-all ${scriptsOpen ? 'w-80' : 'w-10'} shrink-0`}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl h-full">
            <button onClick={() => setScriptsOpen((p) => !p)} className="w-full flex items-center gap-2 p-4 border-b border-zinc-800 text-zinc-100 font-semibold text-sm">
              {scriptsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {scriptsOpen && 'Agent Scripts'}
            </button>
            {scriptsOpen && (
              <div className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {SCRIPT_TRIGGERS.map((trigger) => (
                  <div key={trigger}>
                    <button onClick={() => setOpenTrigger((p) => (p === trigger ? null : trigger))} className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded text-xs font-semibold text-zinc-400 hover:text-zinc-200 uppercase tracking-wide">
                      {trigger}<ChevronRight className={`w-3 h-3 transition-transform ${openTrigger === trigger ? 'rotate-90' : ''}`} />
                    </button>
                    {openTrigger === trigger && (
                      <div className="space-y-2 mt-1">
                        {(scriptsByTrigger[trigger] ?? []).length === 0 ? (
                          <p className="text-xs text-zinc-700 px-2">No scripts.</p>
                        ) : (scriptsByTrigger[trigger] ?? []).map((s) => (
                          <div key={s.id} className="bg-zinc-800 rounded-lg p-3">
                            <div className="text-xs font-medium text-zinc-300 mb-1">{s.name}</div>
                            <p className="text-xs text-zinc-500 leading-relaxed whitespace-pre-wrap">{s.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {showHoldModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-zinc-100 mb-4">Place Order on Hold</h3>
            <textarea value={holdReason} onChange={(e) => setHoldReason(e.target.value)} rows={4} placeholder="Hold reason (required)..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowHoldModal(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={placeHold} disabled={!holdReason.trim() || submitting} className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Confirm Hold</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
