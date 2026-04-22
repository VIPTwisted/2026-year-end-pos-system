'use client'

import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Calculator, Download, CheckCircle, XCircle, X } from 'lucide-react'

interface EmployeeSummary {
  id: string
  firstName: string
  lastName: string
  position: string
  department: string | null
  hourlyRate: number | null
}

interface PayrollEntry {
  id: string
  periodId: string
  employeeId: string
  payType: string
  regularHours: number
  overtimeHours: number
  hourlyRate: number
  salary: number
  commissions: number
  bonuses: number
  grossPay: number
  federalTax: number
  stateTax: number
  socialSecurity: number
  medicare: number
  otherDeductions: number
  netPay: number
  status: string
  notes: string | null
  employee: EmployeeSummary
}

interface PayrollPeriod {
  id: string
  name: string
  startDate: string
  endDate: string
  payDate: string
  status: string
  totalGross: number
  totalNet: number
  totalTax: number
  notes: string | null
  entries: PayrollEntry[]
}

type ModalType = 'addEmployee' | 'close' | null

interface AddEmployeeForm {
  employeeId: string
  payType: string
  regularHours: string
  overtimeHours: string
  hourlyRate: string
  salary: string
  commissions: string
  bonuses: string
  otherDeductions: string
  notes: string
}

const defaultAddForm: AddEmployeeForm = {
  employeeId: '',
  payType: 'hourly',
  regularHours: '80',
  overtimeHours: '0',
  hourlyRate: '',
  salary: '',
  commissions: '0',
  bonuses: '0',
  otherDeductions: '0',
  notes: '',
}

export default function PayrollPeriodPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [period, setPeriod] = useState<PayrollPeriod | null>(null)
  const [allEmployees, setAllEmployees] = useState<EmployeeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [modal, setModal] = useState<ModalType>(null)
  const [addForm, setAddForm] = useState<AddEmployeeForm>(defaultAddForm)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadPeriod = useCallback(async () => {
    try {
      const res = await fetch(`/api/payroll/periods/${id}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setPeriod(data)
    } catch {
      notify('Failed to load payroll period', 'err')
    } finally {
      setLoading(false)
    }
  }, [id])

  const loadEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/hr/employees?limit=200')
      if (!res.ok) return
      const data = await res.json()
      const list: EmployeeSummary[] = Array.isArray(data) ? data : (data.employees ?? data.items ?? [])
      setAllEmployees(list)
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    loadPeriod()
    loadEmployees()
  }, [loadPeriod, loadEmployees])

  const availableEmployees = allEmployees.filter(
    (emp) => !period?.entries.some((e) => e.employeeId === emp.id)
  )

  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAddForm((prev) => {
      const next = { ...prev, [name]: value }
      // Auto-fill hourly rate from employee
      if (name === 'employeeId') {
        const emp = allEmployees.find((em) => em.id === value)
        if (emp?.hourlyRate) {
          next.hourlyRate = String(emp.hourlyRate)
        }
      }
      return next
    })
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.employeeId) {
      notify('Select an employee', 'err')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/payroll/periods/${id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: addForm.employeeId,
          payType: addForm.payType,
          regularHours: Number(addForm.regularHours),
          overtimeHours: Number(addForm.overtimeHours),
          hourlyRate: Number(addForm.hourlyRate),
          salary: Number(addForm.salary),
          commissions: Number(addForm.commissions),
          bonuses: Number(addForm.bonuses),
          otherDeductions: Number(addForm.otherDeductions),
          notes: addForm.notes || undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to add entry')
      }
      notify('Employee added to payroll')
      setModal(null)
      setAddForm(defaultAddForm)
      await loadPeriod()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to add entry', 'err')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCalculate = async () => {
    setCalculating(true)
    try {
      const res = await fetch(`/api/payroll/periods/${id}/calculate`, { method: 'POST' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Calculation failed')
      }
      const result = await res.json()
      notify(`Calculated ${result.entriesCalculated} entries — Gross: ${formatCurrency(result.totalGross)}`)
      await loadPeriod()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Calculation failed', 'err')
    } finally {
      setCalculating(false)
    }
  }

  const handleExport = () => {
    window.open(`/api/payroll/periods/${id}/export`, '_blank')
  }

  const handleClosePeriod = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/payroll/periods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to close period')
      }
      notify('Period marked as Paid')
      setModal(null)
      await loadPeriod()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to close period', 'err')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVoidPeriod = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/payroll/periods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'void' }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to void period')
      }
      notify('Period voided')
      setModal(null)
      await loadPeriod()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to void period', 'err')
    } finally {
      setSubmitting(false)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400">Open</span>
      case 'processing':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400">Processing</span>
      case 'paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400">Paid</span>
      case 'void':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400">Void</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-400">{status}</span>
    }
  }

  const isEditable = period?.status === 'open' || period?.status === 'processing'

  const inputClass = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500'

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title={period?.name ?? 'Payroll Period'}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Payroll', href: '/payroll' },
        ]}
        showBack
        actions={
          period && isEditable ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModal('addEmployee')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-[13px] font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Employee
              </button>
              <button
                onClick={handleCalculate}
                disabled={calculating || (period?.entries.length ?? 0) === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-200 text-[13px] font-medium transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                {calculating ? 'Calculating...' : 'Calculate All'}
              </button>
              <button
                onClick={handleExport}
                disabled={(period?.entries.length ?? 0) === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-200 text-[13px] font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={() => setModal('close')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Close Period
              </button>
            </div>
          ) : period ? (
            <button
              onClick={handleExport}
              disabled={(period?.entries.length ?? 0) === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-200 text-[13px] font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          ) : undefined
        }
      />

      {toast && (
        <div
          className={`fixed top-16 right-4 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${
            toast.type === 'ok'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !period && (
          <div className="text-center py-20 text-zinc-500">
            Period not found.{' '}
            <button onClick={() => router.push('/payroll')} className="text-blue-400 hover:underline">
              Back to Payroll
            </button>
          </div>
        )}

        {!loading && period && (
          <>
            {/* Period header */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-xl font-bold text-zinc-100">{period.name}</h1>
                    {statusBadge(period.status)}
                  </div>
                  <p className="text-sm text-zinc-400">
                    {new Date(period.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {' — '}
                    {new Date(period.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    <span className="mx-2 text-zinc-700">·</span>
                    Pay Date:{' '}
                    <span className="text-zinc-200">
                      {new Date(period.payDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </p>
                  {period.notes && (
                    <p className="text-sm text-zinc-500 mt-1">{period.notes}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Gross Pay</p>
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">{formatCurrency(period.totalGross)}</p>
                <p className="text-[11px] text-zinc-500 mt-1">{period.entries.length} employees</p>
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Taxes & Deductions</p>
                <p className="text-2xl font-bold text-red-400 tabular-nums">{formatCurrency(period.totalTax)}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Fed + State + SS + Medicare</p>
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Net Pay</p>
                <p className="text-2xl font-bold text-emerald-400 tabular-nums">{formatCurrency(period.totalNet)}</p>
                <p className="text-[11px] text-zinc-500 mt-1">After all deductions</p>
              </div>
            </div>

            {/* Entries table */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-zinc-100">
                  Payroll Entries
                  <span className="ml-2 text-zinc-500 font-normal text-[12px]">({period.entries.length} employees)</span>
                </h2>
              </div>

              {period.entries.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-[13px] text-zinc-500 mb-3">No employees added to this period yet.</p>
                  {isEditable && (
                    <button
                      onClick={() => setModal('addEmployee')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Employee
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] min-w-[1100px]">
                    <thead>
                      <tr className="border-b border-zinc-800/50">
                        <th className="text-left px-5 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Employee</th>
                        <th className="text-center px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Type</th>
                        <th className="text-right px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Reg Hrs</th>
                        <th className="text-right px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">OT Hrs</th>
                        <th className="text-right px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Rate / Salary</th>
                        <th className="text-right px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Commission</th>
                        <th className="text-right px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Bonus</th>
                        <th className="text-right px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Gross</th>
                        <th className="text-right px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Deductions</th>
                        <th className="text-right px-5 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Net Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {period.entries.map((entry) => {
                        const totalDed = entry.federalTax + entry.stateTax + entry.socialSecurity + entry.medicare + entry.otherDeductions
                        return (
                          <tr key={entry.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                            <td className="px-5 py-3">
                              <div className="font-medium text-zinc-100">
                                {entry.employee.firstName} {entry.employee.lastName}
                              </div>
                              <div className="text-[11px] text-zinc-500">{entry.employee.position}</div>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                                entry.payType === 'salary'
                                  ? 'bg-purple-500/10 text-purple-400'
                                  : 'bg-zinc-700 text-zinc-400'
                              }`}>
                                {entry.payType}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right text-zinc-400 tabular-nums">
                              {entry.payType === 'hourly' ? entry.regularHours.toFixed(1) : '—'}
                            </td>
                            <td className="px-3 py-3 text-right text-zinc-400 tabular-nums">
                              {entry.payType === 'hourly' ? entry.overtimeHours.toFixed(1) : '—'}
                            </td>
                            <td className="px-3 py-3 text-right text-zinc-300 tabular-nums font-mono text-[12px]">
                              {entry.payType === 'hourly'
                                ? `${formatCurrency(entry.hourlyRate)}/hr`
                                : formatCurrency(entry.salary)}
                            </td>
                            <td className="px-3 py-3 text-right text-zinc-400 tabular-nums">
                              {formatCurrency(entry.commissions)}
                            </td>
                            <td className="px-3 py-3 text-right text-zinc-400 tabular-nums">
                              {formatCurrency(entry.bonuses)}
                            </td>
                            <td className="px-3 py-3 text-right font-medium text-zinc-200 tabular-nums">
                              {formatCurrency(entry.grossPay)}
                            </td>
                            <td className="px-3 py-3 text-right text-red-400 tabular-nums">
                              {formatCurrency(totalDed)}
                            </td>
                            <td className="px-5 py-3 text-right font-bold text-emerald-400 tabular-nums">
                              {formatCurrency(entry.netPay)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Add Employee Modal ───────────────────────────────── */}
      {modal === 'addEmployee' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-700/60 rounded-lg w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
              <h3 className="text-[14px] font-semibold text-zinc-100">Add Employee to Period</h3>
              <button
                onClick={() => { setModal(null); setAddForm(defaultAddForm) }}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Employee <span className="text-red-400">*</span>
                </label>
                <select
                  name="employeeId"
                  value={addForm.employeeId}
                  onChange={handleAddFormChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select employee...</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} — {emp.position}
                    </option>
                  ))}
                </select>
                {availableEmployees.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1">All active employees are already in this period.</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Pay Type</label>
                <select
                  name="payType"
                  value={addForm.payType}
                  onChange={handleAddFormChange}
                  className={inputClass}
                >
                  <option value="hourly">Hourly</option>
                  <option value="salary">Salary</option>
                </select>
              </div>

              {addForm.payType === 'hourly' ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Regular Hrs</label>
                    <input
                      type="number"
                      name="regularHours"
                      value={addForm.regularHours}
                      onChange={handleAddFormChange}
                      min="0"
                      step="0.5"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">OT Hrs</label>
                    <input
                      type="number"
                      name="overtimeHours"
                      value={addForm.overtimeHours}
                      onChange={handleAddFormChange}
                      min="0"
                      step="0.5"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Hourly Rate</label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={addForm.hourlyRate}
                      onChange={handleAddFormChange}
                      min="0"
                      step="0.01"
                      className={inputClass}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Salary (Period)</label>
                  <input
                    type="number"
                    name="salary"
                    value={addForm.salary}
                    onChange={handleAddFormChange}
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Commissions</label>
                  <input
                    type="number"
                    name="commissions"
                    value={addForm.commissions}
                    onChange={handleAddFormChange}
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Bonuses</label>
                  <input
                    type="number"
                    name="bonuses"
                    value={addForm.bonuses}
                    onChange={handleAddFormChange}
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Other Ded.</label>
                  <input
                    type="number"
                    name="otherDeductions"
                    value={addForm.otherDeductions}
                    onChange={handleAddFormChange}
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Notes</label>
                <input
                  type="text"
                  name="notes"
                  value={addForm.notes}
                  onChange={handleAddFormChange}
                  placeholder="Optional..."
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting || availableEmployees.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
                >
                  {submitting ? 'Adding...' : 'Add to Period'}
                </button>
                <button
                  type="button"
                  onClick={() => { setModal(null); setAddForm(defaultAddForm) }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Close Period Confirmation Modal ─────────────────── */}
      {modal === 'close' && period && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-700/60 rounded-lg w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
              <h3 className="text-[14px] font-semibold text-zinc-100">Close Payroll Period</h3>
              <button
                onClick={() => setModal(null)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-zinc-300">
                You are about to mark <span className="font-semibold text-zinc-100">{period.name}</span> as{' '}
                <span className="text-emerald-400 font-semibold">Paid</span>. This indicates all employees have been paid.
              </p>

              <div className="bg-zinc-900/60 rounded-lg p-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Employees</span>
                  <span className="text-zinc-200">{period.entries.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Total Gross</span>
                  <span className="text-zinc-200 tabular-nums">{formatCurrency(period.totalGross)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Total Deductions</span>
                  <span className="text-red-400 tabular-nums">{formatCurrency(period.totalTax)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1 border-t border-zinc-800/50">
                  <span className="text-zinc-400">Total Net Pay</span>
                  <span className="text-emerald-400 tabular-nums">{formatCurrency(period.totalNet)}</span>
                </div>
              </div>

              <p className="text-[12px] text-zinc-500">
                You can also void this period if it should not be processed.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleClosePeriod}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? 'Processing...' : 'Mark as Paid'}
                </button>
                <button
                  onClick={handleVoidPeriod}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 text-sm font-medium rounded transition-colors inline-flex items-center justify-center gap-1.5 border border-red-500/20"
                >
                  <XCircle className="w-4 h-4" />
                  Void Period
                </button>
                <button
                  onClick={() => setModal(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
