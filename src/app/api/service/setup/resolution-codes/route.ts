import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const codes = await prisma.resolutionCode.findMany({ orderBy: { code: 'asc' } })
  return NextResponse.json(codes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { code, description } = body

  if (!code || !description) {
    return NextResponse.json({ error: 'code and description are required' }, { status: 400 })
  }

  const existing = await prisma.resolutionCode.findUnique({ where: { code } })
  if (existing) {
    return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
  }

  const resolutionCode = await prisma.resolutionCode.create({ data: { code, description } })
  return NextResponse.json(resolutionCode, { status: 201 })
}
