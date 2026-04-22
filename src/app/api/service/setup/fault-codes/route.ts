import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const codes = await prisma.faultCode.findMany({ orderBy: { code: 'asc' } })
  return NextResponse.json(codes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { code, description } = body

  if (!code || !description) {
    return NextResponse.json({ error: 'code and description are required' }, { status: 400 })
  }

  const existing = await prisma.faultCode.findUnique({ where: { code } })
  if (existing) {
    return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
  }

  const faultCode = await prisma.faultCode.create({ data: { code, description } })
  return NextResponse.json(faultCode, { status: 201 })
}
