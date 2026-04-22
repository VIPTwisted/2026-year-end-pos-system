'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, GripVertical } from 'lucide-react'

type Row = {
  rowNo: number
  description: string
  rowType: 'heading' | 'account' | 'formula' | 'blank' | 'total'
  accountRange: string
  formula: string
  bold: boolean
  underline: boolean
  indent: number
  showOpposite: boolean
}

const TEMPLATE_TYPES = [
  { value: 'income_statement', label: 'Income Statement' },
  { value: 'balance_sheet', label: 'Balance Sheet' },
  { value: 'cash_flow', label: 'Cash Flow' },
  { value: 'trial_balance', label: 'Trial Balance' },
  { value: 'custom', label: 'Custom' },
]

const ROW_TYPES = [
  { value: 'heading', label: 'Heading' },
  { value: 'account', label: 'Account Range' },
  { value: 'formula', label: 'Formula' },
  { value: 'total', label: 'Total' },
  { value: 'blank', label: 'Blank' },
]

export default function NewFinancialReportPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('income_statement')
  const [rows, setRows] = useState<Row[]>([
    { rowNo: 10, description: '', rowType: 'heading', accountRange: '', formula: '', bold: true, underline: false, indent: 0, showOpposite: false },
  ])

  function addRow() {
    const lastNo = rows[rows.length - 1]?.rowNo ?? 0
    setRows(r => [...r, {
      rowNo: lastNo + 10,
      description: '',
      rowType: 'account',
      accountRange: '',
      formula: '',
      bold: false,
      underline: false,
      indent: 0,
      showOpposite: false,
    }])
  }

  function updateRow(i: number, patch: Partial<Row>) {
    setRows(r => r.map((row, idx) => idx === i ? { ...row, ...patch } : row))
  }

  function removeRow(i: number) {
    setRows(r => r.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (!name) return
    setSaving(true)
    try {
      const res = await fetch('/api/financial-reports/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, type, rows }),
      })
      if (res.ok) {
        const t = await res.json()
        router.push(`/finance/reports/${t.id}/run`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Report Template" />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-5xl">

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">Template Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Monthly P&L" />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  {TEMPLATE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Report Rows</h2>
              <Button size="sm" variant="outline" onClick={addRow}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Row
              </Button>
            </div>

            <div className="space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <GripVertical className="w-4 h-4 text-zinc-700 mt-2 shrink-0" />
                  <div className="flex-1 grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-1">
                      <Label className="text-xs">Row #</Label>
                      <Input
                        type="number"
                        value={row.rowNo}
                        onChange={e => updateRow(i, { rowNo: parseInt(e.target.value) || 0 })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={row.description}
                        onChange={e => updateRow(i, { description: e.target.value })}
                        className="h-8 text-xs"
                        placeholder="Row label"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Type</Label>
                      <select
                        value={row.rowType}
                        onChange={e => updateRow(i, { rowType: e.target.value as Row['rowType'] })}
                        className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100"
                      >
                        {ROW_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    {(row.rowType === 'account') && (
                      <div className="col-span-3">
                        <Label className="text-xs">Account Range</Label>
                        <Input
                          value={row.accountRange}
                          onChange={e => updateRow(i, { accountRange: e.target.value })}
                          className="h-8 text-xs"
                          placeholder="1000..1999"
                        />
                      </div>
                    )}
                    {(row.rowType === 'formula' || row.rowType === 'total') && (
                      <div className="col-span-3">
                        <Label className="text-xs">Formula</Label>
                        <Input
                          value={row.formula}
                          onChange={e => updateRow(i, { formula: e.target.value })}
                          className="h-8 text-xs"
                          placeholder="ROW(10)+ROW(20)"
                        />
                      </div>
                    )}
                    <div className="col-span-1">
                      <Label className="text-xs">Indent</Label>
                      <Input
                        type="number"
                        value={row.indent}
                        onChange={e => updateRow(i, { indent: parseInt(e.target.value) || 0 })}
                        className="h-8 text-xs"
                        min={0}
                        max={5}
                      />
                    </div>
                    <div className="col-span-2 flex gap-3 items-end pb-1">
                      <label className="flex items-center gap-1 text-xs text-zinc-400 cursor-pointer">
                        <input type="checkbox" checked={row.bold} onChange={e => updateRow(i, { bold: e.target.checked })} className="w-3 h-3" />
                        Bold
                      </label>
                      <label className="flex items-center gap-1 text-xs text-zinc-400 cursor-pointer">
                        <input type="checkbox" checked={row.underline} onChange={e => updateRow(i, { underline: e.target.checked })} className="w-3 h-3" />
                        Line
                      </label>
                    </div>
                  </div>
                  <button onClick={() => removeRow(i)} className="text-zinc-600 hover:text-red-400 mt-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="text-sm text-zinc-600 text-center py-6">No rows yet — add your first row above</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/finance/reports')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name}>
            {saving ? 'Saving…' : 'Create Template'}
          </Button>
        </div>
      </main>
    </>
  )
}
