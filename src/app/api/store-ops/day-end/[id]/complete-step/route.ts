import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { stepName, completedBy } = await req.json()
  const procedure = await prisma.dayEndProcedure.findUnique({ where: { id } })
  if (!procedure) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const steps = JSON.parse(procedure.steps) as Array<{ stepName: string; status: string; completedBy: string | null; completedAt: string | null }>
  const updated = steps.map(s => s.stepName === stepName ? { ...s, status: 'completed', completedBy, completedAt: new Date().toISOString() } : s)
  const allDone = updated.every(s => s.status === 'completed')
  const result = await prisma.dayEndProcedure.update({
    where: { id },
    data: { steps: JSON.stringify(updated), status: allDone ? 'closing' : 'in-progress' },
  })
  return NextResponse.json(result)
}
