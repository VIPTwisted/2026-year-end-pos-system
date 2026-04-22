import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const store = await prisma.shopifyStore.findUnique({
      where: { id: params.id },
      include: {
        store: { select: { id: true, name: true } },
        syncLogs: { orderBy: { startedAt: 'desc' }, take: 20 },
      },
    })
    if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(store)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { action, ...rest } = body

    if (action === 'sync-now') {
      const syncLog = await prisma.shopifySyncLog.create({
        data: {
          shopifyStoreId: params.id,
          syncType: rest.syncType || 'full',
          status: 'running',
        },
      })
      await prisma.shopifyStore.update({
        where: { id: params.id },
        data: { status: 'syncing' },
      })
      // Simulate sync completion
      await prisma.shopifySyncLog.update({
        where: { id: syncLog.id },
        data: { status: 'success', endedAt: new Date(), recordsSync: Math.floor(Math.random() * 100) + 1 },
      })
      const updated = await prisma.shopifyStore.update({
        where: { id: params.id },
        data: { status: 'connected', lastSyncAt: new Date() },
      })
      return NextResponse.json(updated)
    }

    if (action === 'disconnect') {
      const updated = await prisma.shopifyStore.update({
        where: { id: params.id },
        data: { status: 'disconnected', accessToken: null },
      })
      return NextResponse.json(updated)
    }

    // General settings update
    const updated = await prisma.shopifyStore.update({
      where: { id: params.id },
      data: {
        syncProducts: rest.syncProducts,
        syncCustomers: rest.syncCustomers,
        syncOrders: rest.syncOrders,
        syncInventory: rest.syncInventory,
        webhookSecret: rest.webhookSecret,
        storefrontToken: rest.storefrontToken,
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
