'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

interface Course {
  id: number; name: string; category: string; duration: string; format: string
  instructor: string; enrolled: number; completions: number; mandatory: boolean; status: string
}
interface TeamMember {
  name: string; required: number; completed: number; compliance: number; nextDue: string
}
interface Session {
  id: number; date: string; course: string; format: string; location: string; seats: number; totalSeats: number
}

const COURSES: Course[] = [
  { id: 1,  name: 'Workplace Safety 2026',        category: 'Compliance',  duration: '2 hrs',   format: 'Online',    instructor: 'HR Team',      enrolled: 342, completions: 330, mandatory: true,  status: 'Active' },
  { id: 2,  name: 'Data Privacy (GDPR)',           category: 'Compliance',  duration: '1.5 hrs', format: 'Online',    instructor: 'Legal',        enrolled: 342, completions: 338, mandatory: true,  status: 'Active' },
  { id: 3,  name: 'Leadership Essentials',         category: 'Development', duration: '8 hrs',   format: 'In-Person', instructor: 'Ext. Trainer', enrolled: 12,  completions: 10,  mandatory: false, status: 'Active' },
  { id: 4,  name: 'Excel Advanced',               category: 'Technical',   duration: '4 hrs',   format: 'Online',    instructor: 'IT Dept',      enrolled: 24,  completions: 18,  mandatory: false, status: 'Active' },
  { id: 5,  name: 'Customer Service Excellence',  category: 'Skills',      duration: '3 hrs',   format: 'Online',    instructor: 'Sales',        enrolled: 45,  completions: 40,  mandatory: false, status: 'Active' },
  { id: 6,  name: 'New Hire Orientation',         category: 'Onboarding',  duration: '4 hrs',   format: 'In-Person', instructor: 'HR Team',      enrolled: 8,   completions: 8,   mandatory: true,  status: 'Active' },
  { id: 7,  name: 'Conflict Resolution',          category: 'Skills',      duration: '2 hrs',   format: 'Online',    instructor: 'HR Team',      enrolled: 58,  completions: 45,  mandatory: false, status: 'Active' },
  { id: 8,  name: 'Project Management Basics',    category: 'Development', duration: '6 hrs',   format: 'Online',    instructor: 'Ext. Trainer', enrolled: 22,  completions: 17,  mandatory: false, status: 'Active' },
  { id: 9,  name: 'Anti-Harassment Policy 2026',  category: 'Compliance',  duration: '1 hr',    format: 'Online',    instructor: 'Legal',        enrolled: 342, completions: 342, mandatory: true,  status: 'Active' },
  { id: 10, name: 'Power BI Fundamentals',        category: 'Technical',   duration: '5 hrs',   format: 'Online',    instructor: 'IT Dept',      enrolled: 18,  completions: 12,  mandatory: false, status: 'Active' },
  { id: 11, name: 'Diversity & Inclusion',        category: 'Compliance',  duration: '1.5 hrs', format: 'Online',    instructor: 'HR Team',      enrolled: 342, completions: 320, mandatory: true,  status: 'Active' },
  { id: 12, name: 'Sales Methodology',            category: 'Skills',      duration: '4 hrs',   format: 'In-Person', instructor: 'Sales',        enrolled: 28,  completions: 24,  mandatory: false, status: 'Active' },
  { id: 13, name: 'ERP System Fundamentals',      category: 'Technical',   duration: '8 hrs',   format: 'Online',    instructor: 'IT Dept',      enrolled: 65,  completions: 55,  mandatory: false, status: 'Active' },
  { id: 14, name: 'Budget Management 101',        category: 'Development', duration: '3 hrs',   format: 'Online',    instructor: 'Finance',      enrolled: 14,  completions: 10,  mandatory: false, status: 'Active' },
  { id: 15, name: 'Emergency Response Training',  category: 'Compliance',  duration: '2 hrs',   format: 'In-Person', instructor: 'HR Team',      enrolled: 342, completions: 298, mandatory: true,  status: 'Active' },
]

const TEAM: TeamMember[] = [
  { name: 'Alice Chen',    required: 6, completed: 6, compliance: 100, nextDue: 'Jun 30' },
  { name: 'Bob Wilson',    required: 5, completed: 4, compliance: 80,  nextDue: 'May 15' },
  { name: 'Carlos Mendez', required: 6, completed: 3, compliance: 50,  nextDue: 'Apr 30' },
  { name: 'Sarah Kim',     required: 5, completed: 5, compliance: 100, nextDue: 'Dec 31' },
  { name: 'Tom Jackson',   required: 7, completed: 6, compliance: 86,  nextDue: 'May 31' },
]

const SESSIONS: Session[] = [
  { id: 1, date: 'Apr 24', course: 'New Hire Orientation',        format: 'In-Person', location: 'Chicago HQ - Rm 201',  seats: 3,  totalSeats: 10  },
  { id: 2, date: 'Apr 25', course: 'Workplace Safety 2026',       format: 'Online',    location: 'Zoom Link',            seats: 0,  totalSeats: 50  },
  { id: 3, date: 'Apr 28', course: 'Leadership Essentials',       format: 'In-Person', location: 'New York Office',      seats: 2,  totalSeats: 15  },
  { id: 4, date: 'Apr 29', course: 'Excel Advanced',              format: 'Online',    location: 'Teams Link',           seats: 12, totalSeats: 20  },
  { id: 5, date: 'May 2',  course: 'Customer Service Excellence', format: 'Online',    location: 'LMS Portal',           seats: 8,  totalSeats: 30  },
  { id: 6, date: 'May 5',  course: 'Conflict Resolution',         format: 'Online',    location: 'Zoom Link',            seats: 5,  totalSeats: 25  },
  { id: 7, date: 'May 8',  course: 'Anti-Harassment Policy 2026', format: 'Online',    location: 'LMS Portal',           seats: 20, totalSeats: 100 },
  { id: 8, date: 'May 12', course: 'Emergency Response Training', format: 'In-Person', location: 'Chicago HQ - Atrium',  seats: 4,  totalSeats: 20  },
]

const DEPT_COMPLIANCE = [
  { dept: 'Finance',       pct: 98,  color: '#34d399' },
  { dept: 'Operations',    pct: 94,  color: '#34d399' },
  { dept: 'Sales',         pct: 87,  color: '#fbbf24' },
  { dept: 'IT',            pct: 96,  color: '#34d399' },
  { dept: 'HR',            pct: 100, color: '#34d399' },
  { dept: 'Manufacturing', pct: 82,  color: '#fbbf24' },
]

const TREND_DATA   = [22, 18, 31, 27, 35, 29, 40, 38, 26, 33, 45, 42]
const TREND_MONTHS = ['May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr']

const catColors: Record<string, { bg: string; text: string }> = {
  Compliance:  { bg: 'rgba(239,68,68,0.15)',  text: '#f87171' },
  Development: { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa' },
  Technical:   { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
  Skills:      { bg: 'rgba(20,184,166,0.15)', text: '#2dd4bf' },
  Onboarding:  { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80' },
}

export default function TrainingPage() {
  const [, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/hr/training').catch(() => {})
    setLoaded(true)
  }, [])

  const maxTrend = Math.max(...TREND_DATA)
  const chartH = 80
  const chartW = 300
  const pts = TREND_DATA.map((v, i) => `${(i / (TREND_DATA.length - 1)) * chartW},${chartH - (v / maxTrend) * chartH}`).join(' ')

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Training & Development"
        breadcrumb={[{ label: 'Human Resources', href: '/hr' }, { label: 'Training', href: '/hr/training' }]}
        actions={
          <div className="flex items-center gap-2">
            <button style={{ background: 'rgba(99,102,241,0.85)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>New Course</button>
            <button style={{ background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Enroll Employees</button>
            <button style={{ background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Training Calendar</button>
          </div>
        }
      />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Active Courses',          value: '18',  color: '#e2e8f0' },
            { label: 'Enrolled (This Quarter)', value: '124', color: '#e2e8f0' },
            { label: 'Completions YTD',         value: '287', color: '#e2e8f0' },
            { label: 'Compliance Training Due', value: '12',  color: '#fbbf24' },
          ].map(k => (
            <div key={k.label} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.15)', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Course Catalog</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                      {['Course','Category','Duration','Format','Instructor','Enrolled','Completions','Mandatory','Status'].map(h => (
                        <th key={h} style={{ padding: '9px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COURSES.map((c, i) => {
                      const cat = catColors[c.category] ?? { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' }
                      return (
                        <tr key={c.id} style={{ borderBottom: i < COURSES.length - 1 ? '1px solid rgba(99,102,241,0.06)' : 'none' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.04)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                          <td style={{ padding: '9px 12px', color: '#e2e8f0', fontWeight: 500, whiteSpace: 'nowrap' }}>{c.name}</td>
                          <td style={{ padding: '9px 12px' }}><span style={{ padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: cat.bg, color: cat.text }}>{c.category}</span></td>
                          <td style={{ padding: '9px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{c.duration}</td>
                          <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{c.format}</td>
                          <td style={{ padding: '9px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{c.instructor}</td>
                          <td style={{ padding: '9px 12px', color: '#e2e8f0', textAlign: 'right' }}>{c.enrolled}</td>
                          <td style={{ padding: '9px 12px', color: '#e2e8f0', textAlign: 'right' }}>{c.completions}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                            {c.mandatory ? <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>YES</span> : <span style={{ fontSize: 11, color: '#64748b' }}>No</span>}
                          </td>
                          <td style={{ padding: '9px 12px' }}><span style={{ padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>{c.status}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.15)', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>My Team’s Training Status</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Employee','Required','Completed','Compliance %','Next Due'].map(h => (
                      <th key={h} style={{ padding: '9px 16px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: 10, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TEAM.map((m, i) => (
                    <tr key={m.name} style={{ borderBottom: i < TEAM.length - 1 ? '1px solid rgba(99,102,241,0.06)' : 'none' }}>
                      <td style={{ padding: '11px 16px', color: '#e2e8f0', fontWeight: 500 }}>{m.name}</td>
                      <td style={{ padding: '11px 16px', color: '#94a3b8', textAlign: 'center' }}>{m.required}</td>
                      <td style={{ padding: '11px 16px', color: '#e2e8f0', textAlign: 'center' }}>{m.completed}</td>
                      <td style={{ padding: '11px 16px', minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'rgba(99,102,241,0.15)', borderRadius: 3 }}>
                            <div style={{ width: String(m.compliance) + '%', height: '100%', background: m.compliance >= 95 ? '#34d399' : m.compliance >= 80 ? '#fbbf24' : '#f87171', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: m.compliance >= 95 ? '#34d399' : m.compliance >= 80 ? '#fbbf24' : '#f87171', fontWeight: 600, width: 36 }}>{m.compliance}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 16px', color: '#94a3b8' }}>{m.nextDue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.15)', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Upcoming Training Sessions</div>
              <div style={{ padding: '8px 0' }}>
                {SESSIONS.map((s, i) => {
                  const full = s.seats === 0
                  return (
                    <div key={s.id} style={{ padding: '10px 18px', borderBottom: i < SESSIONS.length - 1 ? '1px solid rgba(99,102,241,0.06)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{s.course}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{s.date} · {s.format} · {s.location}</div>
                        </div>
                        <button style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, border: 'none', cursor: full ? 'not-allowed' : 'pointer', background: full ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: full ? '#f87171' : '#4ade80' }}>
                          {full ? 'Full' : 'Enroll'}
                        </button>
                      </div>
                      <div style={{ fontSize: 10, color: full ? '#f87171' : '#94a3b8' }}>
                        {full ? 'No seats available' : `${s.seats} of ${s.totalSeats} seats available`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>Compliance by Department</div>
              {DEPT_COMPLIANCE.map(d => (
                <div key={d.dept} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#e2e8f0' }}>{d.dept}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.pct}%</span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(99,102,241,0.12)', borderRadius: 4 }}>
                    <div style={{ width: String(d.pct) + '%', height: '100%', background: d.color, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>Completion Trend — Last 12 Months</div>
              <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 20}`} preserveAspectRatio="none">
                {[0, 0.25, 0.5, 0.75, 1].map(f => (
                  <line key={f} x1={0} y1={chartH * (1 - f)} x2={chartW} y2={chartH * (1 - f)} stroke="rgba(99,102,241,0.1)" strokeWidth="1" />
                ))}
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <polygon points={`0,${chartH} ${pts} ${chartW},${chartH}`} fill="url(#trendGrad)" />
                <polyline points={pts} fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                {TREND_DATA.map((v, i) => (
                  <circle key={i} cx={(i / (TREND_DATA.length - 1)) * chartW} cy={chartH - (v / maxTrend) * chartH} r={3} fill="#2dd4bf" />
                ))}
                {TREND_MONTHS.filter((_, i) => i % 2 === 0).map((m, idx) => (
                  <text key={m} x={(idx * 2 / (TREND_DATA.length - 1)) * chartW} y={chartH + 14} textAnchor="middle" fill="#94a3b8" fontSize="9">{m}</text>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
