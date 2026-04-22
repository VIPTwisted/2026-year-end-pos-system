import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stores = await prisma.shopifyStore.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        store: { select: { id: true, name: true } },
        syncLogs: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    })
    return NextResponse.json(stores)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shopDomain, accessToken, storefrontToken, webhookSecret,
            syncProducts, syncCustomers, syncOrders, syncInventory, storeId } = body

    if (!shopDomain) {
      return NextResponse.json({ error: 'shopDomain is required' }, { status: 400 })
    }

    const shopifyStore = await prisma.shopifyStore.create({
      data: {
        shopDomain: shopDomain.trim().toLowerCase().replace(/https?:\/\//, ''),
        accessToken: accessToken || null,
        storefrontToken: storefrontToken || null,
        webhookSecret: webhookSecret || null,
        syncProducts: syncProducts ?? true,
        syncCustomers: syncCustomers ?? true,
        syncOrders: syncOrders ?? true,
        syncInventory: syncInventory ?? true,
        storeId: storeId || null,
        status: accessToken ? 'connected' : 'disconnected',
      },
    })

    return NextResponse.json(shopifyStore, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'A store with this domain already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
