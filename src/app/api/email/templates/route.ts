import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const eventType = searchParams.get('eventType')
  const templates = await prisma.emailTemplate.findMany({
    where: eventType ? { eventType } : {},
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(templates)
}

export async function POST(req: Request) {
  const body = await req.json()
  const template = await prisma.emailTemplate.create({
    data: {
      templateName: body.templateName,
      subject: body.subject,
      senderEmail: body.senderEmail,
      senderName: body.senderName,
      language: body.language ?? 'en-us',
      htmlBody: body.htmlBody ?? '',
      textBody: body.textBody,
      tokens: body.tokens,
      eventType: body.eventType,
    },
  })
  return NextResponse.json(template, { status: 201 })
}
