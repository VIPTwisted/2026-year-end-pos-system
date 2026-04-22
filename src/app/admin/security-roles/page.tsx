'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg:     '#0d0e24',
  card:   '#16213e',
  border: 'rgba(99,102,241,0.15)',
  accent: 'rgba(99,102,241,0.3)',
  text:   '#e2e8f0',
  muted:  '#94a3b8',
  indigo: '#6366f1',
}

// ── Static data ────────────────────────────────────────────────────────────
const ROLES = [
  { id: 'sysadmin',   label: 'System Administrator', users: 1,  system: true  },
  { id: 'finmgr',     label: 'Finance Manager',       users: 8  },
  { id: 'salesrep',   label: 'Sales Representative',  users: 24 },
  { id: 'purchagent', label: 'Purchasing Agent',       users: 6  },
  { id: 'hrmgr',      label: 'HR Manager',             users: 4  },
  { id: 'whworker',   label: 'Warehouse Worker',       users: 18 },
  { id: 'readonly',   label: 'Read Only',              users: 12 },
  { id: 'manager',    label: 'Manager',                users: 15 },
  { id: 'itadmin',    label: 'IT Administrator',       users: 3  },
  { id: 'approver',   label: 'Approver',               users: 9  },
]

type P = boolean

interface ModulePerms {
  module:  string
  view:    P; create: P; edit: P; delete: P; approve: P; export: P; admin: P
}

const PERMS_SYSADMIN: ModulePerms[] = [
  { module: 'Finance',        view:true, create:true, edit:true, delete:true, approve:true, export:true, admin:true },
  { module: 'Sales',          view:true, create:true, edit:true, delete:true, approve:true, export:true, admin:true },
  { module: 'Procurement',    view:true, create:true, edit:true, delete:true, approve:true, export:true, admin:true },
  { module: 'Inventory',      view:true, create:true, edit:true, delete:true, approve:true, export:true, admin:true },
  { module: 'HR',             view:true, create:true, edit:true, delete:true, approve:true, export:true, admin:true },
  { module: 'POS',            view:true, create:true, edit:true, delete:true, approve:true, export:true, admin:true },
  { module: 'Administration', view:true, create:true, edit:true, delete:true, approve:true, export:true, admin:true },
]

const PERMS_FINMGR: ModulePerms[] = [
  { module: 'Finance',     view:true,  create:true,  edit:true,  delete:false, approve:true,  export:true,  admin:false },
  { module: 'Sales',       view:true,  create:false, edit:false, delete:false, approve:false, export:true,  admin:false },
  { module: 'Procurement', view:true,  create:false, edit:false, delete:false, approve:false, export:false, admin:false },
  { module: 'Inventory',   view:true,  create:false, edit:false, delete:false, approve:false, export:true,  admin:false },
  { module: 'HR',          view:false, create:false, edit:false, delete:false, approve:false, export:false, admin:false },
  { module: 'POS',         view:true,  create:false, edit:false, delete:false, approve:false, export:true,  admin:false },
  { module: 'Administration', view:false, create:false, edit:false, delete:false, approve:false, export:false, admin:false },
]

const USERS_FINMGR = [
  { id:'U-0041', name:'Alice Thornton',  added:'Jan 15, 2024', by:'System Admin' },
  { id:'U-0042', name:'Brian Kowalski',  added:'Feb 3, 2024',  by:'System Admin' },
  { id:'U-0055', name:'Carol Ndiaye',    added:'Mar 10, 2024', by:'Alice Thornton' },
  { id:'U-0061', name:'David Park',      added:'Apr 1, 2024',  by:'Alice Thornton' },
  { id:'U-0072', name:'Eva Mertens',     added:'Jun 22, 2024', by:'System Admin' },
  { id:'U-0083', name:'Frank Osei',      added:'Aug 5, 2024',  by:'Brian Kowalski' },
  { id:'U-0094', name:'Grace Liu',       added:'Sep 17, 2024', by:'System Admin' },
  { id:'U-0101', name:'Henry Bautista',  added:'Nov 28, 2024', by:'System Admin' },
]

const FIELD_PERMS = [
  { field:'Cost Price',   module:'Inventory', read:true,  write:true,  roles:'Finance Manager, System Administrator' },
  { field:'Margin %',     module:'Sales',     read:true,  write:false, roles:'Finance Manager, Sales Representative' },
  { field:'Salary Data',  module:'HR',        read:false, write:false, roles:'HR Manager, System Administrator' },
  { field:'Vendor Price', module:'Procurement', read:true, write:true, roles:'Purchasing Agent, Finance Manager' },
  { field:'Bank Account', module:'Finance',   read:true,  write:false, roles:'Finance Manager, System Administrator' },
]

// ── Component ──────────────────────────────────────────────────────────────
export default function SecurityRolesPage() {
  const [selected, setSelected] = useState('sysadmin')
  const [, setData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/admin/security-roles').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  const role    = ROLES.find(r => r.id === selected)!
  const isAdmin = selected === 'sysadmin'
  const isFinMgr = selected === 'finmgr'
  const perms   = isAdmin ? PERMS_SYSADMIN : isFinMgr ? PERMS_FINMGR : PERMS_SYSADMIN.map(m => ({ ...m, create:false, edit:false, delete:false, approve:false, export:false, admin:false }))

  const Tick = ({ v }: { v: boolean }) =>
    v
      ? <span style={{ color:'#34d399', fontSize:16 }}>✓</span>
      : <span style={{ color:'#475569', fontSize:16 }}>✗</span>

  const COLS = ['View','Create','Edit','Delete','Approve','Export','Admin'] as const
  const COL_KEYS: (keyof ModulePerms)[] = ['view','create','edit','delete','approve','export','admin']

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <TopBar
        title="Security Roles"
        breadcrumb={[
          { label:'Administration', href:'/admin' },
          { label:'Security Roles', href:'/admin/security-roles' },
        ]}
        actions={
          <>
            <button style={btnPrimary}>New Role</button>
            <button style={btnSecondary}>Copy Role</button>
            <button style={btnSecondary}>Export Permissions</button>
          </>
        }
      />

      <div style={{ display:'flex', height:'calc(100dvh - 80px)' }}>
        {/* ── Left panel ── */}
        <aside style={{ width:240, flexShrink:0, borderRight:`1px solid ${C.border}`, overflowY:'auto', padding:'12px 0' }}>
          {ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              style={{
                width:'100%', textAlign:'left', background:'none', border:'none', cursor:'pointer',
                padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
                borderLeft: selected === r.id ? `3px solid ${C.indigo}` : '3px solid transparent',
                background: selected === r.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                color: selected === r.id ? C.text : C.muted,
                fontSize: 13,
              }}
            >
              <span>{r.label}</span>
              <span style={{
                background: selected === r.id ? C.accent : 'rgba(255,255,255,0.05)',
                color: selected === r.id ? '#a5b4fc' : C.muted,
                borderRadius: 10, fontSize: 11, padding: '1px 7px', fontWeight:600,
              }}>{r.users}</span>
            </button>
          ))}
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>

          {/* Role header card */}
          <div style={{ ...card, marginBottom:20, display:'flex', flexWrap:'wrap', gap:24, alignItems:'flex-start' }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Role Name</div>
              <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{role.label}</div>
            </div>
            <InfoField label="Description" value={isAdmin ? 'Full system access' : isFinMgr ? 'Finance module full access, read-only on others' : 'Standard access'} />
            <InfoField label="Users" value={String(role.users)} />
            <InfoField label="Created" value={isAdmin ? 'Jan 1, 2020' : isFinMgr ? 'Mar 15, 2021' : 'Jan 1, 2022'} />
            <div>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Status</div>
              {role.system
                ? <span style={{ background:'rgba(99,102,241,0.15)', color:'#a5b4fc', borderRadius:4, fontSize:12, padding:'3px 10px', fontWeight:600 }}>System (locked)</span>
                : <span style={{ background:'rgba(52,211,153,0.12)', color:'#34d399', borderRadius:4, fontSize:12, padding:'3px 10px', fontWeight:600 }}>Active</span>
              }
            </div>
          </div>

          {/* Permission Matrix */}
          <div style={{ ...card, marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:8, height:8, borderRadius:2, background:C.indigo, display:'inline-block' }} />
              Permission Matrix
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr>
                    <th style={{ ...th, textAlign:'left', width:160 }}>Module</th>
                    {COLS.map(c => <th key={c} style={{ ...th, width:80 }}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {perms.map((m, i) => (
                    <tr key={m.module} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ ...td, fontWeight:600, color:C.indigo, paddingLeft:12 }}>
                        <span style={{ background:'rgba(99,102,241,0.12)', padding:'3px 10px', borderRadius:4, fontSize:12 }}>{m.module}</span>
                      </td>
                      {COL_KEYS.map(k => (
                        <td key={k} style={{ ...td, textAlign:'center' }}>
                          <Tick v={(m as Record<string, unknown>)[k] as boolean} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Users in Role */}
          <details style={{ ...card, marginBottom:20 }}>
            <summary style={{ cursor:'pointer', fontWeight:700, fontSize:13, color:C.text, padding:'14px 16px', display:'flex', alignItems:'center', gap:8, listStyle:'none' }}>
              <span style={{ width:8, height:8, borderRadius:2, background:'#f59e0b', display:'inline-block' }} />
              Users in Role
              <span style={{ background:'rgba(245,158,11,0.15)', color:'#f59e0b', fontSize:11, padding:'1px 8px', borderRadius:10, fontWeight:600, marginLeft:4 }}>{isFinMgr ? 8 : role.users}</span>
            </summary>
            <div style={{ padding:'0 16px 16px' }}>
              <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <button style={{ ...btnPrimary, fontSize:12, padding:'5px 12px' }}>+ Add User</button>
                <button style={{ ...btnSecondary, fontSize:12, padding:'5px 12px' }}>Remove User</button>
              </div>
              {isFinMgr && (
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr>
                      {['User ID','Name','Added Date','Added By'].map(h => <th key={h} style={{ ...th, textAlign:'left' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {USERS_FINMGR.map((u, i) => (
                      <tr key={u.id} style={{ background: i%2===0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                        <td style={{ ...td, color:C.indigo, fontWeight:600 }}>{u.id}</td>
                        <td style={td}>{u.name}</td>
                        <td style={{ ...td, color:C.muted }}>{u.added}</td>
                        <td style={{ ...td, color:C.muted }}>{u.by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!isFinMgr && <p style={{ color:C.muted, fontSize:12 }}>Select Finance Manager role to see users list.</p>}
            </div>
          </details>

          {/* Field-Level Permissions */}
          <details style={{ ...card }}>
            <summary style={{ cursor:'pointer', fontWeight:700, fontSize:13, color:C.text, padding:'14px 16px', display:'flex', alignItems:'center', gap:8, listStyle:'none' }}>
              <span style={{ width:8, height:8, borderRadius:2, background:'#06b6d4', display:'inline-block' }} />
              Field-Level Permissions
            </summary>
            <div style={{ padding:'0 16px 16px' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr>
                    {['Field','Module','Read','Write','Roles'].map(h => <th key={h} style={{ ...th, textAlign:'left' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {FIELD_PERMS.map((f, i) => (
                    <tr key={f.field} style={{ background: i%2===0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                      <td style={{ ...td, fontWeight:600 }}>{f.field}</td>
                      <td style={{ ...td, color:C.muted }}>{f.module}</td>
                      <td style={{ ...td, textAlign:'center' }}><Tick v={f.read} /></td>
                      <td style={{ ...td, textAlign:'center' }}><Tick v={f.write} /></td>
                      <td style={{ ...td, color:C.muted, fontSize:11 }}>{f.roles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </main>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize:11, color:'#94a3b8', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
      <div style={{ fontSize:14, color:'#e2e8f0' }}>{value}</div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#16213e',
  border: '1px solid rgba(99,102,241,0.15)',
  borderRadius: 8,
  padding: 16,
}
const btnPrimary: React.CSSProperties = {
  background: '#6366f1', color:'#fff', border:'none', borderRadius:6,
  padding:'7px 14px', fontSize:13, fontWeight:600, cursor:'pointer',
}
const btnSecondary: React.CSSProperties = {
  background: 'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)',
  borderRadius:6, padding:'7px 14px', fontSize:13, fontWeight:500, cursor:'pointer',
}
const th: React.CSSProperties = {
  padding:'8px 10px', color:'#94a3b8', fontSize:11, fontWeight:600,
  textTransform:'uppercase', letterSpacing:'0.05em',
  borderBottom:'1px solid rgba(99,102,241,0.12)',
}
const td: React.CSSProperties = {
  padding:'9px 10px', color:'#e2e8f0', fontSize:13,
  borderBottom:'1px solid rgba(99,102,241,0.07)',
}
