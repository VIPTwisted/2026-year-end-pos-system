import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const variants = await prisma.productVariant.findMany({
    where: { productId: id },
    include: {
      attributes: {
        include: {
          attributeValue: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(variants)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const variant = await prisma.productVariant.create({
    data: {
      productId: id,
      variantCode: body.variantCode,
      description: body.description ?? null,
      sku: body.sku ?? null,
      barcode: body.barcode ?? null,
      priceOffset: body.priceOffset ?? 0,
      costOffset: body.costOffset ?? 0,
      isActive: body.isActive ?? true,
      attributes: body.attributeAssignments
        ? {
            create: body.attributeAssignments.map((a: { attributeId: string; value: string }) => ({
              attributeId: a.attributeId,
              value: a.value,
            })),
          }
        : undefined,
    },
    include: {
      attributes: {
        include: {
          attributeValue: true,
        },
      },
    },
  })
  return NextResponse.json(variant, { status: 201 })
}
