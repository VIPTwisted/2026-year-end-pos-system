'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────

type RegisterStatus = 'OPEN' | 'CLOSED'

type Register = {
  id: string
  name: string
  status: RegisterStatus
  cashier?: string
  shiftOpened?: string
  cashSalesToday?: number
  transactionCount?: number
  lastClosed?: string
  lastCashier?: string
}

type DrawerEvent = {
  time: string
  register: string
  cashier: string
  eventType: string
  amount: number | null
  reason: string
  authBy: string
}

type DenomBreakdown = {
  d100: number; d50: number; d20: number; d10: number; d5: number; d1: number
  q: number; dime: number; nickel: number; penny: number
}

const EMPTY_DENOM: DenomBreakdown = {
  d100: 0, d50: 0, d20: 0, d10: 0, d5: 0, d1: 0,
  q: 0, dime: 0, nickel: 0, penny: 0,
}

function denomTotal(d: DenomBreakdown): number {
  return (
    d.d100 * 100 + d.d50 * 50 + d.d20 * 20 + d.d10 * 10 +
    d.d5 * 5 + d.d1 * 1 + d.q * 0.25 + d.dime * 0.10 +
    d.nickel * 0.05 + d.penny * 0.01
  )
}

const DENOM_LABELS: { key: keyof DenomBreakdown; label: string; value: number }[] = [
  { key: 'd100', label: '$100 bills', value: 100 },
  { key: 'd50',  label: '$50 bills',  value: 50 },
  { key: 'd20',  label: '$20 bills',  value: 20 },
  { key: 'd10',  label: '$10 bills',  value: 10 },
  { key: 'd5',   label: '$5 bills',   value: 5 },
  { key: 'd1',   label: '$1 bills',   value: 1 },
  { key: 'q',    label: 'Quarters',   value: 0.25 },
  { key: 'dime', label: 'Dimes',      value: 0.10 },
  { key: 'nickel', label: 'Nickels',  value: 0.05 },
  { key: 'penny',  label: 'Pennies',  value: 0.01 },
]

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_REGISTERS: Register[] = [
  {
    id: 'reg-1', name: 'Register 1', status: 'OPEN',
    cashier: 'Alice Chen', shiftOpened: '8:00 AM',
    cashSalesToday: 1247.82, transactionCount: 47,
  },
  {
    id: 'reg-2', name: 'Register 2', status: 'OPEN',
    cashier: 'James Rivera', shiftOpened: '9:15 AM',
    cashSalesToday: 893.44, transactionCount: 31,
  },
  {
    id: 'reg-3', name: 'Register 3', status: 'CLOSED',
    lastClosed: '2:30 PM', lastCashier: 'Maria Santos',
  },
  {
    id: 'reg-4', name: 'Register 4', status: 'CLOSED',
    lastClosed: '12:00 PM', lastCashier: 'Tom Bradley',
  },
]

const MOCK_DRAWER_EVENTS: DrawerEvent[] = [
  { time: '8:00 AM',  register: 'REG-001', cashier: 'Alice Chen',    eventType: 'OPEN_SHIFT',   amount: 300,    reason: 'Shift start',      authBy: 'Manager' },
  { time: '9:15 AM',  register: 'REG-002', cashier: 'James Rivera',  eventType: 'OPEN_SHIFT',   amount: 300,    reason: 'Shift start',      authBy: 'Manager' },
  { time: '10:02 AM', register: 'REG-001', cashier: 'Alice Chen',    eventType: 'OPEN_SALE',    amount: null,   reason: 'TXN-001',          authBy: '' },
  { time: '10:45 AM', register: 'REG-001', cashier: 'Alice Chen',    eventType: 'SAFE_DROP',    amount: 500,    reason: 'Drawer too high',  authBy: 'Mgr: Kim' },
  { time: '11:20 AM', register: 'REG-002', cashier: 'James Rivera',  eventType: 'OPEN_NO_SALE', amount: null,   reason: 'Change request',   authBy: '' },
  { time: '11:55 AM', register: 'REG-001', cashier: 'Alice Chen',    eventType: 'PAID_OUT',     amount: -25,    reason: 'Coffee supplies',  authBy: 'Mgr: Kim' },
  { time: '12:00 PM', register: 'REG-004', cashier: 'Tom Bradley',   eventType: 'CLOSE_SHIFT',  amount: 487.50, reason: 'Shift end',        authBy: 'Manager' },
  { time: '1:10 PM',  register: 'REG-002', cashier: 'James Rivera',  eventType: 'OPEN_SALE',    amount: null,   reason: 'TXN-089',          authBy: '' },
  { time: '2:30 PM',  register: 'REG-003', cashier: 'Maria Santos',  eventType: 'CLOSE_SHIFT',  amount: 602.10, reason: 'Shift end',        authBy: 'Manager' },
  { time: '2:47 PM',  register: 'REG-001', cashier: 'Alice Chen',    eventType: 'PAID_IN',      amount: 50,     reason: 'Petty cash',       authBy: 'Mgr: Kim' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function DenomGrid({
  denom, setDenom, showTotal,
}: {
  denom: DenomBreakdown
  setDenom: (d: DenomBreakdown) => void
  showTotal?: boolean
}) {
  const total = denomTotal(denom)
  return (
    <div className="space-y-1.5">
      {DENOM_LABELS.map(({ key, label, value }) => (
        <div key={key} className="grid grid-cols-3 gap-2 items-center">
          <span className="text-xs text-[#94a3b8]">{label}</span>
          <input
            type="number"
            min={0}
            value={denom[key] || ''}
            onChange={e => setDenom({ ...denom, [key]: parseInt(e.target.value) || 0 })}
            placeholder="0"
            className="px-2 py-1 bg-[#0d0e24] border border-[rgba(99,102,241,0.15)] rounded text-[#e2e8f0] text-xs text-center focus:outline-none focus:border-[rgba(99,102,241,0.5)]"
          />
          <span className="text-xs text-[#e2e8f0] text-right">
            {fmt(denom[key] * value)}
          </span>
        </div>
      ))}
      {showTotal && (
        <div className="mt-2 pt-2 border-t border-[rgba(99,102,241,0.15)] flex justify-between">
          <span className="text-xs font-semibold text-[#94a3b8]">Total</span>
          <span className="text-sm font-bold text-indigo-400">{fmt(total)}</span>
        </div>
      )}
    </div>
  )
}

function Modal({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border"
        style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.3)' }}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-4 border-b"
          style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}
        >
          <h3 className="text-[#e2e8f0] font-semibold text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#e2e8f0] transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function Field({
  label, children,
}: {
  label: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function Input2({
  type = 'text', value, onChange, placeholder, disabled,
}: {
  type?: string; value: string | number; onChange: (v: string) => void
  placeholder?: string; disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 bg-[#0d0e24] border border-[rgba(99,102,241,0.15)] rounded text-[#e2e8f0] text-sm placeholder:text-[#94a3b8]/40 focus:outline-none focus:border-[rgba(99,102,241,0.5)] disabled:opacity-50"
    />
  )
}

function ModalButtons({
  onCancel, onConfirm, confirmLabel, confirmClass,
}: {
  onCancel: () => void; onConfirm: () => void
  confirmLabel: string; confirmClass?: string
}) {
  return (
    <div className="flex gap-2 mt-5">
      <button
        onClick={onCancel}
        className="flex-1 py-2 rounded text-sm text-[#94a3b8] border border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.4)] hover:text-[#e2e8f0] transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className={confirmClass ?? 'flex-1 py-2 rounded text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors'}
      >
        {confirmLabel}
      </button>
    </div>
  )
}

// ─── Open Register Modal ──────────────────────────────────────────────────────

function OpenRegisterModal({
  regName, onClose,
}: {
  regName: string; onClose: () => void
}) {
  const [openingCash, setOpeningCash] = useState('')
  const [showDenom, setShowDenom] = useState(false)
  const [denom, setDenom] = useState<DenomBreakdown>(EMPTY_DENOM)

  return (
    <Modal title={`Open Register — ${regName}`} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Cashier">
          <Input2 value="Current User" onChange={() => {}} disabled />
        </Field>
        <Field label="Opening Cash ($)">
          <Input2
            type="number" value={openingCash}
            onChange={setOpeningCash} placeholder="0.00"
          />
        </Field>
        <div>
          <button
            onClick={() => setShowDenom(v => !v)}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d={showDenom ? 'M2 4l4 4 4-4' : 'M4 2l4 4-4 4'}
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            Denomination breakdown (optional)
          </button>
          {showDenom && (
            <div className="mt-3 p-3 rounded-lg border border-[rgba(99,102,241,0.15)] bg-[#0d0e24]">
              <DenomGrid denom={denom} setDenom={setDenom} showTotal />
            </div>
          )}
        </div>
      </div>
      <ModalButtons onCancel={onClose} onConfirm={onClose} confirmLabel="Open Register" />
    </Modal>
  )
}

// ─── Close Register Modal ─────────────────────────────────────────────────────

function CloseRegisterModal({
  regName, expectedCash, onClose,
}: {
  regName: string; expectedCash: number; onClose: () => void
}) {
  const [blindClose, setBlindClose] = useState(true)
  const [counted, setCounted] = useState('')
  const [showDenom, setShowDenom] = useState(false)
  const [denom, setDenom] = useState<DenomBreakdown>(EMPTY_DENOM)

  const countedNum = parseFloat(counted) || 0
  const overShort = countedNum - expectedCash

  return (
    <Modal title={`Close Register — ${regName}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94a3b8]">Blind Close</span>
          <button
            onClick={() => setBlindClose(v => !v)}
            className={[
              'w-10 h-5 rounded-full transition-colors relative',
              blindClose ? 'bg-indigo-600' : 'bg-zinc-700',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform',
                blindClose ? 'translate-x-5' : 'translate-x-0.5',
              ].join(' ')}
            />
          </button>
        </div>
        {!blindClose && (
          <div className="flex justify-between px-3 py-2.5 rounded-lg border border-[rgba(99,102,241,0.15)] bg-[#0d0e24]">
            <span className="text-xs text-[#94a3b8]">Expected Cash</span>
            <span className="text-sm font-semibold text-[#e2e8f0]">{fmt(expectedCash)}</span>
          </div>
        )}
        <Field label="Counted Cash ($)">
          <Input2
            type="number" value={counted}
            onChange={setCounted} placeholder="0.00"
          />
        </Field>
        {!blindClose && counted && (
          <div className="flex justify-between px-3 py-2 rounded border border-[rgba(99,102,241,0.15)]">
            <span className="text-xs text-[#94a3b8]">Over / Short</span>
            <span className={[
              'text-sm font-bold',
              overShort > 0 ? 'text-emerald-400' : overShort < 0 ? 'text-red-400' : 'text-[#94a3b8]',
            ].join(' ')}>
              {overShort >= 0 ? '+' : ''}{fmt(overShort)}
            </span>
          </div>
        )}
        <div>
          <button
            onClick={() => setShowDenom(v => !v)}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d={showDenom ? 'M2 4l4 4 4-4' : 'M4 2l4 4-4 4'}
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            Denomination breakdown
          </button>
          {showDenom && (
            <div className="mt-3 p-3 rounded-lg border border-[rgba(99,102,241,0.15)] bg-[#0d0e24]">
              <DenomGrid denom={denom} setDenom={setDenom} showTotal />
            </div>
          )}
        </div>
      </div>
      <ModalButtons
        onCancel={onClose} onConfirm={onClose}
        confirmLabel="Close Shift"
        confirmClass="flex-1 py-2 rounded text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors"
      />
    </Modal>
  )
}

// ─── Safe Drop Modal ──────────────────────────────────────────────────────────

function SafeDropModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('safe_drop')
  const [pin, setPin] = useState('')

  return (
    <Modal title="Safe Drop" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Amount ($)">
          <Input2 type="number" value={amount} onChange={setAmount} placeholder="0.00" />
        </Field>
        <Field label="Reason">
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-[#0d0e24] border border-[rgba(99,102,241,0.15)] rounded text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.5)]"
          >
            <option value="safe_drop">Safe Drop</option>
            <option value="bank_deposit">Bank Deposit</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Manager PIN">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/, ''))}
            placeholder="••••"
            className="w-full px-3 py-2 bg-[#0d0e24] border border-[rgba(99,102,241,0.15)] rounded text-[#e2e8f0] text-sm text-center tracking-[0.5em] focus:outline-none focus:border-[rgba(99,102,241,0.5)]"
          />
        </Field>
      </div>
      <ModalButtons onCancel={onClose} onConfirm={onClose} confirmLabel="Confirm Safe Drop" />
    </Modal>
  )
}

// ─── Paid In/Out Modal ────────────────────────────────────────────────────────

function PaidInOutModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'in' | 'out'>('in')
  const [amount, setAmount] = useState('')
  const [reasonText, setReasonText] = useState('')

  return (
    <Modal title="Paid In / Paid Out" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-[rgba(99,102,241,0.15)]">
          {(['in', 'out'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={[
                'flex-1 py-2 text-sm font-medium transition-colors',
                type === t
                  ? 'bg-indigo-600 text-white'
                  : 'text-[#94a3b8] hover:text-[#e2e8f0]',
              ].join(' ')}
            >
              Paid {t === 'in' ? 'In' : 'Out'}
            </button>
          ))}
        </div>
        <Field label="Amount ($)">
          <Input2 type="number" value={amount} onChange={setAmount} placeholder="0.00" />
        </Field>
        <Field label="Reason">
          <Input2 value={reasonText} onChange={setReasonText} placeholder="Enter reason…" />
        </Field>
      </div>
      <ModalButtons onCancel={onClose} onConfirm={onClose} confirmLabel="Confirm" />
    </Modal>
  )
}

// ─── Z-Report Modal ───────────────────────────────────────────────────────────

function ZReportModal({ onClose }: { onClose: () => void }) {
  const [counted, setCounted] = useState('')
  const expected = 1002.82
  const countedNum = parseFloat(counted) || 0
  const overShort = counted ? countedNum - expected : null

  return (
    <Modal title="Z-Report — Register 1 — Apr 22, 2026" onClose={onClose}>
      <div className="space-y-5">
        {/* Header */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ['Store', 'Main Street NovaPOS'],
            ['Register', 'Register 1'],
            ['Cashier', 'Alice Chen'],
            ['Date', 'Apr 22, 2026'],
            ['Shift Open', '8:00 AM'],
            ['Shift Close', '2:22 PM'],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-[#94a3b8]">{k}: </span>
              <span className="text-[#e2e8f0] font-medium">{v}</span>
            </div>
          ))}
        </div>

        {/* Sales Summary */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-2">Sales Summary</p>
          <table className="w-full text-xs">
            <tbody>
              {[
                ['Gross Sales', '$5,263.27', false],
                ['Returns', '-$89.99', false],
                ['Discounts', '-$234.50', false],
                ['Net Sales', '$4,938.78', true],
                ['Tax Collected', '$407.55', false],
                ['Total Collected', '$5,346.33', true],
              ].map(([label, val, bold]) => (
                <tr key={label as string} className="border-b border-[rgba(99,102,241,0.08)]">
                  <td className="py-1.5 text-[#94a3b8]">{label}</td>
                  <td className={[
                    'py-1.5 text-right',
                    bold ? 'text-[#e2e8f0] font-bold' : 'text-[#e2e8f0]',
                  ].join(' ')}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tender Breakdown */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-2">Tender Breakdown</p>
          <table className="w-full text-xs">
            <tbody>
              {[
                ['Cash', '$1,247.82'],
                ['Credit Card', '$3,422.51'],
                ['Debit Card', '$468.94'],
                ['Gift Card', '$124.00'],
                ['Store Credit', '$83.06'],
              ].map(([label, val]) => (
                <tr key={label} className="border-b border-[rgba(99,102,241,0.08)]">
                  <td className="py-1.5 text-[#94a3b8]">{label}</td>
                  <td className="py-1.5 text-right text-[#e2e8f0]">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cash Reconciliation */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-2">Cash Reconciliation</p>
          <table className="w-full text-xs">
            <tbody>
              {[
                ['Opening Cash', '$300.00'],
                ['Cash Sales', '+$1,247.82'],
                ['Cash Returns', '-$45.00'],
                ['Safe Drops', '-$500.00'],
                ['Paid In', '$0.00'],
                ['Paid Out', '$0.00'],
                ['Expected', '$1,002.82'],
              ].map(([label, val]) => (
                <tr key={label} className="border-b border-[rgba(99,102,241,0.08)]">
                  <td className="py-1.5 text-[#94a3b8]">{label}</td>
                  <td className={[
                    'py-1.5 text-right',
                    label === 'Expected' ? 'text-indigo-400 font-bold' : 'text-[#e2e8f0]',
                  ].join(' ')}>{val}</td>
                </tr>
              ))}
              <tr className="border-b border-[rgba(99,102,241,0.08)]">
                <td className="py-1.5 text-[#94a3b8]">Counted Cash</td>
                <td className="py-1.5 text-right">
                  <input
                    type="number"
                    value={counted}
                    onChange={e => setCounted(e.target.value)}
                    placeholder="0.00"
                    className="w-24 px-2 py-0.5 bg-[#0d0e24] border border-[rgba(99,102,241,0.3)] rounded text-[#e2e8f0] text-xs text-right focus:outline-none"
                  />
                </td>
              </tr>
              {overShort !== null && (
                <tr>
                  <td className="py-1.5 text-[#94a3b8]">Over / Short</td>
                  <td className={[
                    'py-1.5 text-right font-bold',
                    overShort > 0 ? 'text-emerald-400' : overShort < 0 ? 'text-red-400' : 'text-[#94a3b8]',
                  ].join(' ')}>
                    {overShort >= 0 ? '+' : ''}{fmt(overShort)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Transaction Counts */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-2">Transaction Counts</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ['Total Transactions', '47'],
              ['Returns', '3'],
              ['Voids', '1'],
              ['No-Sale Opens', '2'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-3 py-2 rounded bg-[#0d0e24] border border-[rgba(99,102,241,0.08)]">
                <span className="text-[#94a3b8]">{k}</span>
                <span className="text-[#e2e8f0] font-bold">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button className="flex-1 py-2 rounded text-xs font-medium text-[#94a3b8] border border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.4)] hover:text-[#e2e8f0] transition-colors">
            Print
          </button>
          <button className="flex-1 py-2 rounded text-xs font-medium text-[#94a3b8] border border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.4)] hover:text-[#e2e8f0] transition-colors">
            Export PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Register Card ────────────────────────────────────────────────────────────

function RegisterCard({
  reg,
  onOpenRegister,
  onCloseRegister,
  onSafeDrop,
  onPaidInOut,
}: {
  reg: Register
  onOpenRegister: (reg: Register) => void
  onCloseRegister: (reg: Register) => void
  onSafeDrop: () => void
  onPaidInOut: () => void
}) {
  const isOpen = reg.status === 'OPEN'

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{
        background: '#16213e',
        borderColor: isOpen ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.1)',
        width: '100%',
        maxWidth: 320,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[#e2e8f0] font-semibold text-sm">{reg.name}</span>
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{
            background: isOpen ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.1)',
            color: isOpen ? '#4ade80' : '#94a3b8',
            border: `1px solid ${isOpen ? 'rgba(34,197,94,0.3)' : 'rgba(148,163,184,0.2)'}`,
          }}
        >
          {isOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      {/* Body */}
      {isOpen ? (
        <div className="space-y-1.5 text-xs">
          <Row label="Cashier" value={reg.cashier!} />
          <Row label="Shift Opened" value={reg.shiftOpened!} />
          <Row label="Cash Sales Today" value={fmt(reg.cashSalesToday!)} highlight />
          <Row label="Transactions" value={String(reg.transactionCount!)} />
        </div>
      ) : (
        <div className="space-y-1.5 text-xs">
          <Row label="Last Closed" value={reg.lastClosed!} />
          <Row label="Last Cashier" value={reg.lastCashier!} />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {isOpen ? (
          <>
            <SmBtn label="View Shift" />
            <SmBtn label="Safe Drop" onClick={onSafeDrop} />
            <SmBtn label="X Report" />
            <SmBtn label="Paid In/Out" onClick={onPaidInOut} />
            <SmBtn
              label="Close Register"
              danger
              onClick={() => onCloseRegister(reg)}
            />
          </>
        ) : (
          <SmBtn
            label="Open Register"
            primary
            onClick={() => onOpenRegister(reg)}
          />
        )}
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#94a3b8]">{label}</span>
      <span className={highlight ? 'text-indigo-300 font-semibold' : 'text-[#e2e8f0]'}>{value}</span>
    </div>
  )
}

function SmBtn({
  label, onClick, primary, danger,
}: {
  label: string; onClick?: () => void; primary?: boolean; danger?: boolean
}) {
  let cls = 'px-2.5 py-1 rounded text-[11px] font-medium transition-colors border '
  if (primary) {
    cls += 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
  } else if (danger) {
    cls += 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-500/20 hover:border-red-500/40'
  } else {
    cls += 'bg-[#0d0e24] hover:bg-[rgba(99,102,241,0.1)] text-[#94a3b8] hover:text-[#e2e8f0] border-[rgba(99,102,241,0.15)]'
  }
  return (
    <button onClick={onClick} className={cls}>
      {label}
    </button>
  )
}

// ─── KPI Tile ─────────────────────────────────────────────────────────────────

function KpiTile({
  label, value, color,
}: {
  label: string; value: string | number; color?: string
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-xl px-5 py-4 border"
      style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">
        {label}
      </span>
      <span
        className="text-2xl font-bold"
        style={{ color: color ?? '#e2e8f0' }}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ModalType = 'open' | 'close' | 'safedrop' | 'paidinout' | 'zreport' | null

export default function RegisterManagementPage() {
  const [registers, setRegisters] = useState<Register[]>(MOCK_REGISTERS)
  const [drawerEvents] = useState<DrawerEvent[]>(MOCK_DRAWER_EVENTS)
  const [modal, setModal] = useState<ModalType>(null)
  const [activeReg, setActiveReg] = useState<Register | null>(null)

  // Fetch from API (replaces mock on success)
  useEffect(() => {
    fetch('/api/pos/register-management')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.registers) setRegisters(d.registers)
      })
      .catch(() => {})
  }, [])

  const openCount   = registers.filter(r => r.status === 'OPEN').length
  const closedCount = registers.filter(r => r.status === 'CLOSED').length

  function closeModal() { setModal(null); setActiveReg(null) }

  const eventTypeColor: Record<string, string> = {
    OPEN_SHIFT:   'text-emerald-400',
    CLOSE_SHIFT:  'text-red-400',
    SAFE_DROP:    'text-indigo-400',
    OPEN_SALE:    'text-[#94a3b8]',
    OPEN_NO_SALE: 'text-amber-400',
    PAID_IN:      'text-sky-400',
    PAID_OUT:     'text-orange-400',
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24' }}>
      <TopBar
        title="Register Management"
        breadcrumb={[
          { label: 'POS', href: '/pos' },
          { label: 'Register Management', href: '/pos/register-management' },
        ]}
        actions={
          <>
            <button
              onClick={() => setModal('zreport')}
              className="px-3 py-1.5 rounded text-xs font-medium text-[#94a3b8] border border-[rgba(99,102,241,0.2)] hover:border-[rgba(99,102,241,0.4)] hover:text-[#e2e8f0] transition-colors"
            >
              Z Report
            </button>
            <button className="px-3 py-1.5 rounded text-xs font-medium text-[#94a3b8] border border-[rgba(99,102,241,0.2)] hover:border-[rgba(99,102,241,0.4)] hover:text-[#e2e8f0] transition-colors">
              X Report
            </button>
            <button className="px-3 py-1.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">
              Open Register
            </button>
          </>
        }
      />

      <div className="flex-1 px-6 py-6 space-y-8 max-w-7xl mx-auto w-full">

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiTile label="Registers" value={registers.length} />
          <KpiTile label="Open" value={openCount} color="#4ade80" />
          <KpiTile label="Closed" value={closedCount} color="#94a3b8" />
          <KpiTile label="Open Shifts Today" value={6} color="#818cf8" />
        </div>

        {/* Registers Grid */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8] mb-4">
            Registers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {registers.map(reg => (
              <RegisterCard
                key={reg.id}
                reg={reg}
                onOpenRegister={r => { setActiveReg(r); setModal('open') }}
                onCloseRegister={r => { setActiveReg(r); setModal('close') }}
                onSafeDrop={() => setModal('safedrop')}
                onPaidInOut={() => setModal('paidinout')}
              />
            ))}
          </div>
        </section>

        {/* Shift Summary FastTab — Register 1 */}
        <section>
          <details
            open
            className="rounded-xl border overflow-hidden"
            style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.2)' }}
          >
            <summary
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none"
              style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}
            >
              <span className="text-[#e2e8f0] font-semibold text-sm">
                Current Shift — Register 1
              </span>
              <svg
                className="w-4 h-4 text-[#94a3b8] transition-transform details-arrow"
                viewBox="0 0 16 16" fill="none"
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>

            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: info */}
                <div className="space-y-2 text-sm">
                  {[
                    ['Cashier', 'Alice Chen'],
                    ['Opened', '8:00 AM'],
                    ['Duration', '6h 22m'],
                    ['Opening Cash', '$300.00'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-[rgba(99,102,241,0.08)] pb-1.5">
                      <span className="text-[#94a3b8]">{k}</span>
                      <span className="text-[#e2e8f0] font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                {/* Right: financials */}
                <div className="space-y-2 text-sm">
                  {[
                    ['Cash Sales',     '+$1,247.82', 'text-emerald-400'],
                    ['Card Sales',     '+$3,891.45', 'text-emerald-400'],
                    ['Gift Card Sales', '+$124.00',  'text-emerald-400'],
                    ['Refunds',        '-$89.99',    'text-red-400'],
                    ['Safe Drops',     '-$500.00',   'text-red-400'],
                    ['Paid In',        '$0.00',      'text-[#e2e8f0]'],
                    ['Paid Out',       '$0.00',      'text-[#e2e8f0]'],
                  ].map(([k, v, c]) => (
                    <div key={k} className="flex justify-between border-b border-[rgba(99,102,241,0.08)] pb-1.5">
                      <span className="text-[#94a3b8]">{k}</span>
                      <span className={`font-medium ${c}`}>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1">
                    <span className="text-[#94a3b8] font-semibold">Expected Cash</span>
                    <span className="text-indigo-300 font-bold">$1,047.82</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94a3b8]">Transaction Count</span>
                    <span className="text-[#e2e8f0] font-bold">47</span>
                  </div>
                </div>
              </div>
            </div>
          </details>
        </section>

        {/* Drawer Events Log */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8] mb-4">
            Drawer Events — Today
          </h2>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: 'rgba(99,102,241,0.15)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                    {['Time', 'Register', 'Cashier', 'Event Type', 'Amount', 'Reason', 'Auth By'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {drawerEvents.map((ev, i) => (
                    <tr
                      key={i}
                      className="border-b transition-colors hover:bg-[rgba(99,102,241,0.04)]"
                      style={{
                        borderColor: 'rgba(99,102,241,0.08)',
                        background: '#16213e',
                      }}
                    >
                      <td className="px-4 py-2.5 text-[#94a3b8]">{ev.time}</td>
                      <td className="px-4 py-2.5 text-[#e2e8f0] font-mono">{ev.register}</td>
                      <td className="px-4 py-2.5 text-[#e2e8f0]">{ev.cashier}</td>
                      <td className={`px-4 py-2.5 font-semibold ${eventTypeColor[ev.eventType] ?? 'text-[#e2e8f0]'}`}>
                        {ev.eventType}
                      </td>
                      <td className="px-4 py-2.5 text-[#e2e8f0]">
                        {ev.amount !== null ? fmt(Math.abs(ev.amount)) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-[#94a3b8]">{ev.reason}</td>
                      <td className="px-4 py-2.5 text-[#94a3b8]">{ev.authBy || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      {modal === 'open' && activeReg && (
        <OpenRegisterModal regName={activeReg.name} onClose={closeModal} />
      )}
      {modal === 'close' && activeReg && (
        <CloseRegisterModal
          regName={activeReg.name}
          expectedCash={1047.82}
          onClose={closeModal}
        />
      )}
      {modal === 'safedrop' && <SafeDropModal onClose={closeModal} />}
      {modal === 'paidinout' && <PaidInOutModal onClose={closeModal} />}
      {modal === 'zreport' && <ZReportModal onClose={closeModal} />}
    </div>
  )
}
