import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const model = await prisma.cIPredictionModel.findUnique({ where: { id } })
  if (!model) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(model)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.cIPredictionModel.update({
    where: { id },
    data: {
      ...(body.modelName !== undefined && { modelName: body.modelName }),
      ...(body.modelType !== undefined && { modelType: body.modelType }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.accuracy !== undefined && { accuracy: body.accuracy }),
      ...(body.precision !== undefined && { precision: body.precision }),
      ...(body.recall !== undefined && { recall: body.recall }),
      ...(body.f1Score !== undefined && { f1Score: body.f1Score }),
      ...(body.profilesScored !== undefined && { profilesScored: body.profilesScored }),
      ...(body.configJson !== undefined && { configJson: body.configJson }),
    },
  })
  return NextResponse.json(updated)
}
