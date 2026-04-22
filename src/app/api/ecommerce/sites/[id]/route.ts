import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const site = await prisma.ecommerceSite.findUnique({
      where: { id },
      include: {
        bindings: { orderBy: { createdAt: 'asc' } },
        pages: { orderBy: { createdAt: 'desc' } },
        deployments: { orderBy: { createdAt: 'desc' } },
        authProviders: { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    return NextResponse.json(site)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch site' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const site = await prisma.ecommerceSite.update({
      where: { id },
      data: {
        siteName: body.siteName,
        description: body.description,
        defaultLocale: body.defaultLocale,
        theme: body.theme,
        cdnUrl: body.cdnUrl,
        faviconUrl: body.faviconUrl,
        robotsTxt: body.robotsTxt,
        status: body.status,
      },
    })
    return NextResponse.json(site)
  } catch {
    return NextResponse.json({ error: 'Failed to update site' }, { status: 500 })
  }
}
