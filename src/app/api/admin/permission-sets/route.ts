import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sets = await prisma.adminPermissionSet.findMany({
    include: { permissions: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(sets)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { permissions, ...setData } = body
  const set = await prisma.adminPermissionSet.create({
    data: {
      ...setData,
      permissions: permissions?.length
        ? { create: permissions }
        : undefined,
    },
    include: { permissions: true },
  })
  return NextResponse.json(set, { status: 201 })
}
