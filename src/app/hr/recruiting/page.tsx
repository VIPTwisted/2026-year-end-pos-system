'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ── types ──────────────────────────────────────────────────────────────────
type JobStage = 'New' | 'Screening' | 'Phone Screen' | 'Interviewing' | 'Offer' | 'Hired' | 'Closed'

interface JobPosting {
  id: number
  title: string
  dept: string
  location: string
  posted: string
  applications: number
  stage: JobStage
  recruiter: string
  status: 'Active' | 'Closed' | 'On Hold'
}

interface Interview {
  id: number
  date: string
  time: string
  candidate: string
  position: string
  interviewer: string
  type: 'Phone' | 'Video' | 'On-site'
}

interface RecentApp {
  id: number
  name: string
  position: string
  source: 'LinkedIn' | 'Indeed' | 'Referral' | 'Company Site'
  date: string
  status: string
}

// ── static data ─────────────────────────────────────────────────────────────
const JOBS: JobPosting[] = [
  { id: 1,  title: 'Sr. Software Engineer',   dept: 'IT',          location: 'Remote',    posted: 'Apr 1',  applications: 23, stage: 'Interviewing', recruiter: 'Sarah Kim',   status: 'Active' },
  { id: 2,  title: 'Marketing Coordinator',   dept: 'Marketing',   location: 'New York',  posted: 'Apr 5',  applications: 15, stage: 'Screening',    recruiter: 'Alice Chen',  status: 'Active' },
  { id: 3,  title: 'Operations Analyst',      dept: 'Operations',  location: 'Chicago',   posted: 'Apr 10', applications: 12, stage: 'Phone Screen', recruiter: 'Maria Santos',status: 'Active' },
  { id: 4,  title: 'Financial Analyst',       dept: 'Finance',     location: 'Chicago',   posted: 'Apr 12', applications: 8,  stage: 'New',          recruiter: 'Alice Chen',  status: 'Active' },
  { id: 5,  title: 'Warehouse Lead',          dept: 'Operations',  location: 'Chicago',   posted: 'Apr 15', applications: 18, stage: 'Offer',        recruiter: 'David Kim',   status: 'Active' },
  { id: 6,  title: 'UX Designer',             dept: 'IT',          location: 'Remote',    posted: 'Apr 18', applications: 11, stage: 'Interviewing', recruiter: 'Sarah Kim',   status: 'Active' },
  { id: 7,  title: 'HR Business Partner',     dept: 'HR',          location: 'Chicago',   posted: 'Apr 2',  applications: 9,  stage: 'Screening',    recruiter: 'Maria Santos',status: 'Active' },
  { id: 8,  title: 'DevOps Engineer',         dept: 'IT',          location: 'Remote',    posted: 'Apr 8',  applications: 14, stage: 'Phone Screen', recruiter: 'Sarah Kim',   status: 'Active' },
  { id: 9,  title: 'Supply Chain Manager',    dept: 'Operations',  location: 'Chicago',   posted: 'Mar 28', applications: 6,  stage: 'Interviewing', recruiter: 'Alice Chen',  status: 'Active' },
  { id: 10, title: 'Data Analyst',            dept: 'Finance',     location: 'New York',  posted: 'Apr 20', applications: 4,  stage: 'New',          recruiter: 'David Kim',   status: 'Active' },
]

const PIPELINE = [
  { stage: 'Applied',      count: 23, candidates: ['Jordan Mills', 'Kai Tanaka', 'Lena Hoffman', 'Marco Silva'] },
  { stage: 'Phone Screen', count: 8,  candidates: ['Jordan Mills', 'Lena Hoffman', 'Marco Silva', 'Nina Osei'] },
  { stage: 'Technical',    count: 5,  candidates: ['Jordan Mills', 'Lena Hoffman', 'Marco Silva'] },
  { stage: 'Interview',    count: 4,  candidates: ['Jordan Mills', 'Lena Hoffman'] },
  { stage: 'Offer',        count: 1,  candidates: ['Jordan Mills'] },
  { stage: 'Rejected',     count: 5,  candidates: ['Kai Tanaka', 'Peter Voss', 'Quinn Shaw'] },
]

const INTERVIEWS: Interview[] = [
  { id: 1, date: 'Apr 22', time: '9:00 AM',  candidate: 'Jordan Mills',  position: 'Sr. Software Engineer', interviewer: 'David Kim',    type: 'Technical' as 'Video' },
  { id: 2, date: 'Apr 22', time: '11:00 AM', candidate: 'Lena Hoffman',  position: 'Sr. Software Engineer', interviewer: 'Sarah Kim',    type: 'Video' },
  { id: 3, date: 'Apr 23', time: '10:00 AM', candidate: 'Nina Osei',     position: 'UX Designer',           interviewer: 'Alice Chen',   type: 'Video' },
  { id: 4, date: 'Apr 23', time: '2:00 PM',  candidate: 'Marco Silva',   position: 'Sr. Software Engineer', interviewer: 'Tom Jackson',  type: 'On-site' },
  { id: 5, date: 'Apr 24', time: '9:30 AM',  candidate: 'Priya Gupta',   position: 'HR Business Partner',   interviewer: 'Maria Santos', type: 'Phone' },
  { id: 6, date: 'Apr 24', time: '3:00 PM',  candidate: 'Alex Reeves',   position: 'DevOps Engineer',       interviewer: 'David Kim',    type: 'Video' },
  { id: 7, date: 'Apr 25', time: '1:00 PM',  candidate: 'Sam Torres',    position: 'Operations Analyst',    interviewer: 'Maria Santos', type: 'On-site' },
  { id: 8, date: 'Apr 25', time: '4:00 PM',  candidate: 'Chloe Park',    position: 'Financial Analyst',     interviewer: 'Alice Chen',   type: 'Phone' },
]

const RECENT_APPS: RecentApp[] = [
  { id: 1, name: 'Ethan Brooks',    position: 'Data Analyst',          source: 'LinkedIn',     date: 'Apr 22', status: 'New' },
  { id: 2, name: 'Fatima Al-Sayed', position: 'Sr. Software Engineer', source: 'Indeed',       date: 'Apr 21', status: 'Screening' },
  { id: 3, name: 'George Park',     position: 'Warehouse Lead',        source: 'Referral',     date: 'Apr 21', status: 'New' },
  { id: 4, name: 'Hana Suzuki',     position: 'UX Designer',           source: 'Company Site', date: 'Apr 20', status: 'Phone Screen' },
  { id: 5, name: 'Ivan Petrov',     position: 'DevOps Engineer',       source: 'LinkedIn',     date: 'Apr 20', status: 'New' },
]

const FUNNEL = [
  { stage: 'Applied',    count: 87, pct: null },
  { stage: 'Screened',   count: 54, pct: '62%' },
  { stage: 'Interviewed',count: 28, pct: '52%' },
  { stage: 'Offered',    count: 9,  pct: '32%' },
  { stage: 'Hired',      count: 6,  pct: '67%' },
]

// ── stage chip styles ────────────────────────────────────────────────────────
const stageStyle: Record<JobStage, string> = {
  'New':          'background:rgba(100,116,139,0.2);color:#94a3b8',
  'Screening':    'background:rgba(245,158,11,0.2);color:#fbbf24',
  'Phone Screen': 'background:rgba(99,102,241,0.2);color:#818cf8',
  'Interviewing': 'background:rgba(59,130,246,0.2);color:#60a5fa',
  'Offer':        'background:rgba(20,184,166,0.2);color:#2dd4bf',
  'Hired':        'background:rgba(34,197,94,0.2);color:#4ade80',
  'Closed':       'background:rgba(30,30,30,0.5);color:#64748b',
}

const sourceColors: Record<string, string> = {
  'LinkedIn':     '#0077b5',
  'Indeed':       '#2557a7',
  'Referral':     '#7c3aed',
  'Company Site': '#0891b2',
}

const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()

// ── component ────────────────────────────────────────────────────────────────
export default function RecruitingPage() {
  const [selectedJob, setSelectedJob] = useState<JobPosting>(JOBS[0])

  useEffect(() => {
    fetch('/api/hr/recruiting').catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Recruiting"
        breadcrumb={[
          { label: 'Human Resources', href: '/hr' },
          { label: 'Recruiting', href: '/hr/recruiting' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button style={{ background: 'rgba(99,102,241,0.85)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              New Job Posting
            </button>
            <button style={{ background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
              View Applications
            </button>
            <button style={{ background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
              Send Offer
            </button>
          </div>
        }
      />

      <div style={{ padding: '24px 28px' }}>
        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Open Positions',        value: '14',     color: '#e2e8f0' },
            { label: 'Applications',          value: '87',     color: '#e2e8f0' },
            { label: 'Interviews Scheduled',  value: '12',     color: '#e2e8f0' },
            { label: 'Offers Pending',        value: '3',      color: '#e2e8f0' },
            { label: 'Avg Time-to-Fill',      value: '28 days',color: '#e2e8f0' },
          ].map(k => (
            <div key={k.label} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: 20 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Open Job Postings */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.15)', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Open Job Postings</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Job Title', 'Dept', 'Location', 'Posted', 'Apps', 'Stage', 'Recruiter', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {JOBS.map((j, i) => (
                    <tr
                      key={j.id}
                      onClick={() => setSelectedJob(j)}
                      style={{
                        borderBottom: i < JOBS.length - 1 ? '1px solid rgba(99,102,241,0.06)' : 'none',
                        cursor: 'pointer',
                        background: selectedJob.id === j.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (selectedJob.id !== j.id) e.currentTarget.style.background = 'rgba(99,102,241,0.04)' }}
                      onMouseLeave={e => { if (selectedJob.id !== j.id) e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={{ padding: '10px 12px', color: '#e2e8f0', fontWeight: 500 }}>{j.title}</td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{j.dept}</td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{j.location}</td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{j.posted}</td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{j.applications}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, ...Object.fromEntries(stageStyle[j.stage].split(';').map(s => s.split(':') as [string,string])) }}>
                          {j.stage}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{j.recruiter}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>{j.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Candidate Pipeline */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.15)', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                Candidate Pipeline — <span style={{ color: '#818cf8' }}>{selectedJob.title}</span>
              </div>
              <div style={{ padding: '16px 18px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: 12, minWidth: 640 }}>
                  {PIPELINE.map(col => (
                    <div key={col.stage} style={{ flex: 1, minWidth: 100, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 8, padding: '12px 10px' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{col.stage}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#818cf8', marginBottom: 10 }}>{col.count}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {col.candidates.slice(0, 3).map(name => (
                          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#818cf8', flexShrink: 0 }}>
                              {initials(name)}
                            </div>
                            <span style={{ fontSize: 11, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Interview Schedule */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.15)', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Interview Schedule — This Week</div>
              <div style={{ padding: '8px 0' }}>
                {INTERVIEWS.map((iv, i) => (
                  <div key={iv.id} style={{ padding: '10px 18px', borderBottom: i < INTERVIEWS.length - 1 ? '1px solid rgba(99,102,241,0.06)' : 'none', display: 'grid', gridTemplateColumns: '72px 1fr 80px 70px', gap: 8, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#818cf8' }}>{iv.date}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{iv.time}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>{iv.candidate}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{iv.position}</div>
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{iv.interviewer}</div>
                    <span style={{
                      padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 600, textAlign: 'center',
                      background: iv.type === 'On-site' ? 'rgba(99,102,241,0.15)' : iv.type === 'Video' ? 'rgba(59,130,246,0.15)' : 'rgba(100,116,139,0.15)',
                      color: iv.type === 'On-site' ? '#818cf8' : iv.type === 'Video' ? '#60a5fa' : '#94a3b8',
                    }}>
                      {iv.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.15)', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Recent Applications</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Name', 'Position', 'Source', 'Date', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 14px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: 10, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_APPS.map((a, i) => (
                    <tr key={a.id} style={{ borderBottom: i < RECENT_APPS.length - 1 ? '1px solid rgba(99,102,241,0.06)' : 'none' }}>
                      <td style={{ padding: '9px 14px', color: '#e2e8f0', fontWeight: 500 }}>{a.name}</td>
                      <td style={{ padding: '9px 14px', color: '#94a3b8', fontSize: 11 }}>{a.position}</td>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{ padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: `${sourceColors[a.source]}22`, color: sourceColors[a.source] }}>{a.source}</span>
                      </td>
                      <td style={{ padding: '9px 14px', color: '#94a3b8', fontSize: 11 }}>{a.date}</td>
                      <td style={{ padding: '9px 14px', color: '#94a3b8', fontSize: 11 }}>{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recruiting Funnel SVG */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>Recruiting Funnel</div>
              <svg width="100%" viewBox="0 0 360 200" style={{ overflow: 'visible' }}>
                {FUNNEL.map((f, i) => {
                  const maxW = 340
                  const barW = maxW * (f.count / 87)
                  const barH = 28
                  const y = i * (barH + 6)
                  const x = (maxW - barW) / 2
                  const colors = ['#818cf8','#60a5fa','#34d399','#fbbf24','#f472b6']
                  return (
                    <g key={f.stage}>
                      <rect x={x} y={y} width={barW} height={barH} rx={4} fill={colors[i]} opacity={0.8} />
                      <text x={x + 8} y={y + 18} fill="#fff" fontSize="11" fontWeight="600">{f.stage}</text>
                      <text x={x + barW - 8} y={y + 18} fill="#fff" fontSize="11" textAnchor="end">{f.count}</text>
                      {f.pct && <text x={maxW / 2 + 185} y={y + 18} fill="#94a3b8" fontSize="10">{f.pct}</text>}
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
