'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

/* ─── types ─────────────────────────────────────────────────────── */
interface Coupon {
  code: string; promotion: string; type: string
  discount: string; minPurchase: string; uses: string
  expiry: string; channels: string; status: 'Active' | 'Paused'
}

interface Batch {
  batchNum: string; prefix: string; count: number
  usedTotal: string; created: string; expires: string
  status: string
}

/* ─── seed data ──────────────────────────────────────────────────── */
const ACTIVE_COUPONS: Coupon[] = [
  { code:'SAVE15',      promotion:'Welcome Discount',      type:'Universal',          discount:'15%',    minPurchase:'$0',  uses:'412/unlimited', expiry:'Dec 31, 2026', channels:'All',          status:'Active' },
  { code:'SUMMER20',    promotion:'Summer Sale',            type:'Universal',          discount:'20%',    minPurchase:'$50', uses:'89/500',        expiry:'Jun 30, 2026', channels:'Website+POS',  status:'Active' },
  { code:'VIP2026',     promotion:'VIP Exclusive',          type:'Customer-specific',  discount:'25%',    minPurchase:'$0',  uses:'34/100',        expiry:'Apr 30, 2026', channels:'All',          status:'Active' },
  { code:'FIRSTBUY',    promotion:'First Purchase',         type:'Single-use batch',   discount:'$10 off',minPurchase:'$25', uses:'248/1000',      expiry:'Dec 31, 2026', channels:'Website',      status:'Active' },
  { code:'LOYAL10',     promotion:'Loyalty Reward',         type:'Customer-specific',  discount:'10%',    minPurchase:'$0',  uses:'167/500',       expiry:'Jun 30, 2026', channels:'All',          status:'Active' },
  { code:'FLASH30',     promotion:'Flash Sale',             type:'Universal',          discount:'30%',    minPurchase:'$75', uses:'211/300',       expiry:'Apr 25, 2026', channels:'Website+Mobile',status:'Active' },
  { code:'FREESHIP',    promotion:'Free Shipping',          type:'Universal',          discount:'Free ship',minPurchase:'$35',uses:'892/unlimited', expiry:'Dec 31, 2026', channels:'Website',      status:'Active' },
  { code:'BUNDLE25',    promotion:'Bundle Deal',            type:'Universal',          discount:'25%',    minPurchase:'$100',uses:'54/200',        expiry:'May 31, 2026', channels:'POS',          status:'Active' },
  { code:'REFER20',     promotion:'Referral Program',       type:'Single-use batch',   discount:'20%',    minPurchase:'$0',  uses:'73/1000',       expiry:'Dec 31, 2026', channels:'All',          status:'Active' },
  { code:'BIRTHDAY',    promotion:'Birthday Month',         type:'Customer-specific',  discount:'$15 off',minPurchase:'$0',  uses:'28/unlimited',  expiry:'Dec 31, 2026', channels:'All',          status:'Active' },
  { code:'STAFF25',     promotion:'Employee Discount',      type:'Customer-specific',  discount:'25%',    minPurchase:'$0',  uses:'142/unlimited', expiry:'Dec 31, 2026', channels:'POS',          status:'Active' },
  { code:'CLEARANCE40', promotion:'Clearance Event',        type:'Universal',          discount:'40%',    minPurchase:'$0',  uses:'0/unlimited',   expiry:'Apr 30, 2026', channels:'Website+POS',  status:'Paused' },
]

const BATCHES: Batch[] = [
  { batchNum:'BATCH-001', prefix:'FIRST-', count:1000, usedTotal:'248/1000', created:'Jan 1, 2026',  expires:'Dec 31, 2026', status:'Active' },
  { batchNum:'BATCH-002', prefix:'REFER-', count:1000, usedTotal:'73/1000',  created:'Feb 15, 2026', expires:'Dec 31, 2026', status:'Active' },
  { batchNum:'BATCH-003', prefix:'VIP26-', count:100,  usedTotal:'34/100',   created:'Mar 1, 2026',  expires:'Apr 30, 2026', status:'Active' },
  { batchNum:'BATCH-004', prefix:'BDAY-',  count:500,  usedTotal:'28/500',   created:'Jan 1, 2026',  expires:'Dec 31, 2026', status:'Active' },
  { batchNum:'BATCH-005', prefix:'SUM20-', count:500,  usedTotal:'89/500',   created:'Apr 1, 2026',  expires:'Jun 30, 2026', status:'Active' },
]

const TABS = ['Active','Scheduled','Expired','Batches'] as const
type Tab = typeof TABS[number]

/* ─── helpers ────────────────────────────────────────────────────── */
function KpiTile({ label, value, sub, color = '#e2e8f0' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '16px 20px' }}>
      <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function StatusPill({ status }: { status: 'Active' | 'Paused' | string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Active': { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
    'Paused': { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
  }
  const c = map[status] ?? { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' }
  return <span style={{ background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{status}</span>
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Universal':         { bg: 'rgba(99,102,241,0.15)',  color: '#a5b4fc' },
    'Single-use batch':  { bg: 'rgba(20,184,166,0.15)',  color: '#2dd4bf' },
    'Customer-specific': { bg: 'rgba(168,85,247,0.15)',  color: '#d8b4fe' },
  }
  const c = map[type] ?? { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' }
  return <span style={{ background: c.bg, color: c.color, padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{type}</span>
}

/* ─── modal ──────────────────────────────────────────────────────── */
function GenerateModal({ onClose }: { onClose: () => void }) {
  const [couponType, setCouponType] = useState<'Universal'|'Single-Use Batch'>('Universal')

  const inputStyle: React.CSSProperties = {
    height: 34, padding: '0 10px', borderRadius: 6,
    border: '1px solid rgba(99,102,241,0.2)', background: '#0d0e24',
    color: '#e2e8f0', fontSize: 13, outline: 'none', width: '100%',
  }
  const labelStyle: React.CSSProperties = { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, display: 'block' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#0f1230', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, width: 560, maxHeight: '90vh', overflowY: 'auto', padding: '24px 28px', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Generate Coupons</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Promotion</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}>
              <option>Welcome Discount</option>
              <option>Summer Sale</option>
              <option>VIP Exclusive</option>
              <option>Loyalty Reward</option>
              <option>Flash Sale</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Coupon Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['Universal','Single-Use Batch'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setCouponType(t)}
                  style={{ flex: 1, padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    background: couponType === t ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.07)',
                    color: couponType === t ? '#a5b4fc' : '#64748b',
                    border: couponType === t ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(99,102,241,0.15)',
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          {couponType === 'Universal' ? (
            <div>
              <label style={labelStyle}>Coupon Code</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="Enter code (e.g. SUMMER20)" />
                <button style={{ padding: '0 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', whiteSpace: 'nowrap' }}>Generate Random</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Quantity</label><input style={inputStyle} type="number" defaultValue={100} /></div>
              <div><label style={labelStyle}>Prefix</label><input style={inputStyle} defaultValue="VIP-" /></div>
              <div><label style={labelStyle}>Code Length</label><input style={inputStyle} type="number" defaultValue={8} /></div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>Discount</label><input style={inputStyle} placeholder="e.g. 20% or $10" /></div>
            <div><label style={labelStyle}>Minimum Purchase</label><input style={inputStyle} type="number" placeholder="0" defaultValue={0} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>Valid From</label><input style={{ ...inputStyle, cursor: 'pointer' }} type="date" /></div>
            <div><label style={labelStyle}>Valid To</label><input style={{ ...inputStyle, cursor: 'pointer' }} type="date" /></div>
          </div>

          <div>
            <label style={labelStyle}>Channels</label>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
              {['POS','Website','Mobile','All'].map(ch => (
                <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={ch === 'All'} style={{ accentColor: '#6366f1', cursor: 'pointer' }} />
                  {ch}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Max Uses</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input style={{ ...inputStyle, flex: 1 }} type="number" placeholder="Leave blank for unlimited" />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" style={{ accentColor: '#6366f1' }} /> Unlimited
                </label>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Customer Restriction</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }}>
                <option>All Customers</option>
                <option>Specific Customer List</option>
                <option>Loyalty Tier: Bronze</option>
                <option>Loyalty Tier: Silver</option>
                <option>Loyalty Tier: Gold</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(99,102,241,0.12)' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: 'rgba(99,102,241,0.1)', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}>Cancel</button>
          <button style={{ padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', cursor: 'pointer' }}>Generate Coupons</button>
        </div>
      </div>
    </div>
  )
}

/* ─── page ───────────────────────────────────────────────────────── */
export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Active')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/promotions/coupons').then(r => r.json()).catch(() => {})
  }, [])

  const TH = ({ ch, right }: { ch: string; right?: boolean }) => (
    <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: right ? 'right' : 'left', whiteSpace: 'nowrap' }}>{ch}</th>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Coupons"
        breadcrumb={[
          { label: 'Promotions', href: '/promotions' },
          { label: 'Coupons', href: '/promotions/coupons' },
        ]}
        actions={
          <>
            <button onClick={() => setShowModal(true)} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', cursor: 'pointer' }}>Generate Coupons</button>
            {['Import','Export'].map(a => (
              <button key={a} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}>{a}</button>
            ))}
          </>
        }
      />

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <KpiTile label="Active Coupons"       value="8"       color="#a5b4fc" sub="Currently live" />
          <KpiTile label="Total Uses Today"     value="47"      color="#4ade80" sub="Across all coupons" />
          <KpiTile label="Redemption Rate"      value="23.4%"   color="#fbbf24" sub="30-day average" />
          <KpiTile label="Revenue Influenced"   value="$2,841"  color="#2dd4bf" sub="Today's assisted revenue" />
        </div>

        {/* Tab strip */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: activeTab === t ? 600 : 400,
                color: activeTab === t ? '#a5b4fc' : '#64748b',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === t ? '2px solid #6366f1' : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.15s',
              }}
            >{t}</button>
          ))}
        </div>

        {/* Active tab */}
        {activeTab === 'Active' && (
          <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
                <tr>
                  <TH ch="Code" />
                  <TH ch="Promotion" />
                  <TH ch="Type" />
                  <TH ch="Discount" />
                  <TH ch="Min Purchase" />
                  <TH ch="Uses / Max" />
                  <TH ch="Expiry" />
                  <TH ch="Channels" />
                  <TH ch="Status" />
                  <TH ch="" />
                </tr>
              </thead>
              <tbody>
                {ACTIVE_COUPONS.map((c, i) => (
                  <tr key={c.code} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#a5b4fc', fontSize: 13 }}>{c.code}</td>
                    <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{c.promotion}</td>
                    <td style={{ padding: '10px 14px' }}><TypeBadge type={c.type} /></td>
                    <td style={{ padding: '10px 14px', color: '#4ade80', fontWeight: 600 }}>{c.discount}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{c.minPurchase}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{c.uses}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{c.expiry}</td>
                    <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 12 }}>{c.channels}</td>
                    <td style={{ padding: '10px 14px' }}><StatusPill status={c.status} /></td>
                    <td style={{ padding: '10px 14px' }}>
                      <button style={{ fontSize: 11, fontWeight: 600, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Scheduled tab */}
        {activeTab === 'Scheduled' && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#475569', fontSize: 13, border: '1px solid rgba(99,102,241,0.12)', borderRadius: 8 }}>
            No scheduled coupons. Use Generate Coupons to schedule future promotions.
          </div>
        )}

        {/* Expired tab */}
        {activeTab === 'Expired' && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#475569', fontSize: 13, border: '1px solid rgba(99,102,241,0.12)', borderRadius: 8 }}>
            No expired coupons found in the selected date range.
          </div>
        )}

        {/* Batches tab */}
        {activeTab === 'Batches' && (
          <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
                <tr>
                  {['Batch #','Code Prefix','Count','Used / Total','Created','Expires','Status',''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BATCHES.map((b, i) => (
                  <tr key={b.batchNum} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', color: '#a5b4fc', fontWeight: 600 }}>{b.batchNum}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#e2e8f0' }}>{b.prefix}</td>
                    <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{b.count.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{b.usedTotal}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{b.created}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{b.expires}</td>
                    <td style={{ padding: '10px 14px' }}><StatusPill status={b.status} /></td>
                    <td style={{ padding: '10px 14px' }}>
                      <button style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <GenerateModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
