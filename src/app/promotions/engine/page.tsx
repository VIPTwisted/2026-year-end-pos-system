'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

/* ─── Types ─────────────────────────────────────────────── */
interface Promo {
  id: number
  name: string
  type: 'BOGO' | 'PERCENT_OFF' | 'FIXED_OFF' | 'QTY_THRESHOLD'
  discount: string
  minPurchase: string
  channels: string
  start: string
  end: string
  uses: string
  stackable: boolean
  priority: number
  status: 'Active' | 'Scheduled' | 'Expired'
}

interface Coupon {
  id: number
  code: string
  promo: string
  type: string
  uses: string
  expiry: string
  status: 'Active' | 'Expired'
}

/* ─── Static data ────────────────────────────────────────── */
const PROMOS: Promo[] = [
  { id:1,  name:'Summer Coffee Deal',    type:'BOGO',           discount:'Buy 1 Get 1 50%',      minPurchase:'$0',  channels:'POS + Online', start:'Apr 1',    end:'Jun 30',   uses:'2,841', stackable:false, priority:10, status:'Active' },
  { id:2,  name:'Gold Member Bonus',     type:'PERCENT_OFF',    discount:'5%',                   minPurchase:'$0',  channels:'All',          start:'Apr 1',    end:'Dec 31',   uses:'1,204', stackable:true,  priority:5,  status:'Active' },
  { id:3,  name:'Bulk Headphones',       type:'QTY_THRESHOLD',  discount:'10% off 3+',           minPurchase:'$0',  channels:'POS',          start:'Apr 15',   end:'May 15',   uses:'89',    stackable:false, priority:20, status:'Active' },
  { id:4,  name:'Welcome Discount',      type:'PERCENT_OFF',    discount:'15% first purchase',   minPurchase:'$0',  channels:'Online',       start:'Ongoing',  end:'—',        uses:'412',   stackable:false, priority:15, status:'Active' },
  { id:5,  name:'Electronics Clearance', type:'PERCENT_OFF',    discount:'20%',                  minPurchase:'$50', channels:'POS',          start:'Apr 20',   end:'Apr 30',   uses:'234',   stackable:false, priority:25, status:'Active' },
  { id:6,  name:'Spring BOGO Tees',      type:'BOGO',           discount:'Buy 1 Get 1 Free',     minPurchase:'$0',  channels:'Online',       start:'Mar 1',    end:'May 31',   uses:'567',   stackable:false, priority:12, status:'Active' },
  { id:7,  name:'Loyal 10 Discount',     type:'PERCENT_OFF',    discount:'10%',                  minPurchase:'$25', channels:'All',          start:'Jan 1',    end:'Dec 31',   uses:'3,102', stackable:true,  priority:8,  status:'Active' },
  { id:8,  name:'Buy 3 Save $15',        type:'FIXED_OFF',      discount:'$15 off 3+ items',     minPurchase:'$60', channels:'POS',          start:'Apr 1',    end:'Apr 30',   uses:'45',    stackable:false, priority:30, status:'Active' },
  { id:9,  name:'Referral Reward',       type:'PERCENT_OFF',    discount:'10% one-time',         minPurchase:'$0',  channels:'Online',       start:'Ongoing',  end:'—',        uses:'198',   stackable:false, priority:18, status:'Active' },
  { id:10, name:'Clearance Footwear',    type:'PERCENT_OFF',    discount:'30%',                  minPurchase:'$0',  channels:'POS + Online', start:'Apr 10',   end:'Apr 25',   uses:'312',   stackable:false, priority:22, status:'Active' },
]

const COUPONS: Coupon[] = [
  { id:1,  code:'SAVE15',     promo:'Welcome Discount',    type:'Universal',       uses:'412/unlimited', expiry:'Dec 31, 2026', status:'Active' },
  { id:2,  code:'SUMMER20',   promo:'Summer Sale',         type:'Universal',       uses:'89/500',        expiry:'Jun 30, 2026', status:'Active' },
  { id:3,  code:'VIP2026',    promo:'VIP Exclusive',       type:'Single-use batch',uses:'34/100',        expiry:'Apr 30, 2026', status:'Active' },
  { id:4,  code:'EXPIRED10',  promo:'Old Deal',            type:'Universal',       uses:'847/1000',      expiry:'Mar 31, 2026', status:'Expired' },
  { id:5,  code:'BULK10',     promo:'Bulk Headphones',     type:'Universal',       uses:'89/unlimited',  expiry:'May 15, 2026', status:'Active' },
  { id:6,  code:'SPRING25',   promo:'Spring BOGO Tees',    type:'Universal',       uses:'120/unlimited', expiry:'May 31, 2026', status:'Active' },
  { id:7,  code:'LOYAL10',    promo:'Loyal 10 Discount',   type:'Universal',       uses:'3102/unlimited',expiry:'Dec 31, 2026', status:'Active' },
  { id:8,  code:'REFER10',    promo:'Referral Reward',     type:'Single-use batch',uses:'198/unlimited', expiry:'Dec 31, 2026', status:'Active' },
  { id:9,  code:'CLEAR30',    promo:'Clearance Footwear',  type:'Universal',       uses:'312/unlimited', expiry:'Apr 25, 2026', status:'Active' },
  { id:10, code:'OLDSPRING',  promo:'Old Spring Promo',    type:'Universal',       uses:'240/300',       expiry:'Mar 1, 2026',  status:'Expired' },
]

const TYPE_CHIP: Record<string, string> = {
  BOGO:          'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  PERCENT_OFF:   'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  FIXED_OFF:     'bg-teal-500/20 text-teal-300 border border-teal-500/30',
  QTY_THRESHOLD: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
}

const TABS = ['Active Promotions', 'Scheduled', 'Expired', 'Coupons', 'Performance'] as const
type Tab = typeof TABS[number]

/* ─── KPIs ───────────────────────────────────────────────── */
const KPIS = [
  { label:'Total Promotions',    value:'23' },
  { label:'Discounts Given YTD', value:'$84,231' },
  { label:'Avg Discount/TXN',    value:'$12.40' },
  { label:'Top Promo',           value:'Summer Coffee Deal', small:true },
]

/* ─── SVG Performance Charts ─────────────────────────────── */
function BarChart() {
  const bars = [
    { name:'Summer Coffee Deal',    val:28400 },
    { name:'Loyal 10 Discount',     val:18200 },
    { name:'Electronics Clearance', val:12600 },
    { name:'Welcome Discount',      val:9800 },
    { name:'Clearance Footwear',    val:7200 },
  ]
  const max = 30000
  return (
    <svg viewBox="0 0 500 180" className="w-full h-44">
      {bars.map((b, i) => {
        const w = (b.val / max) * 340
        const y = 18 + i * 32
        return (
          <g key={i}>
            <text x="0" y={y + 12} fontSize="10" fill="#94a3b8" className="font-mono">{b.name.slice(0,22)}</text>
            <rect x="150" y={y} width={w} height="18" rx="3" fill="rgba(99,102,241,0.6)" />
            <text x={155 + w} y={y + 13} fontSize="10" fill="#e2e8f0">${(b.val/1000).toFixed(1)}k</text>
          </g>
        )
      })}
    </svg>
  )
}

function LineChart() {
  // 112 days Jan–Apr, show daily discount totals (synthetic)
  const pts: number[] = []
  for (let i = 0; i < 112; i++) pts.push(300 + Math.sin(i * 0.18) * 180 + Math.random() * 120)
  const W = 480, H = 100, pad = 10
  const minV = 0, maxV = 700
  const coords = pts.map((v, i) => {
    const x = pad + (i / (pts.length - 1)) * (W - pad * 2)
    const y = H - pad - ((v - minV) / (maxV - minV)) * (H - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const fill = coords.map((c, i) => {
    if (i === 0) return `M ${c}`
    return `L ${c}`
  }).join(' ') + ` L ${(pad + (W - pad * 2)).toFixed(1)},${H - pad} L ${pad},${H - pad} Z`
  const line = coords.map((c, i) => (i === 0 ? `M ${c}` : `L ${c}`)).join(' ')
  const months = ['Jan','Feb','Mar','Apr']
  return (
    <svg viewBox={`0 0 ${W} ${H + 16}`} className="w-full h-28">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(99,102,241,0.4)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0)" />
        </linearGradient>
      </defs>
      {[0,25,50,75,100].map(p => {
        const y = H - pad - (p / 100) * (H - pad * 2)
        return <line key={p} x1={pad} y1={y} x2={W - pad} y2={y} stroke="rgba(255,255,255,0.05)" />
      })}
      <path d={fill} fill="url(#lg1)" />
      <path d={line} fill="none" stroke="rgba(99,102,241,0.9)" strokeWidth="1.5" />
      {months.map((m, i) => (
        <text key={m} x={pad + (i / 3) * (W - pad * 2)} y={H + 12} fontSize="9" fill="#64748b" textAnchor="middle">{m}</text>
      ))}
    </svg>
  )
}

/* ─── Drawer ─────────────────────────────────────────────── */
function PromoDrawer({ promo, onClose }: { promo: Promo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-[480px] h-full flex flex-col overflow-y-auto" style={{ background:'#16213e', borderLeft:'1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
          <h2 className="text-base font-semibold text-[#e2e8f0]">{promo.name}</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#e2e8f0] text-xl leading-none">×</button>
        </div>
        <div className="flex-1 px-6 py-5 space-y-5">
          <Row label="Type"><span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_CHIP[promo.type]}`}>{promo.type.replace('_',' ')}</span></Row>
          <Row label="Discount">{promo.discount}</Row>
          <Row label="Channels">{promo.channels}</Row>
          <Row label="Date Window">{promo.start} → {promo.end}</Row>
          <Row label="Min Purchase">{promo.minPurchase}</Row>
          <Row label="Stackable"><span className={promo.stackable ? 'text-emerald-400' : 'text-red-400'}>{promo.stackable ? 'Yes' : 'No'}</span></Row>
          <Row label="Priority"><span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded text-xs">{promo.priority}</span></Row>
          <div style={{ borderTop:'1px solid rgba(99,102,241,0.1)' }} className="pt-4">
            <p className="text-xs text-[#94a3b8] mb-3 font-medium uppercase tracking-wide">Applicable Items</p>
            <p className="text-sm text-[#e2e8f0]">All Items</p>
          </div>
          <div style={{ borderTop:'1px solid rgba(99,102,241,0.1)' }} className="pt-4">
            <p className="text-xs text-[#94a3b8] mb-3 font-medium uppercase tracking-wide">Usage Stats</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:'Total Uses', val: promo.uses },
                { label:'Discount Given', val: '$' + (parseInt(promo.uses.replace(/,/g,'')) * 4.2).toLocaleString('en-US',{maximumFractionDigits:0}) },
                { label:'Avg/TXN', val: '$12.40' },
              ].map(k => (
                <div key={k.label} className="rounded-lg p-3 text-center" style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)' }}>
                  <p className="text-lg font-bold text-[#e2e8f0]">{k.val}</p>
                  <p className="text-[10px] text-[#94a3b8] mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex gap-2" style={{ borderTop:'1px solid rgba(99,102,241,0.15)' }}>
          <button className="flex-1 h-8 rounded text-xs font-medium text-[#e2e8f0]" style={{ background:'rgba(99,102,241,0.3)', border:'1px solid rgba(99,102,241,0.4)' }}>Edit</button>
          <button className="flex-1 h-8 rounded text-xs font-medium text-[#94a3b8]" style={{ border:'1px solid rgba(99,102,241,0.2)' }}>Duplicate</button>
          <button className="flex-1 h-8 rounded text-xs font-medium text-red-400" style={{ border:'1px solid rgba(239,68,68,0.3)' }}>Deactivate</button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#94a3b8]">{label}</span>
      <span className="text-sm text-[#e2e8f0]">{children}</span>
    </div>
  )
}

/* ─── New Promotion Modal ────────────────────────────────── */
function NewPromoModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState('PERCENT_OFF')
  const [appliesTo, setAppliesTo] = useState('ALL')
  const [noEndDate, setNoEndDate] = useState(false)
  const [stackable, setStackable] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[560px] max-h-[90vh] overflow-y-auto rounded-xl" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.3)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
          <h2 className="text-base font-semibold text-[#e2e8f0]">New Promotion</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#e2e8f0] text-xl">×</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Field label="Promo Name"><input type="text" className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none focus:border-indigo-500/60" placeholder="e.g. Summer Sale 2026" /></Field>
          <Field label="Type">
            <select value={type} onChange={e => setType(e.target.value)} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none">
              <option value="PERCENT_OFF">Percent Off</option>
              <option value="FIXED_OFF">Fixed Amount Off</option>
              <option value="BOGO">BOGO</option>
              <option value="BUY_X_GET_Y">Buy X Get Y</option>
              <option value="QTY_THRESHOLD">Quantity Threshold</option>
            </select>
          </Field>
          {type === 'PERCENT_OFF' && <Field label="Discount %"><input type="number" min={1} max={100} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="15" /></Field>}
          {type === 'FIXED_OFF' && <Field label="Discount $"><input type="number" min={0} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="10.00" /></Field>}
          {(type === 'BOGO' || type === 'BUY_X_GET_Y') && (
            <>
              <Field label="Buy Item (SKU/Name)"><input type="text" className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="Search SKU or name..." /></Field>
              <Field label="Get Item (SKU/Name)"><input type="text" className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="Search SKU or name..." /></Field>
              <Field label="Discount on Get Item %"><input type="number" min={1} max={100} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="100" /></Field>
            </>
          )}
          {type === 'QTY_THRESHOLD' && (
            <>
              <Field label="Min Quantity"><input type="number" min={2} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="3" /></Field>
              <Field label="Discount %"><input type="number" min={1} max={100} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="10" /></Field>
            </>
          )}
          <Field label="Applies To">
            <select value={appliesTo} onChange={e => setAppliesTo(e.target.value)} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none">
              <option value="ALL">All Items</option>
              <option value="SPECIFIC">Specific Items</option>
              <option value="CATEGORY">Category</option>
            </select>
          </Field>
          {(appliesTo === 'SPECIFIC' || appliesTo === 'CATEGORY') && (
            <Field label={appliesTo === 'SPECIFIC' ? 'Items (multi-select)' : 'Categories (multi-select)'}>
              <input type="text" className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="Search and select..." />
            </Field>
          )}
          <Field label="Exclusions (optional)"><input type="text" className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="Search excluded SKUs..." /></Field>
          <Field label="Min Purchase ($)"><input type="number" min={0} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="0" /></Field>
          <Field label="Channels">
            <div className="flex gap-4">
              {['POS','Online','Both'].map(c => (
                <label key={c} className="flex items-center gap-1.5 text-sm text-[#94a3b8] cursor-pointer">
                  <input type="checkbox" className="accent-indigo-500" />{c}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Date Range">
            <div className="flex items-center gap-2">
              <input type="date" className="flex-1 h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" />
              {!noEndDate && <><span className="text-[#94a3b8] text-xs">to</span><input type="date" className="flex-1 h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" /></>}
              <label className="flex items-center gap-1.5 text-xs text-[#94a3b8] whitespace-nowrap cursor-pointer">
                <input type="checkbox" checked={noEndDate} onChange={e => setNoEndDate(e.target.checked)} className="accent-indigo-500" />No End
              </label>
            </div>
          </Field>
          <Field label="Stackable">
            <button onClick={() => setStackable(s => !s)} className={`relative w-10 h-5 rounded-full transition-colors ${stackable ? 'bg-indigo-600' : 'bg-slate-600'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${stackable ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </Field>
          <Field label="Priority (1–99)"><input type="number" min={1} max={99} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="10" /></Field>
          <Field label="Max Uses (optional)"><input type="number" min={0} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="Unlimited" /></Field>
        </div>
        <div className="px-6 pb-6 flex gap-2 justify-end">
          <button onClick={onClose} className="h-9 px-4 rounded-lg text-sm text-[#94a3b8]" style={{ border:'1px solid rgba(99,102,241,0.2)' }}>Cancel</button>
          <button className="h-9 px-5 rounded-lg text-sm font-medium text-white" style={{ background:'rgba(99,102,241,0.8)', border:'1px solid rgba(99,102,241,0.5)' }}>Create Promotion</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#94a3b8]">{label}</label>
      {children}
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function PromotionsEnginePage() {
  const [tab, setTab] = useState<Tab>('Active Promotions')
  const [selected, setSelected] = useState<Promo | null>(null)
  const [showNewPromo, setShowNewPromo] = useState(false)
  const [, setApiData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/promotions/engine').then(r => r.json()).then(setApiData).catch(() => {})
  }, [])

  const actions = (
    <div className="flex gap-2">
      <button onClick={() => setShowNewPromo(true)} className="h-8 px-4 rounded-lg text-xs font-medium text-white" style={{ background:'rgba(99,102,241,0.8)', border:'1px solid rgba(99,102,241,0.5)' }}>New Promotion</button>
      <button className="h-8 px-3 rounded-lg text-xs text-[#94a3b8]" style={{ border:'1px solid rgba(99,102,241,0.2)' }}>New Coupon</button>
      <button className="h-8 px-3 rounded-lg text-xs text-[#94a3b8]" style={{ border:'1px solid rgba(99,102,241,0.2)' }}>Import</button>
    </div>
  )

  return (
    <>
      <TopBar
        title="Promotions Engine"
        breadcrumb={[{ label:'Promotions', href:'/promotions' }, { label:'Promotions Engine', href:'/promotions/engine' }]}
        actions={actions}
      />
      <main className="flex-1 overflow-auto p-6" style={{ background:'#0d0e24', minHeight:'100dvh' }}>

        {/* Tab strip */}
        <div className="flex gap-1 mb-6" style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors -mb-px ${tab === t ? 'text-indigo-300 border-b-2 border-indigo-400' : 'text-[#94a3b8] hover:text-[#e2e8f0]'}`}
            >{t}</button>
          ))}
        </div>

        {/* ── Active Promotions ── */}
        {tab === 'Active Promotions' && (
          <div className="rounded-xl overflow-hidden" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
                    {['Promo Name','Type','Discount','Min Purchase','Channels','Start','End','Uses','Stackable','Priority','Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PROMOS.map((p, i) => (
                    <tr key={p.id} onClick={() => setSelected(p)} className="cursor-pointer transition-colors hover:bg-indigo-500/5" style={{ borderBottom: i < PROMOS.length - 1 ? '1px solid rgba(99,102,241,0.08)' : undefined }}>
                      <td className="px-4 py-3 font-medium text-[#e2e8f0] whitespace-nowrap">{p.name}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_CHIP[p.type]}`}>{p.type.replace('_',' ')}</span></td>
                      <td className="px-4 py-3 text-[#94a3b8] whitespace-nowrap">{p.discount}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{p.minPurchase}</td>
                      <td className="px-4 py-3 text-[#94a3b8] whitespace-nowrap">{p.channels}</td>
                      <td className="px-4 py-3 text-[#94a3b8] whitespace-nowrap">{p.start}</td>
                      <td className="px-4 py-3 text-[#94a3b8] whitespace-nowrap">{p.end}</td>
                      <td className="px-4 py-3 text-[#e2e8f0]">{p.uses}</td>
                      <td className="px-4 py-3">{p.stackable ? <span className="inline-flex items-center gap-1 text-emerald-400 text-xs"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Yes</span> : <span className="text-red-400 text-sm font-bold">×</span>}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">{p.priority}</span></td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Scheduled ── */}
        {tab === 'Scheduled' && (
          <div className="rounded-xl p-8 text-center" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
            <p className="text-[#94a3b8] text-sm">No promotions currently scheduled.</p>
          </div>
        )}

        {/* ── Expired ── */}
        {tab === 'Expired' && (
          <div className="rounded-xl p-8 text-center" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
            <p className="text-[#94a3b8] text-sm">0 expired promotions in current filter range.</p>
          </div>
        )}

        {/* ── Coupons ── */}
        {tab === 'Coupons' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="h-8 px-4 rounded-lg text-xs font-medium text-white" style={{ background:'rgba(99,102,241,0.8)', border:'1px solid rgba(99,102,241,0.5)' }}>Generate Batch Coupons</button>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
                    {['Coupon Code','Promo Linked','Type','Uses/Max','Expiry','Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COUPONS.map((c, i) => (
                    <tr key={c.id} className="transition-colors hover:bg-indigo-500/5" style={{ borderBottom: i < COUPONS.length - 1 ? '1px solid rgba(99,102,241,0.08)' : undefined }}>
                      <td className="px-4 py-3 font-mono font-bold text-indigo-300">{c.code}</td>
                      <td className="px-4 py-3 text-[#e2e8f0]">{c.promo}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{c.type}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{c.uses}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{c.expiry}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-zinc-500/20 text-zinc-500 border border-zinc-500/20'}`}>{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Performance ── */}
        {tab === 'Performance' && (
          <div className="space-y-6">
            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {KPIS.map(k => (
                <div key={k.label} className="rounded-xl p-4" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
                  <p className={`font-bold text-[#e2e8f0] ${k.small ? 'text-sm' : 'text-2xl'}`}>{k.value}</p>
                  <p className="text-xs text-[#94a3b8] mt-1">{k.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl p-5" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
                <p className="text-sm font-semibold text-[#e2e8f0] mb-4">Total Discount Given by Promo (Top 5)</p>
                <BarChart />
              </div>
              <div className="rounded-xl p-5" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
                <p className="text-sm font-semibold text-[#e2e8f0] mb-4">Daily Discount Total — Jan through Apr</p>
                <LineChart />
              </div>
            </div>
          </div>
        )}
      </main>

      {selected && <PromoDrawer promo={selected} onClose={() => setSelected(null)} />}
      {showNewPromo && <NewPromoModal onClose={() => setShowNewPromo(false)} />}
    </>
  )
}
