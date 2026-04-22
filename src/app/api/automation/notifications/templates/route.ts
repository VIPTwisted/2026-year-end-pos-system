import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const templates = await prisma.notificationTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.name || !body.body) return NextResponse.json({ error: 'name and body required' }, { status: 400 })
  const template = await prisma.notificationTemplate.create({
    data: {
      name: body.name,
      channel: body.channel ?? 'in-app',
      subject: body.subject ?? null,
      body: body.body,
      variables: JSON.stringify(body.variables ?? []),
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(template, { status: 201 })
}
