import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const categoryId = sp.get('categoryId')
    const search = sp.get('search')

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { sku: { contains: search } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        sku: true,
        costPrice: true,
        salePrice: true,
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(products)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { updates: { id: string; newPrice: number }[] }

    if (!Array.isArray(body.updates) || body.updates.length === 0) {
      return NextResponse.json({ error: 'updates array is required' }, { status: 400 })
    }

    const results = await prisma.$transaction(
      body.updates.map(({ id, newPrice }) =>
        prisma.product.update({
          where: { id },
          data: { salePrice: newPrice },
          select: { id: true, name: true, salePrice: true },
        })
      )
    )

    return NextResponse.json({ updated: results.length, products: results })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
