import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const template = await prisma.emailTemplate.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const sampleData: Record<string, string> = {
    '{{customerName}}': 'John Doe',
    '{{orderNumber}}': 'ORD-12345',
    '{{storeName}}': 'NovaPOS Demo Store',
    '{{date}}': new Date().toLocaleDateString(),
  }
  let html = template.htmlBody
  for (const [token, value] of Object.entries(sampleData)) {
    html = html.replaceAll(token, value)
  }
  return NextResponse.json({ html, subject: template.subject })
}
