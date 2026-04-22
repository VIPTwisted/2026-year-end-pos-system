import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const goal = await prisma.performanceGoal.findUnique({ where: { id } })
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(goal)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = body.title
  if (body.description !== undefined) data.description = body.description
  if (body.category !== undefined) data.category = body.category
  if (body.status !== undefined) {
    data.status = body.status
    if (body.status === 'completed') data.completedDate = new Date()
  }
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null
  if (body.weight !== undefined) data.weight = body.weight
  if (body.targetMeasure !== undefined) data.targetMeasure = body.targetMeasure
  if (body.actualMeasure !== undefined) data.actualMeasure = body.actualMeasure
  if (body.rating !== undefined) data.rating = body.rating
  if (body.managerNotes !== undefined) data.managerNotes = body.managerNotes
  const goal = await prisma.performanceGoal.update({ where: { id }, data })
  return NextResponse.json(goal)
}
