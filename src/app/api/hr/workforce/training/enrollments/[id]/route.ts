import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { progress, status, score } = body

  const updateData: Record<string, unknown> = {}
  if (progress !== undefined) updateData.progress = progress
  if (status !== undefined) updateData.status = status
  if (score !== undefined) updateData.score = score
  if (status === 'completed') { updateData.completedAt = new Date(); updateData.progress = 100 }

  const enrollment = await prisma.trainingEnrollment.update({ where: { id }, data: updateData })
  return NextResponse.json(enrollment)
}
