import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const users = await prisma.systemUser.findMany({
    include: { permissions: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const body = await req.json()
  const user = await prisma.systemUser.create({
    data: {
      username: body.username,
      email: body.email,
      displayName: body.displayName,
      role: body.role ?? 'viewer',
      storeId: body.storeId,
      storeName: body.storeName,
    },
  })
  return NextResponse.json(user, { status: 201 })
}
