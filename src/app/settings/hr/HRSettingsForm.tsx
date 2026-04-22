'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { CheckCircle } from 'lucide-react'

interface Props {
  initialSettings: Record<string, string>
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-zinc-700'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      </div>
      <div className="ml-8 flex-shrink-0">{children}</div>
    </div>
  )
}

export default function HRSettingsForm({ initialSettings }: Props) {
  const [tab, setTab] = useState<'general' | 'fmla'>('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState({
    // ACA
    acaSelfInsured: initialSettings['aca_self_insured'] === 'true',
    // Injury
    keepInjuryCaseIncidents: initialSettings['keep_injury_incidents'] === 'true',
    injuryDaysKept: initialSettings['injury_days_kept'] ?? '365',
    // Hire
    defaultIdType: initialSettings['default_id_type'] ?? 'SSN',
    defaultEmpCategory: initialSettings['default_emp_category'] ?? 'employee',
    defaultEmpType: initialSettings['default_emp_type'] ?? 'full_time',
    // Recent Hires
    recentHiresPeriod: initialSettings['recent_hires_period'] ?? '30',
    recentHiresUnit: initialSettings['recent_hires_unit'] ?? 'Days',
    // View Exiting
    viewExitingPeriod: initialSettings['view_exiting_period'] ?? '30',
    viewExitingUnit: initialSettings['view_exiting_unit'] ?? 'Days',
    viewExitingMode: initialSettings['view_exiting_mode'] ?? 'before_exit',
    // Exited Workers
    exitedPeriod: initialSettings['exited_period'] ?? '30',
    exitedUnit: initialSettings['exited_unit'] ?? 'Days',
    // Termination
    allowRehire: initialSettings['allow_rehire'] === 'true',
    // Payment
    disableElectronicPaymentValidation: initialSettings['disable_ep_validation'] === 'true',
    disableBankRouting: initialSettings['disable_bank_routing'] === 'true',
    // Expiring Records
    expiringDays: initialSettings['expiring_days'] ?? '30',
    expiredDays: initialSettings['expired_days'] ?? '30',
    // Address Change
    addressChangeDays: initialSettings['address_change_days'] ?? '30',
    // FMLA
    fmlaHoursWorked: initialSettings['fmla_hours_worked'] ?? '1250',
    fmlaMonthsEmployed: initialSettings['fmla_months_employed'] ?? '12',
    fmlaStandardHours: initialSettings['fmla_standard_hours'] ?? '480',
    fmlaMilitaryHours: initialSettings['fmla_military_hours'] ?? '1040',
    fmlaLeaveCalendar: initialSettings['fmla_leave_calendar'] ?? 'calendar_year',
    fmlaEligibilityPriority: initialSettings['fmla_eligibility_priority'] ?? JSON.stringify(['seniority_date', 'adjusted_start', 'start_date', 'employment_start']),
  })

  function set(key: keyof typeof settings, value: string | boolean) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const payload: Record<string, string> = {
      aca_self_insured: String(settings.acaSelfInsured),
      keep_injury_incidents: String(settings.keepInjuryCaseIncidents),
      injury_days_kept: settings.injuryDaysKept,
      default_id_type: settings.defaultIdType,
      default_emp_category: settings.defaultEmpCategory,
      default_emp_type: settings.defaultEmpType,
      recent_hires_period: settings.recentHiresPeriod,
      recent_hires_unit: settings.recentHiresUnit,
      view_exiting_period: settings.viewExitingPeriod,
      view_exiting_unit: settings.viewExitingUnit,
      view_exiting_mode: settings.viewExitingMode,
      exited_period: settings.exitedPeriod,
      exited_unit: settings.exitedUnit,
      allow_rehire: String(settings.allowRehire),
      disable_ep_validation: String(settings.disableElectronicPaymentValidation),
      disable_bank_routing: String(settings.disableBankRouting),
      expiring_days: settings.expiringDays,
      expired_days: settings.expiredDays,
      address_change_days: settings.addressChangeDays,
      fmla_hours_worked: settings.fmlaHoursWorked,
      fmla_months_employed: settings.fmlaMonthsEmployed,
      fmla_standard_hours: settings.fmlaStandardHours,
      fmla_military_hours: settings.fmlaMilitaryHours,
      fmla_leave_calendar: settings.fmlaLeaveCalendar,
      fmla_eligibility_priority: settings.fmlaEligibilityPriority,
    }
    await fetch('/api/hr/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const UNIT_OPTIONS = ['Days', 'Weeks', 'Months']
  const eligibilityDates = JSON.parse(settings.fmlaEligibilityPriority) as string[]
  const DATE_LABELS: Record<string, string> = {
    seniority_date: 'Seniority date',
    adjusted_start: 'Adjusted start date',
    start_date: 'Start date',
    employment_start: 'Employment start date',
  }

  function moveUp(i: number) {
    if (i === 0) return
    const arr = [...eligibilityDates]
    ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
    set('fmlaEligibilityPriority', JSON.stringify(arr))
  }
  function moveDown(i: number) {
    if (i === eligibilityDates.length - 1) return
    const arr = [...eligibilityDates]
    ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
    set('fmlaEligibilityPriority', JSON.stringify(arr))
  }

  const cardCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 mb-4'
  const sectionLabelCls = 'text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-3'
  const inputCls = 'h-9 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-[13px] text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500'
  const selectCls = 'h-9 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-[13px] text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <div className="max-w-3xl space-y-0">
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-zinc-800/50 mb-5">
        {(['general', 'fmla'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px capitalize ${tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            {t === 'fmla' ? 'FMLA' : 'General'}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div>
          {/* Affordable Care Act */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>Affordable Care Act</p>
            <Field label="Employer sponsored self-insured" hint="Employee and applicable coverage reporting">
              <Toggle checked={settings.acaSelfInsured} onChange={v => set('acaSelfInsured', v)} />
            </Field>
          </div>

          {/* Injury and Illness */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>Injury and Illness</p>
            <Field label="Keep case incidents" hint="Enable incident case history tracking">
              <Toggle checked={settings.keepInjuryCaseIncidents} onChange={v => set('keepInjuryCaseIncidents', v)} />
            </Field>
            <Field label="Number of days" hint="Days to retain closed cases">
              <Input type="number" value={settings.injuryDaysKept} onChange={e => set('injuryDaysKept', e.target.value)} className={`${inputCls} w-24 text-right`} />
            </Field>
          </div>

          {/* Hire Worker */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>Hire Worker</p>
            <Field label="Default identification type">
              <Input value={settings.defaultIdType} onChange={e => set('defaultIdType', e.target.value)} className={`${inputCls} w-32`} placeholder="SSN" />
            </Field>
            <Field label="Default employment category">
              <select value={settings.defaultEmpCategory} onChange={e => set('defaultEmpCategory', e.target.value)} className={selectCls}>
                <option value="employee">Employee</option>
                <option value="contractor">Contractor</option>
              </select>
            </Field>
            <Field label="Default employment type">
              <select value={settings.defaultEmpType} onChange={e => set('defaultEmpType', e.target.value)} className={selectCls}>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="seasonal">Seasonal</option>
                <option value="intern">Intern</option>
              </select>
            </Field>
          </div>

          {/* Date Ranges */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>Date Ranges</p>
            <Field label="Recent Hires Date Range">
              <div className="flex items-center gap-2">
                <Input type="number" value={settings.recentHiresPeriod} onChange={e => set('recentHiresPeriod', e.target.value)} className={`${inputCls} w-20 text-right`} />
                <select value={settings.recentHiresUnit} onChange={e => set('recentHiresUnit', e.target.value)} className={selectCls}>
                  {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </Field>
            <Field label="View Exiting Workers Date Range">
              <div className="flex items-center gap-2">
                <Input type="number" value={settings.viewExitingPeriod} onChange={e => set('viewExitingPeriod', e.target.value)} className={`${inputCls} w-20 text-right`} />
                <select value={settings.viewExitingUnit} onChange={e => set('viewExitingUnit', e.target.value)} className={selectCls}>
                  {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </Field>
            <Field label="View Exiting Workers Mode">
              <select value={settings.viewExitingMode} onChange={e => set('viewExitingMode', e.target.value)} className={selectCls}>
                <option value="before_exit">Before exit date</option>
                <option value="after_exit">After exit date</option>
              </select>
            </Field>
            <Field label="Exited Workers Date Range">
              <div className="flex items-center gap-2">
                <Input type="number" value={settings.exitedPeriod} onChange={e => set('exitedPeriod', e.target.value)} className={`${inputCls} w-20 text-right`} />
                <select value={settings.exitedUnit} onChange={e => set('exitedUnit', e.target.value)} className={selectCls}>
                  {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </Field>
          </div>

          {/* Termination */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>Termination Defaults</p>
            <Field label="Allow rehire" hint="Allow terminated workers to be rehired">
              <Toggle checked={settings.allowRehire} onChange={v => set('allowRehire', v)} />
            </Field>
          </div>

          {/* Payment Methods */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>Payment Methods</p>
            <Field label="Disable electronic payment validation">
              <Toggle checked={settings.disableElectronicPaymentValidation} onChange={v => set('disableElectronicPaymentValidation', v)} />
            </Field>
            <Field label="Disable bank account routing validation">
              <Toggle checked={settings.disableBankRouting} onChange={v => set('disableBankRouting', v)} />
            </Field>
          </div>

          {/* Record Ranges */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>Expiring / Expired Records</p>
            <Field label="Expiring Records Range (days)" hint="Days before expiry to show warning">
              <Input type="number" value={settings.expiringDays} onChange={e => set('expiringDays', e.target.value)} className={`${inputCls} w-24 text-right`} />
            </Field>
            <Field label="Expired Records Range (days)" hint="Days after expiry to retain record">
              <Input type="number" value={settings.expiredDays} onChange={e => set('expiredDays', e.target.value)} className={`${inputCls} w-24 text-right`} />
            </Field>
            <Field label="Address Change Notification (days)">
              <Input type="number" value={settings.addressChangeDays} onChange={e => set('addressChangeDays', e.target.value)} className={`${inputCls} w-24 text-right`} />
            </Field>
          </div>
        </div>
      )}

      {tab === 'fmla' && (
        <div>
          {/* FMLA Eligibility */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>FMLA Eligibility Requirements</p>
            <Field label="Hours worked threshold" hint="Minimum hours worked in prior 12 months (default: 1,250)">
              <Input type="number" value={settings.fmlaHoursWorked} onChange={e => set('fmlaHoursWorked', e.target.value)} className={`${inputCls} w-28 text-right`} />
            </Field>
            <Field label="Length of employment" hint="Minimum months of service (default: 12)">
              <div className="flex items-center gap-2">
                <Input type="number" value={settings.fmlaMonthsEmployed} onChange={e => set('fmlaMonthsEmployed', e.target.value)} className={`${inputCls} w-20 text-right`} />
                <span className="text-[13px] text-zinc-500">Months</span>
              </div>
            </Field>
          </div>

          {/* Eligibility Date Priority */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>Eligibility Date Priority</p>
            <p className="text-[12px] text-zinc-500 mb-3">Use arrows to reorder — first item takes highest priority</p>
            <div className="space-y-2">
              {eligibilityDates.map((d, i) => (
                <div key={d} className="flex items-center gap-3 bg-zinc-800/60 rounded-lg px-4 py-2.5 border border-zinc-700/50">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600/20 text-blue-400 text-[11px] font-bold">{i + 1}</span>
                  <span className="flex-1 text-[13px] text-zinc-200">{DATE_LABELS[d] ?? d}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveUp(i)} disabled={i === 0}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed text-[12px]">▲</button>
                    <button type="button" onClick={() => moveDown(i)} disabled={i === eligibilityDates.length - 1}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed text-[12px]">▼</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FMLA Entitlement */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>FMLA Entitlement</p>
            <Field label="Standard hours" hint="Standard FMLA entitlement hours (default: 480 = 12 weeks)">
              <Input type="number" value={settings.fmlaStandardHours} onChange={e => set('fmlaStandardHours', e.target.value)} className={`${inputCls} w-28 text-right`} />
            </Field>
            <Field label="Military caregiver hours" hint="Military caregiver entitlement hours (default: 1,040 = 26 weeks)">
              <Input type="number" value={settings.fmlaMilitaryHours} onChange={e => set('fmlaMilitaryHours', e.target.value)} className={`${inputCls} w-28 text-right`} />
            </Field>
            <Field label="Leave calendar" hint="Basis for calculating the 12-month FMLA period">
              <select value={settings.fmlaLeaveCalendar} onChange={e => set('fmlaLeaveCalendar', e.target.value)} className={selectCls}>
                <option value="calendar_year">Calendar Year</option>
                <option value="hire_anniversary">Hire Anniversary</option>
                <option value="rolling_12">Rolling 12-Month Period</option>
                <option value="fixed_leave_year">Fixed Leave Year</option>
              </select>
            </Field>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-medium transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-[13px]">
            <CheckCircle className="w-4 h-4" />Settings saved
          </span>
        )}
      </div>
    </div>
  )
}
