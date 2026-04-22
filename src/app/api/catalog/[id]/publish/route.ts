import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const catalog = await prisma.ecomCatalog.update({
    where: { id },
    data: {
      status: 'published',
      publishedAt: new Date(),
    },
  })
  return NextResponse.json(catalog)
}
