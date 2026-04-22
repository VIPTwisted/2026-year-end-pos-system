import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const providers = await prisma.siteAuthProvider.findMany({
      where: { siteId: id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(providers)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch auth providers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { providerName, providerType, clientId, tenantId } = body

    if (!providerName || !providerType) {
      return NextResponse.json({ error: 'providerName and providerType required' }, { status: 400 })
    }

    const provider = await prisma.siteAuthProvider.create({
      data: { siteId: id, providerName, providerType, clientId, tenantId },
    })
    return NextResponse.json(provider, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create auth provider' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const providerId = searchParams.get('providerId')
    if (!providerId) return NextResponse.json({ error: 'providerId required' }, { status: 400 })

    await prisma.siteAuthProvider.deleteMany({ where: { id: providerId, siteId: id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete auth provider' }, { status: 500 })
  }
}
