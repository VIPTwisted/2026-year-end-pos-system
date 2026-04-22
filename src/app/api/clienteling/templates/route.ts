import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const templates = await prisma.outreachTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const template = await prisma.outreachTemplate.create({
    data: {
      name: body.name,
      channel: body.channel || 'email',
      subject: body.subject || null,
      body: body.body,
      occasion: body.occasion || null,
      isActive: true,
    },
  })
  return NextResponse.json(template, { status: 201 })
}
