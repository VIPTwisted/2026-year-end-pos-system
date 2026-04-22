import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const bundleInclude = {
  product: { select: { id: true, name: true, sku: true, salePrice: true, isActive: true } },
  components: {
    include: {
      product: { select: { id: true, name: true, sku: true, salePrice: true } },
    },
  },
} as const

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const bundle = await prisma.productBundle.findUnique({
      where: { id },
      include: bundleInclude,
    })
    if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(bundle)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      bundleType?: string
      isActive?: boolean
      addComponents?: { productId: string; quantity?: number; isOptional?: boolean }[]
      removeComponentIds?: string[]
      updateComponents?: { id: string; quantity?: number; isOptional?: boolean }[]
    }

    const existing = await prisma.productBundle.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (body.bundleType !== undefined) data.bundleType = body.bundleType
    if (body.isActive !== undefined) data.isActive = body.isActive

    if (body.removeComponentIds?.length) {
      await prisma.bundleComponent.deleteMany({
        where: { bundleId: id, id: { in: body.removeComponentIds } },
      })
    }

    if (body.addComponents?.length) {
      await prisma.bundleComponent.createMany({
        data: body.addComponents.map(c => ({
          bundleId: id,
          productId: c.productId,
          quantity: Number(c.quantity ?? 1),
          isOptional: c.isOptional ?? false,
        })),
      })
    }

    if (body.updateComponents?.length) {
      await Promise.all(
        body.updateComponents.map(c =>
          prisma.bundleComponent.update({
            where: { id: c.id },
            data: {
              ...(c.quantity !== undefined ? { quantity: Number(c.quantity) } : {}),
              ...(c.isOptional !== undefined ? { isOptional: c.isOptional } : {}),
            },
          }),
        ),
      )
    }

    const bundle = await prisma.productBundle.update({
      where: { id },
      data,
      include: bundleInclude,
    })
    return NextResponse.json(bundle)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const existing = await prisma.productBundle.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.productBundle.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
