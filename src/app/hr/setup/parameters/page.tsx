'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Save, ArrowLeft, Settings } from 'lucide-react'

// ─── Style constants ──────────────────────────────────────────────────────────
const INPUT = 'w-full rounded-md bg-zinc-900/60 border border-zinc-800/50 text-zinc-100 text-[12px] px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60'
const SELECT = 'w-full rounded-md bg-zinc-900/60 border border-zinc-800/50 text-zinc-100 text-[12px] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/60'
const LABEL = 'block text-[10px] uppercase tracking-wide text-zinc-500 mb-1'
const CHECK_ROW = 'flex items-center gap-2.5'
const CHECK = 'w-4 h-4 rounded border-zinc-700 bg-zinc-900/60 accent-indigo-500 cursor-pointer'
const CHECK_LABEL = 'text-[12px] text-zinc-300'
const FASTTAB = 'bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden'
const FASTTAB_SUMMARY = 'px-5 py-3.5 flex items-center gap-2 cursor-pointer select-none list-none text-[12px] font-semibold text-zinc-200 hover:text-zinc-100 transition-colors [&::-webkit-details-marker]:hidden'
const FASTTAB_BODY = 'px-5 pb-5 pt-1 border-t border-zinc-800/40'
const SECTION_LABEL = 'text-[10px] uppercase tracking-widest text-indigo-400/80 font-semibold mb-3'

// ─── Types ────────────────────────────────────────────────────────────────────
type GeneralSettings = {
  // Identification
  employeeIdPrefix: string
  employeeIdSequenceLength: number
  defaultDepartment: string
  // Payroll
  payrollProvider: string
  payFrequency: string
  // Time & Attendance
  defaultWorkSchedule: string
  overtimeThresholdHours: number
  // Self Service
  allowSelfServiceTimeOff: boolean
  allowAddressContactUpdates: boolean
  // Notifications
  enableOnboardingNotifications: boolean
  enableProbationReminders: boolean
  enableAnniversaryAlerts: boolean
  // Affordable Care Act
  employerSelfInsuredHealth: string
  // Injury & Illness
  keepCaseIncidents: boolean
  injuryIllnessDays: number
  // Hire Worker
  defaultIdentificationNumber: string
  defaultEmploymentCategoryEmployee: string
  defaultEmploymentCategoryContractor: string
  defaultEmploymentType: string
  // Recent Hires
  recentHiresPeriod: number
  recentHiresUnit: string
  // View Exiting Workers
  viewExitingWorkersPeriod: number
  viewExitingWorkersUnit: string
  viewExitingWorkers: string
  // Exited Workers
  exitedWorkersPeriod: number
  exitedWorkersPeriodUnit: string
  // Termination Defaults
  allowRehire: boolean
  // Payment Methods
  disableElectronicPaymentValidation: boolean
  disableBankAccountRouting: boolean
  // Expiring Records
  expiringRecordsDays: number
  expiredRecordsDays: number
  // Address Change
  addressChangeDays: number
}

type FmlaSettings = {
  // Eligibility Requirements
  hoursWorked: number
  lengthOfEmploymentUnit: string
  lengthOfEmploymentValue: number
  eligibilityDatePriority: string
  // Entitlement
  standardHours: number
  militaryHours: number
  leaveCalendar: string
  // Tracking
  autoDesignateFmla: boolean
  requireMedicalCertification: boolean
  certificationDeadlineDays: number
  // Intermittent
  allowIntermittentFmla: boolean
  intermittentMinimumHours: number
}

type LeaveSettings = {
  leaveYearType: string
  defaultLeaveType: string
  carryoverLimit: number
  maxAccrualBalance: number
  allowNegativeBalance: boolean
}

type BenefitsSettings = {
  openEnrollmentDays: number
  waitingPeriodDays: number
  dependentCoverageAllowed: boolean
  cobraNotificationDays: number
}

type PerformanceSettings = {
  reviewCycleDays: number
  defaultRatingScale: string
  requireGoalSetting: boolean
  enableContinuousFeedback: boolean
  probationReviewDays: number
}

type AllSettings = {
  general: GeneralSettings
  fmla: FmlaSettings
  leave: LeaveSettings
  benefits: BenefitsSettings
  performance: PerformanceSettings
}

const DEFAULT: AllSettings = {
  general: {
    employeeIdPrefix: 'EMP',
    employeeIdSequenceLength: 6,
    defaultDepartment: '',
    payrollProvider: 'None',
    payFrequency: 'Bi-weekly',
    defaultWorkSchedule: 'Standard 40h',
    overtimeThresholdHours: 40,
    allowSelfServiceTimeOff: true,
    allowAddressContactUpdates: true,
    enableOnboardingNotifications: true,
    enableProbationReminders: true,
    enableAnniversaryAlerts: true,
    employerSelfInsuredHealth: 'No',
    keepCaseIncidents: true,
    injuryIllnessDays: 0,
    defaultIdentificationNumber: 'SSN',
    defaultEmploymentCategoryEmployee: '',
    defaultEmploymentCategoryContractor: '',
    defaultEmploymentType: '',
    recentHiresPeriod: 5,
    recentHiresUnit: 'Days',
    viewExitingWorkersPeriod: 30,
    viewExitingWorkersUnit: 'Days',
    viewExitingWorkers: 'Extended reports',
    exitedWorkersPeriod: 300,
    exitedWorkersPeriodUnit: 'Days',
    allowRehire: true,
    disableElectronicPaymentValidation: false,
    disableBankAccountRouting: false,
    expiringRecordsDays: 45,
    expiredRecordsDays: 45,
    addressChangeDays: 90,
  },
  fmla: {
    hoursWorked: 1250,
    lengthOfEmploymentUnit: 'Months',
    lengthOfEmploymentValue: 12,
    eligibilityDatePriority: 'Seniority date',
    standardHours: 480,
    militaryHours: 1040,
    leaveCalendar: 'Calendar year',
    autoDesignateFmla: true,
    requireMedicalCertification: true,
    certificationDeadlineDays: 15,
    allowIntermittentFmla: true,
    intermittentMinimumHours: 1,
  },
  leave: {
    leaveYearType: 'Rolling 12 months',
    defaultLeaveType: 'PTO',
    carryoverLimit: 40,
    maxAccrualBalance: 120,
    allowNegativeBalance: false,
  },
  benefits: {
    openEnrollmentDays: 30,
    waitingPeriodDays: 90,
    dependentCoverageAllowed: true,
    cobraNotificationDays: 14,
  },
  performance: {
    reviewCycleDays: 365,
    defaultRatingScale: '1-5',
    requireGoalSetting: true,
    enableContinuousFeedback: false,
    probationReviewDays: 90,
  },
}

type TabId = 'general' | 'fmla' | 'leave' | 'benefits' | 'performance'

const TABS: { id: TabId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'fmla', label: 'FMLA' },
  { id: 'leave', label: 'Leave' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'performance', label: 'Performance' },
]

export default function HRParametersPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general')
  const [settings, setSettings] = useState<AllSettings>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hr/setup/parameters')
      const data = await res.json()
      if (data && typeof data === 'object' && data.general) {
        setSettings(data as AllSettings)
      }
    } catch {
      // Use defaults silently
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function setG<K extends keyof GeneralSettings>(key: K, val: GeneralSettings[K]) {
    setSettings(s => ({ ...s, general: { ...s.general, [key]: val } }))
  }
  function setF<K extends keyof FmlaSettings>(key: K, val: FmlaSettings[K]) {
    setSettings(s => ({ ...s, fmla: { ...s.fmla, [key]: val } }))
  }
  function setL<K extends keyof LeaveSettings>(key: K, val: LeaveSettings[K]) {
    setSettings(s => ({ ...s, leave: { ...s.leave, [key]: val } }))
  }
  function setB<K extends keyof BenefitsSettings>(key: K, val: BenefitsSettings[K]) {
    setSettings(s => ({ ...s, benefits: { ...s.benefits, [key]: val } }))
  }
  function setP<K extends keyof PerformanceSettings>(key: K, val: PerformanceSettings[K]) {
    setSettings(s => ({ ...s, performance: { ...s.performance, [key]: val } }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/hr/setup/parameters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Failed to save')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const g = settings.general
  const f = settings.fmla
  const lv = settings.leave
  const bn = settings.benefits
  const pf = settings.performance

  return (
    <>
      <TopBar title="Human Resources Parameters" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 max-w-5xl space-y-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link href="/hr/employees" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Human Resources
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-[12px] text-zinc-500">Setup</span>
            <span className="text-zinc-700">/</span>
            <span className="text-[12px] text-zinc-400">Parameters</span>
          </div>

          {/* Header + Ribbon */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">HR Setup</p>
              <h2 className="text-[20px] font-semibold text-zinc-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                Human resources parameters
              </h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Configure global HR defaults and policy settings</p>
            </div>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="text-[11px] text-emerald-400 font-medium">Saved</span>
              )}
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-900/30 border border-red-700/50 px-4 py-3 text-[12px] text-red-400">{error}</div>
          )}

          {/* Tab strip */}
          <div className="flex gap-0 border-b border-zinc-800/60">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={[
                  'px-5 py-2.5 text-[12px] font-medium transition-colors border-b-2 -mb-px',
                  activeTab === t.id
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── GENERAL TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'general' && !loading && (
            <div className="space-y-3">

              {/* Affordable Care Act */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>AFFORDABLE CARE ACT</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Employer sponsored self-insured health</label>
                      <select value={g.employerSelfInsuredHealth} onChange={e => setG('employerSelfInsuredHealth', e.target.value)} className={SELECT}>
                        <option>No</option>
                        <option>Yes</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>

              {/* Injury and Illness */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>INJURY AND ILLNESS</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className={CHECK_ROW}>
                        <input type="checkbox" id="keepCaseIncidents" checked={g.keepCaseIncidents} onChange={e => setG('keepCaseIncidents', e.target.checked)} className={CHECK} />
                        <label htmlFor="keepCaseIncidents" className={CHECK_LABEL}>Keep case incidents</label>
                      </div>
                      <div>
                        <label className={LABEL}>Number of days</label>
                        <input type="number" value={g.injuryIllnessDays} onChange={e => setG('injuryIllnessDays', Number(e.target.value))} className={INPUT} />
                      </div>
                    </div>
                  </div>
                </div>
              </details>

              {/* Hire Worker */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>HIRE WORKER</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={LABEL}>Default identification number</label>
                      <select value={g.defaultIdentificationNumber} onChange={e => setG('defaultIdentificationNumber', e.target.value)} className={SELECT}>
                        <option>SSN</option>
                        <option>EIN</option>
                        <option>ITIN</option>
                        <option>Passport</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Default employment category (employee)</label>
                      <input value={g.defaultEmploymentCategoryEmployee} onChange={e => setG('defaultEmploymentCategoryEmployee', e.target.value)} className={INPUT} placeholder="Full-time" />
                    </div>
                    <div>
                      <label className={LABEL}>Default employment category (contractor)</label>
                      <input value={g.defaultEmploymentCategoryContractor} onChange={e => setG('defaultEmploymentCategoryContractor', e.target.value)} className={INPUT} placeholder="Part-time" />
                    </div>
                    <div>
                      <label className={LABEL}>Default employment type</label>
                      <select value={g.defaultEmploymentType} onChange={e => setG('defaultEmploymentType', e.target.value)} className={SELECT}>
                        <option value="">— Select —</option>
                        <option>Regular</option>
                        <option>Temporary</option>
                        <option>Seasonal</option>
                        <option>Intern</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>

              {/* Identification */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>IDENTIFICATION</summary>
                <div className={FASTTAB_BODY}>
                  <p className={SECTION_LABEL}>Employee ID Format</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={LABEL}>Prefix</label>
                      <input value={g.employeeIdPrefix} onChange={e => setG('employeeIdPrefix', e.target.value)} className={INPUT} placeholder="EMP" />
                    </div>
                    <div>
                      <label className={LABEL}>Sequence length (digits)</label>
                      <input type="number" min={1} max={12} value={g.employeeIdSequenceLength} onChange={e => setG('employeeIdSequenceLength', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Default department</label>
                      <input value={g.defaultDepartment} onChange={e => setG('defaultDepartment', e.target.value)} className={INPUT} placeholder="General" />
                    </div>
                  </div>
                </div>
              </details>

              {/* Payroll */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>PAYROLL</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Payroll provider integration</label>
                      <select value={g.payrollProvider} onChange={e => setG('payrollProvider', e.target.value)} className={SELECT}>
                        <option>None</option>
                        <option>ADP</option>
                        <option>Paycom</option>
                        <option>Paychex</option>
                        <option>Gusto</option>
                        <option>Rippling</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Pay frequency default</label>
                      <select value={g.payFrequency} onChange={e => setG('payFrequency', e.target.value)} className={SELECT}>
                        <option>Weekly</option>
                        <option>Bi-weekly</option>
                        <option>Semi-monthly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>

              {/* Recent Hires Date Range */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>RECENT HIRES DATE RANGE</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Period</label>
                      <input type="number" value={g.recentHiresPeriod} onChange={e => setG('recentHiresPeriod', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Unit</label>
                      <select value={g.recentHiresUnit} onChange={e => setG('recentHiresUnit', e.target.value)} className={SELECT}>
                        <option>Days</option>
                        <option>Weeks</option>
                        <option>Months</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>

              {/* View Exiting Workers Date Range */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>VIEW EXITING WORKERS DATE RANGE</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={LABEL}>Period</label>
                      <input type="number" value={g.viewExitingWorkersPeriod} onChange={e => setG('viewExitingWorkersPeriod', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Unit</label>
                      <select value={g.viewExitingWorkersUnit} onChange={e => setG('viewExitingWorkersUnit', e.target.value)} className={SELECT}>
                        <option>Days</option>
                        <option>Weeks</option>
                        <option>Months</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>View exiting workers</label>
                      <select value={g.viewExitingWorkers} onChange={e => setG('viewExitingWorkers', e.target.value)} className={SELECT}>
                        <option>Extended reports</option>
                        <option>Direct reports</option>
                        <option>All</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>

              {/* Exited Workers Date Range */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>EXITED WORKERS DATE RANGE</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Exited workers period</label>
                      <input type="number" value={g.exitedWorkersPeriod} onChange={e => setG('exitedWorkersPeriod', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Exited workers period unit</label>
                      <select value={g.exitedWorkersPeriodUnit} onChange={e => setG('exitedWorkersPeriodUnit', e.target.value)} className={SELECT}>
                        <option>Days</option>
                        <option>Weeks</option>
                        <option>Months</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>

              {/* Termination Defaults */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>TERMINATION DEFAULTS</summary>
                <div className={FASTTAB_BODY}>
                  <div className={CHECK_ROW}>
                    <input type="checkbox" id="allowRehire" checked={g.allowRehire} onChange={e => setG('allowRehire', e.target.checked)} className={CHECK} />
                    <label htmlFor="allowRehire" className={CHECK_LABEL}>Allow rehire</label>
                  </div>
                </div>
              </details>

              {/* Time & Attendance */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>TIME &amp; ATTENDANCE</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Default work schedule</label>
                      <select value={g.defaultWorkSchedule} onChange={e => setG('defaultWorkSchedule', e.target.value)} className={SELECT}>
                        <option>Standard 40h</option>
                        <option>Part-time 20h</option>
                        <option>4/10 Compressed</option>
                        <option>Flexible</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Overtime threshold (hours/week)</label>
                      <input type="number" min={0} max={168} value={g.overtimeThresholdHours} onChange={e => setG('overtimeThresholdHours', Number(e.target.value))} className={INPUT} />
                    </div>
                  </div>
                </div>
              </details>

              {/* Self Service */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>EMPLOYEE SELF SERVICE</summary>
                <div className={FASTTAB_BODY}>
                  <div className="space-y-2.5">
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="selfServiceTimeOff" checked={g.allowSelfServiceTimeOff} onChange={e => setG('allowSelfServiceTimeOff', e.target.checked)} className={CHECK} />
                      <label htmlFor="selfServiceTimeOff" className={CHECK_LABEL}>Allow self-service time off requests</label>
                    </div>
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="addressUpdates" checked={g.allowAddressContactUpdates} onChange={e => setG('allowAddressContactUpdates', e.target.checked)} className={CHECK} />
                      <label htmlFor="addressUpdates" className={CHECK_LABEL}>Allow address and contact updates</label>
                    </div>
                  </div>
                </div>
              </details>

              {/* Payment Methods */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>PAYMENT METHODS</summary>
                <div className={FASTTAB_BODY}>
                  <div className="space-y-2.5">
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="disableElectronic" checked={g.disableElectronicPaymentValidation} onChange={e => setG('disableElectronicPaymentValidation', e.target.checked)} className={CHECK} />
                      <label htmlFor="disableElectronic" className={CHECK_LABEL}>Disable electronic payment validation</label>
                    </div>
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="disableBank" checked={g.disableBankAccountRouting} onChange={e => setG('disableBankAccountRouting', e.target.checked)} className={CHECK} />
                      <label htmlFor="disableBank" className={CHECK_LABEL}>Disable bank account and routing number validation</label>
                    </div>
                  </div>
                </div>
              </details>

              {/* Expiring / Expired Records */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>EXPIRING &amp; EXPIRED RECORDS RANGE</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={LABEL}>Expiring records — number of days</label>
                      <input type="number" value={g.expiringRecordsDays} onChange={e => setG('expiringRecordsDays', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Expired records — number of days</label>
                      <input type="number" value={g.expiredRecordsDays} onChange={e => setG('expiredRecordsDays', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Address change — number of days</label>
                      <input type="number" value={g.addressChangeDays} onChange={e => setG('addressChangeDays', Number(e.target.value))} className={INPUT} />
                    </div>
                  </div>
                </div>
              </details>

              {/* Notifications */}
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>NOTIFICATIONS</summary>
                <div className={FASTTAB_BODY}>
                  <div className="space-y-2.5">
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="onboarding" checked={g.enableOnboardingNotifications} onChange={e => setG('enableOnboardingNotifications', e.target.checked)} className={CHECK} />
                      <label htmlFor="onboarding" className={CHECK_LABEL}>Enable onboarding notifications</label>
                    </div>
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="probation" checked={g.enableProbationReminders} onChange={e => setG('enableProbationReminders', e.target.checked)} className={CHECK} />
                      <label htmlFor="probation" className={CHECK_LABEL}>Enable probation period reminders</label>
                    </div>
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="anniversary" checked={g.enableAnniversaryAlerts} onChange={e => setG('enableAnniversaryAlerts', e.target.checked)} className={CHECK} />
                      <label htmlFor="anniversary" className={CHECK_LABEL}>Enable work anniversary alerts</label>
                    </div>
                  </div>
                </div>
              </details>

            </div>
          )}

          {/* ── FMLA TAB ─────────────────────────────────────────────────────── */}
          {activeTab === 'fmla' && !loading && (
            <div className="space-y-3">

              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>FMLA ELIGIBILITY REQUIREMENTS</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={LABEL}>Hours worked</label>
                      <input type="number" value={f.hoursWorked} onChange={e => setF('hoursWorked', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Length of employment — unit</label>
                      <select value={f.lengthOfEmploymentUnit} onChange={e => setF('lengthOfEmploymentUnit', e.target.value)} className={SELECT}>
                        <option>Months</option>
                        <option>Years</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Length of employment — value</label>
                      <input type="number" value={f.lengthOfEmploymentValue} onChange={e => setF('lengthOfEmploymentValue', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div className="col-span-3">
                      <label className={LABEL}>Eligibility date priority sequence</label>
                      <select value={f.eligibilityDatePriority} onChange={e => setF('eligibilityDatePriority', e.target.value)} className={SELECT}>
                        <option>Seniority date</option>
                        <option>Adjusted start date</option>
                        <option>Start date</option>
                        <option>Employment start date</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>

              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>FMLA ENTITLEMENT</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={LABEL}>Standard hours</label>
                      <input type="number" value={f.standardHours} onChange={e => setF('standardHours', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Military hours</label>
                      <input type="number" value={f.militaryHours} onChange={e => setF('militaryHours', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Leave calendar</label>
                      <select value={f.leaveCalendar} onChange={e => setF('leaveCalendar', e.target.value)} className={SELECT}>
                        <option>Calendar year</option>
                        <option>Rolling 12 months</option>
                        <option>Fixed 12 months from first leave</option>
                        <option>Fixed 12 months from hire</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>

              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>TRACKING</summary>
                <div className={FASTTAB_BODY}>
                  <div className="space-y-3">
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="autoDesignate" checked={f.autoDesignateFmla} onChange={e => setF('autoDesignateFmla', e.target.checked)} className={CHECK} />
                      <label htmlFor="autoDesignate" className={CHECK_LABEL}>Auto-designate FMLA leave</label>
                    </div>
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="requireMedical" checked={f.requireMedicalCertification} onChange={e => setF('requireMedicalCertification', e.target.checked)} className={CHECK} />
                      <label htmlFor="requireMedical" className={CHECK_LABEL}>Require medical certification</label>
                    </div>
                    <div className="pt-1">
                      <label className={LABEL}>Certification deadline (days)</label>
                      <input type="number" value={f.certificationDeadlineDays} onChange={e => setF('certificationDeadlineDays', Number(e.target.value))} className="w-40 rounded-md bg-zinc-900/60 border border-zinc-800/50 text-zinc-100 text-[12px] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/60" />
                    </div>
                  </div>
                </div>
              </details>

              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>INTERMITTENT LEAVE</summary>
                <div className={FASTTAB_BODY}>
                  <div className="space-y-3">
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="allowIntermittent" checked={f.allowIntermittentFmla} onChange={e => setF('allowIntermittentFmla', e.target.checked)} className={CHECK} />
                      <label htmlFor="allowIntermittent" className={CHECK_LABEL}>Allow intermittent FMLA leave</label>
                    </div>
                    <div className="pt-1">
                      <label className={LABEL}>Minimum increment (hours)</label>
                      <input type="number" min={0.25} step={0.25} value={f.intermittentMinimumHours} onChange={e => setF('intermittentMinimumHours', Number(e.target.value))} className="w-40 rounded-md bg-zinc-900/60 border border-zinc-800/50 text-zinc-100 text-[12px] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/60" />
                    </div>
                  </div>
                </div>
              </details>

            </div>
          )}

          {/* ── LEAVE TAB ────────────────────────────────────────────────────── */}
          {activeTab === 'leave' && !loading && (
            <div className="space-y-3">
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>LEAVE SETTINGS</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Leave year type</label>
                      <select value={lv.leaveYearType} onChange={e => setL('leaveYearType', e.target.value)} className={SELECT}>
                        <option>Rolling 12 months</option>
                        <option>Calendar year</option>
                        <option>Fiscal year</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Default leave type</label>
                      <select value={lv.defaultLeaveType} onChange={e => setL('defaultLeaveType', e.target.value)} className={SELECT}>
                        <option>PTO</option>
                        <option>Vacation</option>
                        <option>Sick</option>
                        <option>Personal</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Carryover limit (hours)</label>
                      <input type="number" value={lv.carryoverLimit} onChange={e => setL('carryoverLimit', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Max accrual balance (hours)</label>
                      <input type="number" value={lv.maxAccrualBalance} onChange={e => setL('maxAccrualBalance', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="negativeBalance" checked={lv.allowNegativeBalance} onChange={e => setL('allowNegativeBalance', e.target.checked)} className={CHECK} />
                      <label htmlFor="negativeBalance" className={CHECK_LABEL}>Allow negative leave balance</label>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* ── BENEFITS TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'benefits' && !loading && (
            <div className="space-y-3">
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>BENEFITS MANAGEMENT</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Open enrollment window (days)</label>
                      <input type="number" value={bn.openEnrollmentDays} onChange={e => setB('openEnrollmentDays', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Benefits waiting period (days)</label>
                      <input type="number" value={bn.waitingPeriodDays} onChange={e => setB('waitingPeriodDays', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>COBRA notification window (days)</label>
                      <input type="number" value={bn.cobraNotificationDays} onChange={e => setB('cobraNotificationDays', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div className={CHECK_ROW}>
                      <input type="checkbox" id="dependentCoverage" checked={bn.dependentCoverageAllowed} onChange={e => setB('dependentCoverageAllowed', e.target.checked)} className={CHECK} />
                      <label htmlFor="dependentCoverage" className={CHECK_LABEL}>Allow dependent coverage enrollment</label>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* ── PERFORMANCE TAB ──────────────────────────────────────────────── */}
          {activeTab === 'performance' && !loading && (
            <div className="space-y-3">
              <details open className={FASTTAB}>
                <summary className={FASTTAB_SUMMARY}>PERFORMANCE MANAGEMENT</summary>
                <div className={FASTTAB_BODY}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Review cycle (days)</label>
                      <input type="number" value={pf.reviewCycleDays} onChange={e => setP('reviewCycleDays', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Default rating scale</label>
                      <select value={pf.defaultRatingScale} onChange={e => setP('defaultRatingScale', e.target.value)} className={SELECT}>
                        <option>1-5</option>
                        <option>1-10</option>
                        <option>Letter (A-F)</option>
                        <option>Exceeds / Meets / Below</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Probation review (days)</label>
                      <input type="number" value={pf.probationReviewDays} onChange={e => setP('probationReviewDays', Number(e.target.value))} className={INPUT} />
                    </div>
                    <div className="space-y-2.5">
                      <div className={CHECK_ROW}>
                        <input type="checkbox" id="requireGoals" checked={pf.requireGoalSetting} onChange={e => setP('requireGoalSetting', e.target.checked)} className={CHECK} />
                        <label htmlFor="requireGoals" className={CHECK_LABEL}>Require goal setting before review</label>
                      </div>
                      <div className={CHECK_ROW}>
                        <input type="checkbox" id="continuousFeedback" checked={pf.enableContinuousFeedback} onChange={e => setP('enableContinuousFeedback', e.target.checked)} className={CHECK} />
                        <label htmlFor="continuousFeedback" className={CHECK_LABEL}>Enable continuous feedback</label>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center text-[12px] text-zinc-500">Loading parameters…</div>
          )}

        </div>
      </main>
    </>
  )
}
