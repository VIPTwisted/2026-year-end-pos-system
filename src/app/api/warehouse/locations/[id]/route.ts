import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const location = await prisma.wmsLocation.findUnique({
    where: { id },
    include: {
      zones: {
        include: {
          racks: {
            include: {
              bins: {
                include: {
                  contents: {
                    include: { product: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!location) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 })
  }

  return NextResponse.json(location)
}
