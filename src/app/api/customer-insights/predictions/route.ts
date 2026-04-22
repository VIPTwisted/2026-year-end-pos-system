import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest) {
  const models = await prisma.cIPredictionModel.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(models)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const model = await prisma.cIPredictionModel.create({
    data: {
      modelName: body.modelName,
      modelType: body.modelType ?? 'churn',
      description: body.description ?? null,
      status: body.status ?? 'draft',
      accuracy: body.accuracy ?? null,
      configJson: body.configJson ?? null,
    },
  })
  return NextResponse.json(model, { status: 201 })
}
