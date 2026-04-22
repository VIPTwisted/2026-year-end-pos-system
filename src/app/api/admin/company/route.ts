import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const info = await prisma.companyInfo.findUnique({ where: { id: 'singleton' } })
  return NextResponse.json(info ?? {})
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const info = await prisma.companyInfo.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...body },
    update: body,
  })
  return NextResponse.json(info)
}
