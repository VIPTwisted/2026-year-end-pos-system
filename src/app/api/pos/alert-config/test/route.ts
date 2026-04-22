import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVarianceAlert } from '@/lib/email'

export async function POST() {
  try {
    const config = await prisma.posAlertConfig.findFirst()
    if (!config || !config.smtpUser || !config.smtpPass) {
      return NextResponse.json({ error: 'SMTP not configured' }, { status: 400 })
    }
    const recipients: string[] = JSON.parse(config.emailRecipients || '[]')
    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No email recipients configured' }, { status: 400 })
    }
    const result = await sendVarianceAlert(
      recipients,
      {
        cashierName: 'Test Cashier',
        registerId: 'REG-01',
        storeId: 'test',
        expected: 200.00,
        actual: 187.50,
        variance: -12.50,
      },
      {
        host: config.smtpHost,
        port: config.smtpPort,
        user: config.smtpUser,
        pass: config.smtpPass,
        from: config.smtpFrom,
      }
    )
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
