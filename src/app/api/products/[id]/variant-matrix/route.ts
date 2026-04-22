import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const group = await prisma.productVariantGroup.findUnique({
    where: { productId: id },
    include: { dimensions: { orderBy: { sortOrder: 'asc' } }, variants: { orderBy: { createdAt: 'asc' } } },
  })
  return NextResponse.json(group)
}

// POST — creates or replaces variant group + regenerates variants from dimensions
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { dimensions, variants } = await req.json()

  // Delete existing group (cascade deletes dimensions + variants)
  await prisma.productVariantGroup.deleteMany({ where: { productId: id } })

  const group = await prisma.productVariantGroup.create({
    data: {
      productId: id,
      dimensions: {
        create: (dimensions as { name: string; values: string; sortOrder?: number }[]).map((d, i) => ({
          name: d.name,
          values: d.values,
          sortOrder: d.sortOrder ?? i,
        })),
      },
    },
    include: { dimensions: true },
  })

  const variantsToCreate = variants ?? generateMatrix(id, group.id, group.dimensions)

  await prisma.productVariant.createMany({ data: variantsToCreate })

  const result = await prisma.productVariantGroup.findUnique({
    where: { id: group.id },
    include: { dimensions: { orderBy: { sortOrder: 'asc' } }, variants: { orderBy: { createdAt: 'asc' } } },
  })
  return NextResponse.json(result, { status: 201 })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: _productId } = await params
  const { updates } = await req.json()
  const results = await Promise.all(
    (updates as { id: string; salePrice?: number; costPrice?: number; stockQty?: number; isActive?: boolean }[]).map(
      ({ id: vid, ...data }) => prisma.productVariant.update({ where: { id: vid }, data })
    )
  )
  return NextResponse.json(results)
}

type DimRecord = { name: string; values: string }

function generateMatrix(
  productId: string,
  groupId: string,
  dimensions: DimRecord[]
): { groupId: string; sku: string; dimensions: string; costPrice: number; salePrice: number; stockQty: number; isActive: boolean }[] {
  const dimArrays = dimensions.map(d => ({
    name: d.name,
    vals: d.values.split(',').map(v => v.trim()).filter(Boolean),
  }))
  const combos = cartesian(dimArrays.map(d => d.vals))
  return combos.map((combo, i) => {
    const dimMap: Record<string, string> = {}
    dimArrays.forEach((d, idx) => { dimMap[d.name] = combo[idx] })
    const suffix = combo.join('-').replace(/\s+/g, '').toUpperCase()
    return {
      groupId,
      sku: `${productId.slice(-6).toUpperCase()}-${suffix}-${i}`,
      dimensions: JSON.stringify(dimMap),
      costPrice: 0,
      salePrice: 0,
      stockQty: 0,
      isActive: true,
    }
  })
}

function cartesian(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>(
    (acc, arr) => acc.flatMap(combo => arr.map(v => [...combo, v])),
    [[]]
  )
}
