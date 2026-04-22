'use client'

import { CheckCircle, Clock, ClipboardList, FlaskConical, RefreshCw } from 'lucide-react'

const PHASES = [
  {
    number: 1,
    name: 'Initiate',
    subheader: 'Get ready to start',
    icon: Clock,
    status: 'complete',
    progress: 100,
    color: '#4f46e5',
    items: [
      { label: 'Requirement analysis', type: 'regular' },
      { label: 'Project governance', type: 'regular' },
      { label: 'Fit gap analysis', type: 'regular' },
      { label: 'Customer kick-off', type: 'regular' },
      { label: 'Risk assessment', type: 'regular' },
      { label: 'Project charter', type: 'regular' },
      { label: 'Stakeholder alignment', type: 'regular' },
      { label: 'Solution Blueprint Review', type: 'milestone' },
    ],
  },
  {
    number: 2,
    name: 'Implement',
    subheader: 'Design and build',
    icon: ClipboardList,
    status: 'active',
    progress: 62,
    color: '#7c3aed',
    items: [
      { label: 'Code', type: 'regular' },
      { label: 'Configure', type: 'regular' },
      { label: 'Unit testing', type: 'regular' },
      { label: 'Sprint reviews', type: 'regular' },
      { label: 'Data modeling', type: 'milestone' },
      { label: 'Solution performance', type: 'milestone' },
      { label: 'Integration Design', type: 'milestone' },
      { label: 'Data Migration Strategy', type: 'milestone' },
      { label: 'Security Strategy', type: 'milestone' },
      { label: 'BI & Analytics', type: 'milestone' },
      { label: 'ALM Strategy', type: 'milestone' },
      { label: 'Test Strategy', type: 'milestone' },
    ],
  },
  {
    number: 3,
    name: 'Prepare',
    subheader: 'Deploy',
    icon: FlaskConical,
    status: 'pending',
    progress: 0,
    color: '#6d28d9',
    items: [
      { label: 'Testing and acceptance', type: 'milestone' },
      { label: 'Go-live planning', type: 'regular' },
      { label: 'User readiness', type: 'regular' },
      { label: 'Cutover planning', type: 'regular' },
      { label: 'Performance validation', type: 'regular' },
      { label: 'Environment setup', type: 'regular' },
      { label: 'Training delivery', type: 'regular' },
      { label: 'Go-live Readiness Review', type: 'milestone' },
    ],
  },
  {
    number: 4,
    name: 'Operate',
    subheader: 'Live',
    icon: RefreshCw,
    status: 'pending',
    progress: 0,
    color: '#5b21b6',
    items: [
      { label: 'Solution health', type: 'regular' },
      { label: 'Usage monitoring', type: 'regular' },
      { label: 'Maintenance', type: 'regular' },
      { label: 'Hypercare support', type: 'regular' },
      { label: 'Performance tuning', type: 'regular' },
      { label: 'Post Go-live Readiness Review', type: 'milestone' },
      { label: 'Success by Design review and workshops', type: 'legend' },
    ],
  },
]

const statusLabel: Record<string, string> = {
  complete: 'Complete',
  active: 'In Progress',
  pending: 'Not Started',
}

const statusColor: Record<string, string> = {
  complete: '#22c55e',
  active: '#a5b4fc',
  pending: 'rgba(148,163,184,0.35)',
}

export default function MethodologyPage() {
  return (
    <div className="min-h-[100dvh] p-8" style={{ background: 'linear-gradient(180deg, #080918 0%, #0d0e24 100%)' }}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(165,180,252,0.5)' }}>
          Administration
        </p>
        <h1 className="text-2xl font-bold text-white">Implementation Methodology</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(165,180,252,0.6)' }}>
          NovaPOS Success by Design Framework
        </p>
      </div>

      {/* Current Phase Banner */}
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(79,70,229,0.15))',
          border: '1px solid rgba(124,58,237,0.4)',
        }}
      >
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#a5b4fc' }} />
        <span className="text-sm font-semibold" style={{ color: '#a5b4fc' }}>
          Current Phase:
        </span>
        <span className="text-sm font-bold text-white">Implement</span>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ background: 'rgba(124,58,237,0.3)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.4)' }}>
          Phase 2 of 4
        </span>
      </div>

      {/* 4-Column Phase Grid */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {PHASES.map((phase) => {
          const Icon = phase.icon
          const isActive = phase.status === 'active'
          const isComplete = phase.status === 'complete'

          return (
            <div
              key={phase.number}
              className="rounded-xl overflow-hidden flex flex-col"
              style={{
                background: isActive
                  ? 'linear-gradient(180deg, rgba(79,70,229,0.12) 0%, rgba(13,14,36,0.95) 100%)'
                  : 'rgba(13,14,36,0.8)',
                border: isActive
                  ? '1px solid rgba(124,58,237,0.45)'
                  : '1px solid rgba(99,102,241,0.15)',
              }}
            >
              {/* Phase Header */}
              <div
                className="px-4 py-3 flex items-center gap-2.5"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(79,70,229,0.35), rgba(124,58,237,0.25))'
                    : isComplete
                    ? 'rgba(30,30,60,0.8)'
                    : 'rgba(20,20,45,0.8)',
                  borderBottom: '1px solid rgba(99,102,241,0.18)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                      : isComplete
                      ? 'rgba(79,70,229,0.4)'
                      : 'rgba(30,30,60,0.9)',
                    border: isActive ? 'none' : '1px solid rgba(99,102,241,0.2)',
                  }}
                >
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4" style={{ color: '#a5b4fc' }} />
                  ) : (
                    <Icon className="w-4 h-4" style={{ color: isActive ? '#fff' : 'rgba(148,163,184,0.5)' }} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(165,180,252,0.5)' }}>
                    Phase {phase.number}
                  </div>
                  <div className="text-sm font-bold truncate" style={{ color: isActive ? '#fff' : isComplete ? '#a5b4fc' : 'rgba(148,163,184,0.6)' }}>
                    {phase.name}
                  </div>
                </div>
              </div>

              {/* Sub-header (dark row) */}
              <div
                className="px-4 py-2 text-xs font-semibold"
                style={{
                  background: 'rgba(10,11,30,0.8)',
                  color: isActive ? '#c4b5fd' : 'rgba(148,163,184,0.5)',
                  borderBottom: '1px solid rgba(99,102,241,0.1)',
                }}
              >
                {phase.subheader}
              </div>

              {/* Items */}
              <div className="flex flex-col flex-1">
                {phase.items.map((item, idx) => {
                  if (item.type === 'milestone') {
                    return (
                      <div
                        key={idx}
                        className="px-4 py-2 text-xs font-semibold"
                        style={{
                          background: 'rgba(109,40,217,0.25)',
                          color: '#c4b5fd',
                          borderLeft: '3px solid #7c3aed',
                          borderBottom: '1px solid rgba(109,40,217,0.15)',
                        }}
                      >
                        {item.label}
                      </div>
                    )
                  }
                  if (item.type === 'legend') {
                    return (
                      <div
                        key={idx}
                        className="px-4 py-2 text-xs font-semibold mt-auto"
                        style={{
                          background: 'rgba(88,28,135,0.35)',
                          color: '#ddd6fe',
                          border: '1px solid rgba(109,40,217,0.4)',
                          borderLeft: '3px solid #9333ea',
                          margin: '4px',
                          borderRadius: '6px',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: '#7c3aed' }} />
                          {item.label}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={idx}
                      className="px-4 py-2 text-xs"
                      style={{
                        color: 'rgba(148,163,184,0.7)',
                        borderBottom: '1px solid rgba(99,102,241,0.07)',
                      }}
                    >
                      {item.label}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-10 px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(109,40,217,0.25)', border: '1px solid #7c3aed' }} />
          <span className="text-xs" style={{ color: 'rgba(165,180,252,0.6)' }}>Success by Design review and workshops</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(10,11,30,0.8)', border: '1px solid rgba(99,102,241,0.15)' }} />
          <span className="text-xs" style={{ color: 'rgba(165,180,252,0.6)' }}>Standard activity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(20,20,45,0.8)', border: '1px solid rgba(99,102,241,0.15)' }} />
          <span className="text-xs" style={{ color: 'rgba(165,180,252,0.6)' }}>Phase header</span>
        </div>
      </div>

      {/* Project Progress */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'rgba(13,14,36,0.85)',
          border: '1px solid rgba(99,102,241,0.18)',
        }}
      >
        <h2 className="text-base font-bold text-white mb-1">Project Progress</h2>
        <p className="text-xs mb-5" style={{ color: 'rgba(165,180,252,0.5)' }}>
          Overall implementation completion across all phases
        </p>

        <div className="grid grid-cols-4 gap-4">
          {PHASES.map((phase) => {
            const Icon = phase.icon
            const isActive = phase.status === 'active'
            const isComplete = phase.status === 'complete'

            return (
              <div
                key={phase.number}
                className="rounded-lg p-4"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.08))'
                    : 'rgba(10,11,30,0.6)',
                  border: isActive
                    ? '1px solid rgba(124,58,237,0.35)'
                    : '1px solid rgba(99,102,241,0.12)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: isActive ? '#a5b4fc' : isComplete ? '#a5b4fc' : 'rgba(148,163,184,0.35)' }} />
                    <span className="text-sm font-semibold" style={{ color: isActive ? '#e2e8f0' : isComplete ? '#a5b4fc' : 'rgba(148,163,184,0.5)' }}>
                      {phase.name}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: isActive
                        ? 'rgba(124,58,237,0.25)'
                        : isComplete
                        ? 'rgba(34,197,94,0.15)'
                        : 'rgba(30,30,60,0.5)',
                      color: statusColor[phase.status],
                      border: `1px solid ${isActive ? 'rgba(124,58,237,0.3)' : isComplete ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.1)'}`,
                    }}
                  >
                    {statusLabel[phase.status]}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(30,30,60,0.8)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${phase.progress}%`,
                      background: isComplete
                        ? 'linear-gradient(90deg, #4f46e5, #7c3aed)'
                        : isActive
                        ? 'linear-gradient(90deg, #7c3aed, #a855f7)'
                        : 'rgba(99,102,241,0.2)',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: 'rgba(148,163,184,0.5)' }}>
                    Phase {phase.number}
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: isComplete ? '#a5b4fc' : isActive ? '#c4b5fd' : 'rgba(148,163,184,0.3)' }}>
                    {phase.progress}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Overall bar */}
        <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(99,102,241,0.12)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white">Overall Project Completion</span>
            <span className="text-xs font-bold" style={{ color: '#a5b4fc' }}>40.5%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(30,30,60,0.8)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: '40.5%',
                background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #a855f7)',
              }}
            />
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'rgba(148,163,184,0.4)' }}>
            Phase 1 complete · Phase 2 in progress (62%) · Phases 3–4 pending
          </p>
        </div>
      </div>
    </div>
  )
}
