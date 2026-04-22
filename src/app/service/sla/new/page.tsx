'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

export default function NewSLAPolicyPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [applicableTo, setApplicableTo] = useState('all')
  const [firstResponseHours, setFirstResponseHours] = useState('8')
  const [resolutionHours, setResolutionHours] = useState('48')
  const [warningThresholdPct, setWarningThresholdPct] = useState('75')
  const [businessHoursOnly, setBusinessHoursOnly] = useState(true)
  const [pauseOnHold, setPauseOnHold] = useState(true)
  const [isDefault, setIsDefault] = useState(false)

  async function handleSubmit() {
    if (!name.trim()) return
    setSaving(true)
    const res = await fetch('/api/service/sla/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, description, applicableTo,
        firstResponseHours: parseFloat(firstResponseHours),
        resolutionHours: parseFloat(resolutionHours),
        warningThresholdPct: parseFloat(warningThresholdPct),
        businessHoursOnly, pauseOnHold, isDefault,
      }),
    })
    if (res.ok) {
      router.push('/service/sla')
    } else {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New SLA Policy" />
      <main className="flex-1 p-6 max-w-2xl space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/service/sla"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
        </Button>

        <Card>
          <CardContent className="pt-6 pb-6 space-y-5">
            <h2 className="text-lg font-semibold text-zinc-100">SLA Policy</h2>

            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Standard Support SLA" />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none" />
            </div>

            <div className="space-y-1.5">
              <Label>Applies To</Label>
              <select value={applicableTo} onChange={e => setApplicableTo(e.target.value)} className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                <option value="all">All Cases</option>
                <option value="priority_high">High Priority</option>
                <option value="priority_critical">Critical Priority</option>
                <option value="vip_customers">VIP Customers</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>First Response (hours)</Label>
                <Input type="number" step="0.5" min="0.5" value={firstResponseHours} onChange={e => setFirstResponseHours(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Resolution (hours)</Label>
                <Input type="number" step="1" min="1" value={resolutionHours} onChange={e => setResolutionHours(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Warning Threshold (%)</Label>
                <Input type="number" step="5" min="1" max="99" value={warningThresholdPct} onChange={e => setWarningThresholdPct(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'biz', label: 'Business hours only', value: businessHoursOnly, setter: setBusinessHoursOnly },
                { id: 'pause', label: 'Pause SLA when case is on hold', value: pauseOnHold, setter: setPauseOnHold },
                { id: 'def', label: 'Set as default policy', value: isDefault, setter: setIsDefault },
              ].map(({ id, label, value, setter }) => (
                <label key={id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={e => setter(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-blue-500"
                  />
                  <span className="text-sm text-zinc-300">{label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={saving || !name.trim()}>
                {saving ? 'Creating…' : 'Create Policy'}
              </Button>
              <Button asChild variant="ghost">
                <Link href="/service/sla">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
