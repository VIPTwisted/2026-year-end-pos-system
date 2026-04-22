import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const exp = await prisma.dataLakeExport.findUnique({ where: { id: params.id } })
  if (!exp) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(exp)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const exp = await prisma.dataLakeExport.update({ where: { id: params.id }, data: body })
  return NextResponse.json(exp)
}
