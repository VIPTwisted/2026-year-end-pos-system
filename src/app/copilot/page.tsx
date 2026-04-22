export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'

// ─── Static mock data ────────────────────────────────────────────────────────

const SESSIONS = [
  { id: 1, title: 'Q1 Financial Summary', preview: 'Show me a breakdown of Q1 revenue by region...', time: '2 min ago', active: true },
  { id: 2, title: 'Stockout Risk Analysis', preview: 'Which products are at risk of stockout in the...', time: '1 hr ago', active: false },
  { id: 3, title: 'Top Customers Report', preview: 'Show me top 5 customers by revenue for Q1...', time: '3 hr ago', active: false },
  { id: 4, title: 'Purchase Order Draft', preview: 'Generate a purchase order for all items below...', time: 'Yesterday', active: false },
  { id: 5, title: 'Payroll Discrepancy', preview: 'There is a $2,400 discrepancy in the March payroll...', time: 'Yesterday', active: false },
  { id: 6, title: 'Vendor Performance', preview: 'Compare our top 3 vendors by on-time delivery...', time: 'Apr 20', active: false },
  { id: 7, title: 'Return Rate by SKU', preview: 'What SKUs have the highest return rate in Q1?', time: 'Apr 19', active: false },
  { id: 8, title: 'Budget vs Actual Q1', preview: 'Generate a variance analysis for Q1 marketing...', time: 'Apr 18', active: false },
]

const SUGGESTED_PROMPTS = [
  { category: 'Finance', prompts: [
    'Summarize Q1 financials and highlight variances',
    'What is our current cash runway?',
  ]},
  { category: 'Inventory', prompts: [
    'Which products are at risk of stockout?',
    'Show me slow-moving inventory over 90 days',
  ]},
  { category: 'Sales', prompts: [
    'Show me top 5 customers by revenue',
    'What is the conversion rate this month?',
  ]},
  { category: 'HR', prompts: [
    'Summarize open headcount and time-to-fill',
    'Which departments are over budget on payroll?',
  ]},
]

interface Message {
  role: 'user' | 'ai'
  content: string
  table?: { headers: string[]; rows: string[][] }
  chips?: string[]
}

const MESSAGES: Message[] = [
  {
    role: 'user',
    content: 'Summarize Q1 2026 financials and highlight key variances.',
  },
  {
    role: 'ai',
    content: 'Here\'s the Q1 2026 financial summary. Overall revenue came in at $7.98M, +6.2% vs budget. The main story is strong performance in the Online channel offset by softer-than-expected Wholesale volume.',
    table: {
      headers: ['Metric', 'Actual', 'Budget', 'Variance', 'Δ%'],
      rows: [
        ['Revenue', '$7.98M', '$7.51M', '+$470K', '+6.2%'],
        ['Gross Profit', '$3.91M', '$3.72M', '+$190K', '+5.1%'],
        ['GP Margin', '49.0%', '49.5%', '-0.5pp', '–'],
        ['OpEx', '$2.14M', '$2.20M', '-$60K', '-2.7%'],
        ['EBITDA', '$1.77M', '$1.52M', '+$250K', '+16.4%'],
      ],
    },
    chips: ['Drill into Revenue', 'Show by Region', 'Export to Excel'],
  },
  {
    role: 'user',
    content: 'Which products are at risk of stockout in the next 14 days?',
  },
  {
    role: 'ai',
    content: 'Based on current inventory levels and 30-day rolling velocity, 4 SKUs are at critical stockout risk within 14 days. I\'ve ranked them by urgency. Recommend triggering purchase orders immediately for items 1–2.',
    table: {
      headers: ['SKU', 'Product', 'On Hand', 'Daily Velocity', 'Days Left', 'Risk'],
      rows: [
        ['INV-0047', 'Inventory Scanner X7', '18 units', '3.2 / day', '5 days', 'CRITICAL'],
        ['INV-0112', 'Barcode Scanner BT400', '34 units', '4.1 / day', '8 days', 'HIGH'],
        ['INV-0088', 'Receipt Printer LP80', '62 units', '5.8 / day', '10 days', 'HIGH'],
        ['INV-0204', 'Cash Drawer CD200', '89 units', '6.3 / day', '14 days', 'MEDIUM'],
      ],
    },
    chips: ['Create Purchase Orders', 'Adjust Reorder Points', 'Email Warehouse'],
  },
  {
    role: 'user',
    content: 'Show me the top 5 customers by revenue for Q1 2026.',
  },
  {
    role: 'ai',
    content: 'Here are the top 5 customers by Q1 2026 revenue. Together they represent $2.13M (26.7% of total). Three of the five are Enterprise tier with multi-year contracts.',
    table: {
      headers: ['Rank', 'Customer', 'Tier', 'Q1 Revenue', 'YoY Δ', 'LTV'],
      rows: [
        ['1', 'Meridian Retail Group', 'Enterprise', '$487,200', '+12%', '$2.1M'],
        ['2', 'Apex Distribution LLC', 'Enterprise', '$431,800', '+8%', '$1.8M'],
        ['3', 'NorthBridge Wholesale', 'Mid-Market', '$398,400', '+21%', '$920K'],
        ['4', 'Summit Stores Corp.', 'Enterprise', '$412,100', '-3%', '$1.6M'],
        ['5', 'Pacific Coast Retail', 'Mid-Market', '$401,500', '+15%', '$1.1M'],
      ],
    },
    chips: ['View Customer Profiles', 'Schedule QBRs', 'Flag for Upsell'],
  },
  {
    role: 'user',
    content: 'Generate a draft purchase order for all critical and high stockout-risk items.',
  },
  {
    role: 'ai',
    content: 'I\'ve drafted PO #PO-2026-0841 for the 3 at-risk SKUs. Preferred vendors are pre-filled based on historical purchase history and pricing contracts. Review and approve to submit.',
    table: {
      headers: ['SKU', 'Product', 'Vendor', 'Qty', 'Unit Cost', 'Total'],
      rows: [
        ['INV-0047', 'Inventory Scanner X7', 'TechSupply Co.', '50 units', '$184.00', '$9,200'],
        ['INV-0112', 'Barcode Scanner BT400', 'ScanSource Inc.', '80 units', '$67.50', '$5,400'],
        ['INV-0088', 'Receipt Printer LP80', 'PrintVendor LLC', '60 units', '$112.00', '$6,720'],
      ],
    },
    chips: ['Approve & Submit PO', 'Edit Line Items', 'Route for Approval'],
  },
  {
    role: 'user',
    content: 'What is our current cash position and 30-day cash burn rate?',
  },
  {
    role: 'ai',
    content: 'Current cash position is $4.82M across all accounts. The 30-day rolling burn rate is $1.24M/month, giving approximately 3.9 months of runway at the current pace. However, Q2 has $1.1M in scheduled AR collections which extends effective runway to 4.8 months.',
    chips: ['View Cash Flow Forecast', 'Show AR Aging', 'Export Treasury Report'],
  },
]

// ─── Page component ───────────────────────────────────────────────────────────

const QUICK_CHIPS = ['Finance Summary', 'Inventory Alert', 'Sales Report', 'Create PO', 'HR Snapshot', 'Vendor Analysis']

export default function CopilotPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0f0f1a', color: '#e4e4e7' }}>
      <TopBar
        title="NovaPOS Copilot"
        actions={
          <>
            <button style={{ padding: '5px 12px', fontSize: 12, background: '#6366f1', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>New Chat</button>
            <button style={{ padding: '5px 12px', fontSize: 12, background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#a5b4fc', cursor: 'pointer' }}>History</button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', flex: 1, minHeight: 0, height: 'calc(100dvh - 48px)' }}>

        {/* Left sidebar */}
        <div style={{ borderRight: '1px solid rgba(63,63,70,0.5)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

          {/* Sessions */}
          <div style={{ padding: '14px 14px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Recent Sessions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SESSIONS.map(s => (
                <div key={s.id} style={{
                  padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                  background: s.active ? 'rgba(99,102,241,0.15)' : 'rgba(22,33,62,0.5)',
                  border: s.active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <div style={{ fontSize: 12, fontWeight: s.active ? 600 : 400, color: s.active ? '#c7d2fe' : '#a1a1aa', flex: 1, marginRight: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                    {s.active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 10, color: '#52525b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.preview}</div>
                  <div style={{ fontSize: 10, color: '#3f3f46', marginTop: 3 }}>{s.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(63,63,70,0.4)', margin: '14px 0' }} />

          {/* Suggested Prompts */}
          <div style={{ padding: '0 14px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Suggested Prompts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SUGGESTED_PROMPTS.map(cat => (
                <div key={cat.category}>
                  <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 600, marginBottom: 5 }}>{cat.category}</div>
                  {cat.prompts.map(p => (
                    <div key={p} style={{
                      fontSize: 11, color: '#71717a', padding: '6px 10px', borderRadius: 6,
                      background: 'rgba(15,15,26,0.6)', marginBottom: 4, cursor: 'pointer',
                      border: '1px solid rgba(63,63,70,0.3)',
                      lineHeight: 1.4,
                    }}>
                      {p}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chat view */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>

          {/* Header */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(63,63,70,0.5)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 2c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm0 3c.552 0 1 .448 1 1v4c0 .552-.448 1-1 1s-1-.448-1-1V7c0-.552.448-1 1-1z" fill="white"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>Q1 Financial Summary</div>
              <div style={{ fontSize: 10, color: '#10b981' }}>● Active session · 6 messages</div>
            </div>
          </div>

          {/* Messages scroll area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {MESSAGES.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'user' ? (
                  <div style={{ maxWidth: '70%', background: '#4338ca', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', fontSize: 13, color: '#e0e7ff', lineHeight: 1.5 }}>
                    {msg.content}
                  </div>
                ) : (
                  <div style={{ maxWidth: '90%', display: 'flex', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 1C3.46 1 1 3.46 1 6.5S3.46 12 6.5 12 12 9.54 12 6.5 9.54 1 6.5 1zm0 2a.75.75 0 110 1.5.75.75 0 010-1.5zm0 2.5c.414 0 .75.336.75.75v3a.75.75 0 01-1.5 0v-3c0-.414.336-.75.75-.75z" fill="white"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '2px 12px 12px 12px', padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, color: '#d4d4d8', lineHeight: 1.6, marginBottom: msg.table ? 12 : 0 }}>{msg.content}</div>
                        {msg.table && (
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', marginTop: 4 }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid rgba(63,63,70,0.6)' }}>
                                  {msg.table.headers.map(h => (
                                    <th key={h} style={{ padding: '5px 10px', color: '#71717a', fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {msg.table.rows.map((row, ri) => (
                                  <tr key={ri} style={{ borderBottom: '1px solid rgba(39,39,42,0.4)' }}>
                                    {row.map((cell, ci) => {
                                      const isCritical = cell === 'CRITICAL'
                                      const isHigh = cell === 'HIGH'
                                      const isMedium = cell === 'MEDIUM'
                                      const isPositive = cell.startsWith('+') && cell.includes('%')
                                      const isNegative = cell.startsWith('-') && cell.includes('%')
                                      return (
                                        <td key={ci} style={{
                                          padding: '6px 10px',
                                          color: isCritical ? '#ef4444' : isHigh ? '#f59e0b' : isMedium ? '#eab308' : isPositive ? '#10b981' : isNegative ? '#ef4444' : '#d4d4d8',
                                          fontWeight: isCritical || isHigh ? 600 : 400,
                                          whiteSpace: 'nowrap',
                                        }}>
                                          {isCritical || isHigh || isMedium ? (
                                            <span style={{
                                              padding: '2px 7px', borderRadius: 4,
                                              background: isCritical ? 'rgba(239,68,68,0.15)' : isHigh ? 'rgba(245,158,11,0.15)' : 'rgba(234,179,8,0.15)',
                                              fontSize: 10,
                                            }}>
                                              {cell}
                                            </span>
                                          ) : cell}
                                        </td>
                                      )
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                      {msg.chips && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                          {msg.chips.map(c => (
                            <button key={c} style={{
                              fontSize: 11, color: '#818cf8', background: 'rgba(99,102,241,0.1)',
                              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6,
                              padding: '3px 10px', cursor: 'pointer',
                            }}>
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input area */}
          <div style={{ padding: '12px 20px 20px', borderTop: '1px solid rgba(63,63,70,0.5)' }}>
            {/* Quick action chips */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {QUICK_CHIPS.map(c => (
                <button key={c} style={{
                  fontSize: 11, color: '#71717a', background: 'rgba(22,33,62,0.8)',
                  border: '1px solid rgba(63,63,70,0.5)', borderRadius: 6,
                  padding: '4px 12px', cursor: 'pointer',
                }}>
                  {c}
                </button>
              ))}
            </div>
            {/* Input bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#16213e', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <div style={{ flex: 1, fontSize: 13, color: '#52525b' }}>Ask NovaPOS Copilot anything about your business...</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Attachment icon */}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 7.5L7 14A4.5 4.5 0 012 8.5l6.5-6.5A3 3 0 0112.5 6l-6.5 6.5a1.5 1.5 0 01-2.1-2.1L10 4" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {/* Send button */}
                <button style={{ background: '#6366f1', border: 'none', borderRadius: 7, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 6-12 6V8.5l8-1.5-8-1.5V1z" fill="white"/>
                  </svg>
                </button>
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#3f3f46', marginTop: 6, textAlign: 'center' }}>
              NovaPOS Copilot can make mistakes. Verify important figures before acting.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
