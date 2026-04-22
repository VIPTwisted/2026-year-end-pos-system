'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Play, XCircle, Lock } from 'lucide-react'

interface Measurement {
  id: string
  testName: string
  specification: string | null
  minValue: number | null
  maxValue: number | null
  actualValue: number | null
  result: string | null
}

interface QualityOrder {
  id: string
  status: string
  measurements: Measurement[]
}

export function QualityActions({ order }: { order: QualityOrder }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actuals, setActuals] = useState<Record<string, string>>(
    Object.fromEntries(order.measurements.map(m => [m.id, m.actualValue?.toString() ?? '']))
  )
  const [measResults, setMeasResults] = useState<Record<string, string>>(
    Object.fromEntries(order.measurements.map(m => [m.id, m.result ?? '']))
  )

  const patch = async (body: object) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/quality/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Action failed')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (order.status === 'closed') {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
        <Lock className="w-3.5 h-3.5" />
        Quality order closed
      </div>
    )
  }

  const measurementsPayload = order.measurements.map(m => ({
    id: m.id,
    actualValue: actuals[m.id] ? parseFloat(actuals[m.id]) : undefined,
    result: measResults[m.id] || undefined,
  }))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
        )}

        {order.status === 'open' && (
          <div className="flex items-center gap-3">
            <Button size="sm" disabled={loading} onClick={() => patch({ status: 'in_progress' })}>
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Start Inspection
            </Button>
          </div>
        )}

        {order.status === 'in_progress' && (
          <div className="space-y-4">
            {order.measurements.length > 0 && (
              <>
                <p className="text-xs text-zinc-400">Enter actual values for each test:</p>
                {order.measurements.map(m => (
                  <div key={m.id} className="grid grid-cols-4 gap-3 items-center">
                    <span className="text-xs text-zinc-300 col-span-1">{m.testName}</span>
                    <div className="col-span-1">
                      <input
                        type="number"
                        step="any"
                        value={actuals[m.id] ?? ''}
                        onChange={e => setActuals(prev => ({ ...prev, [m.id]: e.target.value }))}
                        placeholder="Actual value"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <select
                        value={measResults[m.id] ?? ''}
                        onChange={e => setMeasResults(prev => ({ ...prev, [m.id]: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                      >
                        <option value="">Result</option>
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                      </select>
                    </div>
                    <span className="text-xs text-zinc-600 col-span-1">
                      {m.minValue !== null && m.maxValue !== null ? `${m.minValue} – ${m.maxValue}` : m.specification ?? ''}
                    </span>
                  </div>
                ))}
              </>
            )}
            <div className="flex items-center gap-3 pt-2">
              <Button
                size="sm"
                disabled={loading}
                className="bg-emerald-700 hover:bg-emerald-600"
                onClick={() => patch({ status: 'passed', result: 'pass', measurements: measurementsPayload })}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Pass
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={loading}
                onClick={() => patch({ status: 'failed', result: 'fail', measurements: measurementsPayload })}
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Fail
              </Button>
            </div>
          </div>
        )}

        {(order.status === 'passed' || order.status === 'failed') && (
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" disabled={loading} onClick={() => patch({ status: 'closed' })}>
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Close Order
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
