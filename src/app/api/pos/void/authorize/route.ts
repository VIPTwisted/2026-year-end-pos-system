import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pin, reason, voidType } = body as {
      pin: unknown
      reason: unknown
      voidType: unknown
    }

    if (typeof pin !== 'string' || pin.length < 4) {
      return NextResponse.json({ authorized: false, reason: 'PIN must be at least 4 digits' })
    }
    if (typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json({ authorized: false, reason: 'Void reason is required' })
    }

    // Find active users with manager or admin role
    const managers = await prisma.user.findMany({
      where: { role: { in: ['admin', 'manager'] }, isActive: true },
      select: { id: true, name: true, role: true, passwordHash: true },
    })

    // Check PIN against manager passwordHash fields
    let authorizedBy: { id: string; name: string; role: string } | null = null
    for (const mgr of managers) {
      if (!mgr.passwordHash) continue
      // Try bcrypt compare (password is hashed)
      let match = false
      try {
        match = await bcrypt.compare(pin, mgr.passwordHash)
      } catch {
        // Fallback: plain text comparison for dev seeds
        match = mgr.passwordHash === pin
      }
      if (match) {
        authorizedBy = { id: mgr.id, name: mgr.name, role: mgr.role }
        break
      }
    }

    if (!authorizedBy) {
      return NextResponse.json({ authorized: false, reason: 'Invalid manager PIN' })
    }

    // Log the void authorization — non-fatal
    await prisma.auditLog.create({
      data: {
        tableName: voidType === 'transaction' ? 'Order' : 'OrderItem',
        recordId: 'POS',
        action: 'VOID_AUTHORIZED',
        userId: authorizedBy.id,
        metadata: JSON.stringify({ reason, voidType: String(voidType ?? ''), authorizedBy: authorizedBy.name }),
      },
    }).catch(() => {})

    return NextResponse.json({
      authorized: true,
      authorizedBy: authorizedBy.name,
      authorizerId: authorizedBy.id,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
