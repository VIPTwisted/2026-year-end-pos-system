import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type Params = Promise<{ id: string }>

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            store: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json(user)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
    const body = (await req.json()) as {
      name?: string
      email?: string
      role?: string
      isActive?: boolean
      newPassword?: string
    }

    const data: {
      name?: string
      email?: string
      role?: string
      isActive?: boolean
      passwordHash?: string
    } = {}
    if (body.name !== undefined) data.name = body.name
    if (body.email !== undefined) data.email = body.email
    if (body.role !== undefined) data.role = body.role
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.newPassword) {
      data.passwordHash = await bcrypt.hash(body.newPassword, 12)
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            store: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    return NextResponse.json(user)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
    // Soft delete only — never hard delete users
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    })
    return NextResponse.json(user)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
