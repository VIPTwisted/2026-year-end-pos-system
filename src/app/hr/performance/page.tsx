'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

type ReviewStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue'
type MainTab = 'My Reviews' | 'Direct Reports' | 'All Reviews' | 'Goals' | 'Templates'
type GoalStatus = 'Not Started' | 'In Progress' | 'Completed' | 'At Risk'

interface Review {
  id: number; employee: string; period: string; type: string
  manager: string; dueDate: string; status: ReviewStatus; rating: string | null
}
interface Goal {
  id: number; employee: string; goal: string; targetDate: string
  category: string; weight: string; status: GoalStatus; progress: number
}

const REVIEWS: Review[] = [
  { id: 1,  employee: 'Alice Chen',       period: 'Q1 2026',     type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 30', status: 'In Progress',  rating: null    },
  { id: 2,  employee: 'Bob Wilson',       period: 'Q1 2026',     type: 'Quarterly', manager: 'David Kim',    dueDate: 'Apr 30', status: 'In Progress',  rating: null    },
  { id: 3,  employee: 'Carlos Mendez',    period: 'Q1 2026',     type: 'Quarterly', manager: 'David Kim',    dueDate: 'Apr 25', status: 'Overdue',      rating: null    },
  { id: 4,  employee: 'Sarah Kim',        period: 'Annual 2025', type: 'Annual',    manager: 'David Kim',    dueDate: 'Mar 31', status: 'Completed',    rating: '4.2/5' },
  { id: 5,  employee: 'Tom Jackson',      period: 'Annual 2025', type: 'Annual',    manager: 'Alice Chen',   dueDate: 'Mar 31', status: 'Completed',    rating: '3.8/5' },
  { id: 6,  employee: 'Emily Rodriguez',  period: 'Q1 2026',     type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 30', status: 'In Progress',  rating: null    },
  { id: 7,  employee: 'James Liu',        period: 'Q1 2026',     type: 'Quarterly', manager: 'Alice Chen',   dueDate: 'Apr 30', status: 'Not Started',  rating: null    },
  { id: 8,  employee: 'Priya Patel',      period: 'Annual 2025', type: 'Annual',    manager: 'David Kim',    dueDate: 'Mar 31', status: 'Completed',    rating: '4.5/5' },
  { id: 9,  employee: 'Marcus Green',     period: 'Q1 2026',     type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 30', status: 'Not Started',  rating: null    },
  { id: 10, employee: 'Jennifer Walsh',   period: 'Q1 2026',     type: 'Quarterly', manager: 'David Kim',    dueDate: 'Apr 28', status: 'Overdue',      rating: null    },
  { id: 11, employee: 'Derek Nguyen',     period: 'Annual 2025', type: 'Annual',    manager: 'Alice Chen',   dueDate: 'Mar 31', status: 'Completed',    rating: '3.5/5' },
  { id: 12, employee: 'Sophia Martinez',  period: 'Q1 2026',     type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 30', status: 'In Progress',  rating: null    },
  { id: 13, employee: 'Kevin Park',       period: 'Q1 2026',     type: 'Quarterly', manager: 'David Kim',    dueDate: 'Apr 30', status: 'Not Started',  rating: null    },
  { id: 14, employee: 'Natalie Brown',    period: 'Annual 2025', type: 'Annual',    manager: 'Alice Chen',   dueDate: 'Mar 31', status: 'Completed',    rating: '4.0/5' },
  { id: 15, employee: 'Omar Hassan',      period: 'Q1 2026',     type: 'Quarterly', manager: 'David Kim',    dueDate: 'Apr 30', status: 'In Progress',  rating: null    },
  { id: 16, employee: 'Rachel Torres',    period: 'Q1 2026',     type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 27', status: 'Overdue',      rating: null    },
  { id: 17, employee: 'Steven Clark',     period: 'Annual 2025', type: 'Annual',    manager: 'David Kim',    dueDate: 'Mar 31', status: 'Completed',    rating: '4.7/5' },
  { id: 18, employee: 'Tina Yamamoto',    period: 'Q1 2026',     type: 'Quarterly', manager: 'Alice Chen',   dueDate: 'Apr 30', status: 'Not Started',  rating: null    },
  { id: 19, employee: 'Umar Johnson',     period: 'Q1 2026',     type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 30', status: 'In Progress',  rating: null    },
  { id: 20, employee: 'Vivian Lee',       period: 'Annual 2025', type: 'Annual',    manager: 'David Kim',    dueDate: 'Mar 31', status: 'Completed',    rating: '3.9/5' },
]

const GOALS: Goal[] = [
  { id: 1,  employee: 'Alice Chen',    goal: 'Increase sales pipeline by 20%',       targetDate: 'Jun 30', category: 'Sales',       weight: '30%', status: 'In Progress', progress: 65  },
  { id: 2,  employee: 'Alice Chen',    goal: 'Complete leadership training program',  targetDate: 'May 31', category: 'Development', weight: '20%', status: 'In Progress', progress: 40  },
  { id: 3,  employee: 'Alice Chen',    goal: 'Reduce customer response time to 2h',  targetDate: 'Mar 31', category: 'Service',     weight: '25%', status: 'Completed',   progress: 100 },
  { id: 4,  employee: 'Bob Wilson',    goal: 'Launch 3 new product integrations',     targetDate: 'Jul 31', category: 'Product',     weight: '35%', status: 'In Progress', progress: 33  },
  { id: 5,  employee: 'Bob Wilson',    goal: 'Achieve 98% sprint velocity',           targetDate: 'Jun 30', category: 'Performance', weight: '30%', status: 'At Risk',     progress: 72  },
  { id: 6,  employee: 'Carlos Mendez', goal: 'Onboard 5 enterprise clients',          targetDate: 'Apr 30', category: 'Sales',       weight: '40%', status: 'Overdue' as GoalStatus, progress: 20 },
  { id: 7,  employee: 'Carlos Mendez', goal: 'Certify in Salesforce Admin',           targetDate: 'May 15', category: 'Development', weight: '20%', status: 'Not Started', progress: 0   },
  { id: 8,  employee: 'Sarah Kim',     goal: 'Reduce COGS by 5%',                    targetDate: 'Dec 31', category: 'Finance',     weight: '35%', status: 'In Progress', progress: 55  },
  { id: 9,  employee: 'Sarah Kim',     goal: 'Implement ERP module rollout',          targetDate: 'Aug 31', category: 'Operations',  weight: '30%', status: 'In Progress', progress: 48  },
  { id: 10, employee: 'Tom Jackson',   goal: 'Hire 3 senior engineers',               targetDate: 'Jun 30', category: 'Hiring',      weight: '40%', status: 'In Progress', progress: 33  },
]

const statusStyle: Record<ReviewStatus, string> = {
  'Not Started': 'bg-zinc-700 text-zinc-300',
  'In Progress': 'bg-amber-500/20 text-amber-400',
  Completed:     'bg-emerald-500/20 text-emerald-400',
  Overdue:       'bg-red-500/20 text-red-400',
}
const goalStatusStyle: Record<GoalStatus, string> = {
  'Not Started': 'bg-zinc-700 text-zinc-300',
  'In Progress': 'bg-amber-500/20 text-amber-400',
  Completed:     'bg-emerald-500/20 text-emerald-400',
  'At Risk':     'bg-red-500/20 text-red-400',
}
const GOALS_REVIEW = [
  { name: 'Increase Q1 pipeline' },
  { name: 'Complete safety certification' },
  { name: 'Improve NPS score' },
  { name: 'Reduce ticket backlog' },
  { name: 'Submit quarterly reports' },
]
const COMPETENCIES = ['Communication', 'Leadership', 'Teamwork', 'Initiative', 'Technical']

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState<MainTab>('All Reviews')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [goalRatings, setGoalRatings] = useState<number[]>(GOALS_REVIEW.map(() => 3))
  const [compRatings, setCompRatings] = useState<number[]>(COMPETENCIES.map(() => 3))
  const [managerComment, setManagerComment] = useState('')
  const [overrideRating, setOverrideRating] = useState('')
  const [showGoalModal, setShowGoalModal] = useState(false)

  useEffect(() => { fetch('/api/hr/performance').catch(() => {}) }, [])

  const openDrawer = (r: Review) => { setSelectedReview(r); setDrawerOpen(true) }
  const calcAvg = () => {
    const all = [...goalRatings, ...compRatings]
    return (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1)
  }
  const tabs: MainTab[] = ['My Reviews', 'Direct Reports', 'All Reviews', 'Goals', 'Templates']

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Performance Management"
        breadcrumb={[{ label: 'Human Resources', href: '/hr' }, { label: 'Performance', href: '/hr/performance' }]}
        actions={
          <div className="flex items-center gap-2">
            <button style={{ background: 'rgba(99,102,241,0.85)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>New Review</button>
            <button style={{ background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Send Forms</button>
            <button style={{ background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Complete Reviews</button>
          </div>
        }
      />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Reviews Due', value: '24', color: '#e2e8f0' },
            { label: 'Completed',   value: '18', color: '#34d399' },
            { label: 'Overdue',     value: '6',  color: '#f87171' },
            { label: 'Avg Rating',  value: '3.8/5', color: '#e2e8f0' },
          ].map(k => (
            <div key={k.label} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '8px 18px', fontSize: 13, fontWeight: activeTab === t ? 600 : 400, color: activeTab === t ? '#818cf8' : '#94a3b8', background: 'transparent', border: 'none', borderBottom: activeTab === t ? '2px solid #818cf8' : '2px solid transparent', cursor: 'pointer', marginBottom: -1 }}>{t}</button>
          ))}
        </div>
        {activeTab === 'All Reviews' && (
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                {['Employee', 'Review Period', 'Type', 'Manager', 'Due Date', 'Status', 'Rating'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {REVIEWS.map((r, i) => (
                  <tr key={r.id} onClick={() => openDrawer(r)} style={{ borderBottom: i < REVIEWS.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none', cursor: 'pointer' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.06)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                    <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>{r.employee}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{r.period}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{r.type}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{r.manager}</td>
                    <td style={{ padding: '12px 16px', color: r.status === 'Overdue' ? '#f87171' : '#94a3b8' }}>{r.dueDate}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }} className={statusStyle[r.status]}>{r.status}</span></td>
                    <td style={{ padding: '12px 16px', color: r.rating ? '#34d399' : '#94a3b8', fontWeight: r.rating ? 600 : 400 }}>{r.rating ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'Goals' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button onClick={() => setShowGoalModal(true)} style={{ background: 'rgba(99,102,241,0.85)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>+ Add Goal</button>
            </div>
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                  {['Employee', 'Goal', 'Target Date', 'Category', 'Weight', 'Status', 'Progress'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {GOALS.map((g, i) => (
                    <tr key={g.id} style={{ borderBottom: i < GOALS.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' }}>
                      <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>{g.employee}</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8', maxWidth: 260 }}>{g.goal}</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{g.targetDate}</td>
                      <td style={{ padding: '12px 16px' }}><span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{g.category}</span></td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{g.weight}</td>
                      <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }} className={goalStatusStyle[g.status as GoalStatus]}>{g.status}</span></td>
                      <td style={{ padding: '12px 16px', minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'rgba(99,102,241,0.15)', borderRadius: 3 }}>
                            <div style={{ width: String(g.progress) + '%', height: '100%', background: g.progress === 100 ? '#34d399' : g.progress < 30 ? '#f87171' : '#818cf8', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#94a3b8', width: 30 }}>{g.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {(activeTab === 'My Reviews' || activeTab === 'Direct Reports' || activeTab === 'Templates') && (
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '48px 0', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>{activeTab} — select All Reviews or use filters above</div>
        )}
      </div>
      {drawerOpen && selectedReview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setDrawerOpen(false)} />
          <div style={{ width: 520, background: '#16213e', borderLeft: '1px solid rgba(99,102,241,0.2)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{selectedReview.employee}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{selectedReview.type} · {selectedReview.period} · Manager: {selectedReview.manager}</div>
                <div style={{ marginTop: 8 }}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }} className={statusStyle[selectedReview.status]}>{selectedReview.status}</span></div>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <details open style={{ background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)' }}>
                <summary style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#818cf8', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}><span>Goals &amp; Achievements</span><span>▼</span></summary>
                <div style={{ padding: '0 16px 16px' }}>
                  {GOALS_REVIEW.map((g, idx) => (
                    <div key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: idx < GOALS_REVIEW.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#e2e8f0' }}>{g.name}</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(s => <button key={s} onClick={() => { const r = [...goalRatings]; r[idx] = s; setGoalRatings(r) }} style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', color: s <= goalRatings[idx] ? '#fbbf24' : '#374151' }}>★</button>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
              <details open style={{ background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)' }}>
                <summary style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#818cf8', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}><span>Core Competencies</span><span>▼</span></summary>
                <div style={{ padding: '0 16px 16px' }}>
                  {COMPETENCIES.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: '#e2e8f0', width: 120 }}>{c}</span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(s => <button key={s} onClick={() => { const r = [...compRatings]; r[idx] = s; setCompRatings(r) }} style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', color: s <= compRatings[idx] ? '#fbbf24' : '#374151' }}>★</button>)}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
              <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)', padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: 10 }}>Manager Comments</div>
                <textarea value={managerComment} onChange={e => setManagerComment(e.target.value)} placeholder="Add your comments..." style={{ width: '100%', minHeight: 80, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '8px 12px', color: '#e2e8f0', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)', padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: 10 }}>Overall Rating</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>Calculated Avg: <span style={{ color: '#818cf8', fontWeight: 700 }}>{calcAvg()}</span></div>
                  <input type="number" min={1} max={5} step={0.1} placeholder="Override" value={overrideRating} onChange={e => setOverrideRating(e.target.value)} style={{ width: 90, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '6px 10px', color: '#e2e8f0', fontSize: 13, outline: 'none' }} />
                </div>
              </div>
              <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)', padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: 10 }}>Employee Self-Assessment <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>(read-only)</span></div>
                <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.6 }}>I have made significant progress on my key goals this quarter. The sales pipeline initiative exceeded expectations, and I completed my safety certification on schedule. Areas for improvement include cross-team collaboration and documentation practices.</div>
              </div>
              <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)', padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: 10 }}>Development Plan</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Next Period Goals</div>
                <div style={{ fontSize: 13, color: '#e2e8f0', marginBottom: 12, lineHeight: 1.6 }}>1. Lead cross-functional product launch · 2. Achieve Advanced certification · 3. Mentor 2 junior team members</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Training Recommendations</div>
                <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }}>Advanced Leadership Program · Conflict Resolution Workshop · Technical Certification Track</div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(99,102,241,0.15)', display: 'flex', gap: 10, marginTop: 'auto' }}>
              <button style={{ flex: 1, padding: '9px 0', background: 'transparent', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#e2e8f0', fontSize: 13, cursor: 'pointer' }}>Save Draft</button>
              <button style={{ flex: 1, padding: '9px 0', background: 'rgba(99,102,241,0.85)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
      {showGoalModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 28, width: 480 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 18 }}>New Goal</div>
            {[{ label: 'Employee', placeholder: 'Search employee...' }, { label: 'Goal Title', placeholder: 'Enter goal description...' }, { label: 'Category', placeholder: 'e.g. Sales, Development, Technical' }, { label: 'Target Date', placeholder: 'MM/DD/YYYY' }, { label: 'Weight (%)', placeholder: 'e.g. 25' }].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{f.label}</div>
                <input type="text" placeholder={f.placeholder} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '8px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setShowGoalModal(false)} style={{ flex: 1, padding: '9px 0', background: 'transparent', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#e2e8f0', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => setShowGoalModal(false)} style={{ flex: 1, padding: '9px 0', background: 'rgba(99,102,241,0.85)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
