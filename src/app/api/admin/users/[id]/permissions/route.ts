import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const perms = await prisma.userPermission.findMany({ where: { userId: id } })
  return NextResponse.json(perms)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const perm = await prisma.userPermission.upsert({
    where: { id: body.id ?? 'new' },
    update: { canRead: body.canRead, canWrite: body.canWrite, canDelete: body.canDelete, canApprove: body.canApprove },
    create: {
      userId: id,
      module: body.module,
      canRead: body.canRead ?? true,
      canWrite: body.canWrite ?? false,
      canDelete: body.canDelete ?? false,
      canApprove: body.canApprove ?? false,
    },
  })
  return NextResponse.json(perm, { status: 201 })
}
