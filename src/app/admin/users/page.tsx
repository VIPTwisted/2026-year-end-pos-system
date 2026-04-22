'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  id: string; username: string; fullName: string; email: string
  company: string; role: string; lastLogin: string; status: 'Active' | 'Inactive' | 'Locked'
}
interface Role {
  name: string; description: string; usersCount: number; modules: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const S = {
  bg:     '#0d0e24',
  card:   '#16213e',
  border: 'rgba(99,102,241,0.15)',
  accent: 'rgba(99,102,241,0.3)',
  text:   '#e2e8f0',
  muted:  '#94a3b8',
  indigo: '#6366f1',
}

const STATUS_CHIP: Record<string, { bg: string; color: string }> = {
  Active:   { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80' },
  Inactive: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
  Locked:   { bg: 'rgba(239,68,68,0.12)',  color: '#f87171' },
}

const DETAIL_ROLES: Record<string, string[]> = {
  admin:      ['System Admin', 'Global Approver'],
  'alice.chen': ['Finance Manager', 'GL Approver', 'Report Viewer'],
  'bob.wilson': ['Purchasing Agent', 'Vendor Manager'],
  'carlos.m':   ['Sales Rep', 'CRM User'],
  'maria.s':    ['HR Manager', 'Payroll Approver'],
}

const DETAIL_ACTIVITY: Record<string, string[]> = {
  admin:      ['Login from 10.0.1.1 – Apr 22 09:14', 'Settings changed – Apr 21 15:30', 'User created – Apr 20 11:00', 'Login from 10.0.1.1 – Apr 20 08:45', 'Role assigned – Apr 19 14:00'],
  'alice.chen': ['Login from 10.0.1.5 – Apr 22 08:30', 'Journal approved – Apr 22 09:01', 'Report exported – Apr 21 16:15', 'Login from 10.0.1.5 – Apr 21 08:22', 'Budget reviewed – Apr 20 14:00'],
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers]           = useState<User[]>([])
  const [roles, setRoles]           = useState<Role[]>([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState<User | null>(null)
  const [activeTab, setActiveTab]   = useState<'Users' | 'Roles' | 'Permissions' | 'Audit'>('Users')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterRole,   setFilterRole]   = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const [sortCol, setSortCol]       = useState<keyof User>('username')
  const [sortAsc, setSortAsc]       = useState(true)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users); setRoles(d.roles); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = users
    .filter(u => filterStatus === 'All' || u.status === filterStatus)
    .filter(u => !filterRole   || u.role === filterRole)
    .filter(u => !filterSearch || [u.username, u.fullName, u.email].some(f => f.toLowerCase().includes(filterSearch.toLowerCase())))
    .sort((a, b) => {
      const av = a[sortCol] as string, bv = b[sortCol] as string
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const toggleSort = (col: keyof User) => {
    if (sortCol === col) setSortAsc(!sortAsc); else { setSortCol(col); setSortAsc(true) }
  }
  const toggleCheck = (id: string) => {
    setCheckedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }
  const toggleAll = () => {
    setCheckedIds(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(u => u.id)))
  }

  const ColHead = ({ col, label }: { col: keyof User; label: string }) => (
    <th
      onClick={() => toggleSort(col)}
      style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: S.muted, fontWeight: 600,
        cursor: 'pointer', userSelect: 'none', borderBottom: `1px solid ${S.border}`,
        whiteSpace: 'nowrap', background: S.card }}
    >
      {label} {sortCol === col ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  )

  const detailRoles  = selected ? (DETAIL_ROLES[selected.id]    ?? [selected.role]) : []
  const detailActivity = selected ? (DETAIL_ACTIVITY[selected.id] ?? ['Login from 10.0.x.x – Apr 22', 'Login from 10.0.x.x – Apr 21', 'Login from 10.0.x.x – Apr 20', 'Login from 10.0.x.x – Apr 18', 'Login from 10.0.x.x – Apr 15']) : []
  const companies    = ['USMF', 'USRT', 'DEMF', 'GBSI', 'MXMF']

  const TABS: Array<'Users' | 'Roles' | 'Permissions' | 'Audit'> = ['Users', 'Roles', 'Permissions', 'Audit']

  return (
    <div style={{ minHeight: '100dvh', background: S.bg, display: 'flex', flexDirection: 'column' }}>
      <TopBar
        title="Users"
        breadcrumb={[
          { label: 'Administration', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
        ]}
        actions={
          <>
            <button style={btnPrimary}>New User</button>
            <button style={btnSecondary}>Import from AD</button>
            <button style={btnSecondary}>Assign Role</button>
          </>
        }
      />

      {/* Tab strip */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${S.border}`, paddingLeft: 24, background: S.card }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: '10px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
              background: 'transparent', color: activeTab === t ? S.indigo : S.muted,
              borderBottom: activeTab === t ? `2px solid ${S.indigo}` : '2px solid transparent',
              transition: 'color .15s',
            }}
          >{t}</button>
        ))}
      </div>

      {activeTab === 'Roles' ? (
        /* ── Roles view ── */
        <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Role Name', 'Description', 'Users', 'Module Access', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: S.muted, fontWeight: 600, borderBottom: `1px solid ${S.border}`, background: S.card }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${S.border}` }}>
                  <td style={{ padding: '10px 14px', color: S.indigo, fontWeight: 600 }}>{r.name}</td>
                  <td style={{ padding: '10px 14px', color: S.muted }}>{r.description}</td>
                  <td style={{ padding: '10px 14px', color: S.text }}>{r.usersCount}</td>
                  <td style={{ padding: '10px 14px', color: S.muted, fontSize: 12 }}>{r.modules}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button style={{ ...btnSecondary, padding: '4px 10px', fontSize: 11 }}>Edit Permissions</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'Permissions' ? (
        <div style={{ flex: 1, padding: 40, color: S.muted, fontSize: 14, textAlign: 'center' }}>
          Permissions matrix — select a role to configure module-level access.
        </div>
      ) : activeTab === 'Audit' ? (
        <div style={{ flex: 1, padding: 40, color: S.muted, fontSize: 14, textAlign: 'center' }}>
          Audit log — user administration events appear here.
        </div>
      ) : (
        /* ── Users view ── */
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Main panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Filter bar */}
            <div style={{ padding: '12px 20px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', borderBottom: `1px solid ${S.border}`, background: S.card }}>
              <input placeholder="User ID" style={filterInput} />
              <input placeholder="Name" style={filterInput} />
              <input placeholder="Email" style={filterInput} />
              <select style={filterSelect} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                <option value="">All Roles</option>
                {['System Admin','Finance Manager','Purchasing Agent','Sales Rep','HR Manager','Read Only','Warehouse Worker','Approver','Controller','IT Admin'].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <select style={filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                {['All','Active','Inactive','Locked'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select style={filterSelect}>
                <option value="">All Legal Entities</option>
                {['USMF','USRT','DEMF','GBSI'].map(e => <option key={e}>{e}</option>)}
              </select>
              <input
                placeholder="Search..."
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                style={{ ...filterInput, minWidth: 160 }}
              />
              <span style={{ marginLeft: 'auto', fontSize: 12, color: S.muted }}>{filtered.length} records</span>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: S.muted }}>Loading users...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 14px', borderBottom: `1px solid ${S.border}`, background: S.card, width: 36 }}>
                        <input type="checkbox" checked={checkedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
                      </th>
                      <ColHead col="username" label="User ID" />
                      <ColHead col="fullName" label="Full Name" />
                      <ColHead col="email"    label="Email" />
                      <ColHead col="company"  label="Company" />
                      <ColHead col="role"     label="Role" />
                      <ColHead col="lastLogin" label="Last Login" />
                      <ColHead col="status"   label="Status" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => {
                      const chip = STATUS_CHIP[u.status]
                      const isInactive = u.status === 'Inactive'
                      const isSelected = selected?.id === u.id
                      return (
                        <tr
                          key={u.id}
                          onClick={() => setSelected(isSelected ? null : u)}
                          style={{
                            borderBottom: `1px solid ${S.border}`,
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(99,102,241,0.08)' : isInactive ? 'rgba(148,163,184,0.04)' : 'transparent',
                            opacity: isInactive ? 0.7 : 1,
                            transition: 'background .12s',
                          }}
                        >
                          <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={checkedIds.has(u.id)} onChange={() => toggleCheck(u.id)} />
                          </td>
                          <td style={{ padding: '10px 14px', color: S.indigo, fontFamily: 'monospace', fontSize: 12 }}>{u.username}</td>
                          <td style={{ padding: '10px 14px', color: S.text, fontWeight: 500 }}>{u.fullName}</td>
                          <td style={{ padding: '10px 14px', color: S.muted, fontSize: 12 }}>{u.email}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'rgba(99,102,241,0.12)', color: S.indigo, fontWeight: 600 }}>{u.company}</span>
                          </td>
                          <td style={{ padding: '10px 14px', color: S.text, fontSize: 12 }}>{u.role}</td>
                          <td style={{ padding: '10px 14px', color: S.muted, fontSize: 12 }}>{u.lastLogin}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: chip.bg, color: chip.color, fontWeight: 600 }}>{u.status}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right panel */}
          {selected && (
            <div style={{ width: 300, background: S.card, borderLeft: `1px solid ${S.border}`, overflow: 'auto', flexShrink: 0 }}>
              {/* Header */}
              <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{selected.fullName}</div>
                  <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{selected.username}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>

              {/* User Detail */}
              <Section title="User Detail">
                <DetailRow label="Email"      value={selected.email} />
                <DetailRow label="Phone"      value="+1 (555) 000-0000" />
                <DetailRow label="Department" value={selected.role.replace(' Manager','').replace(' Agent','')} />
                <DetailRow label="Company"    value={selected.company} />
              </Section>

              {/* Roles */}
              <Section title="Roles">
                {detailRoles.map(r => (
                  <div key={r} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ fontSize: 12, color: S.text }}>{r}</span>
                    <button style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
                <button style={{ ...btnPrimary, width: '100%', marginTop: 8, fontSize: 12 }}>Add Role</button>
              </Section>

              {/* Legal Entities */}
              <Section title="Legal Entities">
                {companies.map(c => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, color: S.text, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={selected.company === c} />
                    {c}
                  </label>
                ))}
              </Section>

              {/* Last Activity */}
              <Section title="Last Activity">
                {detailActivity.map((ev, i) => (
                  <div key={i} style={{ fontSize: 11, color: S.muted, padding: '3px 0', borderBottom: i < detailActivity.length - 1 ? `1px solid ${S.border}` : 'none' }}>{ev}</div>
                ))}
              </Section>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: `1px solid rgba(99,102,241,0.1)` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ color: '#e2e8f0' }}>{value}</span>
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const btnPrimary: React.CSSProperties = {
  padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: 'pointer', border: 'none',
  background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
}
const btnSecondary: React.CSSProperties = {
  padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer',
  background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)',
}
const filterInput: React.CSSProperties = {
  padding: '5px 10px', fontSize: 12, borderRadius: 6, border: '1px solid rgba(99,102,241,0.2)',
  background: '#0d0e24', color: '#e2e8f0', outline: 'none', minWidth: 100,
}
const filterSelect: React.CSSProperties = {
  ...filterInput, minWidth: 120, cursor: 'pointer',
}
