import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const shift = await prisma.posShift.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, name: true } },
        orders: { include: { payments: true } },
      },
    })
    if (!shift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    return NextResponse.json({ shift })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { closeFloat, closeDenominations, alertRecipients } = body
    const shift = await prisma.posShift.findUnique({ where: { id } })
    if (!shift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 })

    // Compute actual cash from denominations if provided
    const actualCash = closeDenominations
      ? Object.entries(closeDenominations as Record<string, number>).reduce(
          (s, [k, v]) => s + parseFloat(k) * v,
          0
        )
      : parseFloat(closeFloat ?? '0') || 0

    const expectedCash = shift.openFloat + shift.cashSales - shift.voidAmount
    const variance = actualCash - expectedCash
    const varianceAmt = Math.abs(variance)

    const updated = await prisma.posShift.update({
      where: { id },
      data: {
        status: 'closed',
        closeTime: new Date(),
        closeFloat: actualCash,
        closeDenominations: closeDenominations ? JSON.stringify(closeDenominations) : null,
        expectedCash,
        variance,
        varianceAlerted: varianceAmt > 0,
      },
    })

    // Create variance alert record if off by more than $0.01
    if (varianceAmt > 0.01) {
      await prisma.shiftVarianceAlert.create({
        data: {
          shiftId: id,
          cashierName: shift.cashierName,
          registerId: shift.registerId,
          storeId: shift.storeId,
          expected: expectedCash,
          actual: actualCash,
          variance,
          recipients: JSON.stringify(alertRecipients ?? ['accounting', 'manager']),
        },
      })

      // Fetch alert config and dispatch notifications
      try {
        const config = await prisma.posAlertConfig.findFirst()
        if (config && (config.notifyEmail || config.notifyBoth)) {
          const emailRecipients: string[] = JSON.parse(config.emailRecipients || '[]')
          if (emailRecipients.length > 0 && config.smtpUser && config.smtpPass) {
            const { sendVarianceAlert } = await import('@/lib/email')
            await sendVarianceAlert(emailRecipients, {
              cashierName: shift.cashierName,
              registerId: shift.registerId,
              storeId: shift.storeId,
              expected: expectedCash,
              actual: actualCash,
              variance,
              openTime: shift.openTime,
              closeTime: new Date(),
            }, {
              host: config.smtpHost,
              port: config.smtpPort,
              user: config.smtpUser,
              pass: config.smtpPass,
              from: config.smtpFrom,
            })
          }
        }
      } catch { /* never let email failure break the shift close */ }
    }

    return NextResponse.json({ shift: updated, variance, expectedCash, actualCash })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
