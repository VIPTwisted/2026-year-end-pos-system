import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(_req: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        isActive: true,
        loyaltyPoints: true,
        createdAt: true,
      },
    })

    const headers = [
      'id',
      'firstName',
      'lastName',
      'email',
      'phone',
      'address',
      'city',
      'state',
      'zip',
      'isActive',
      'loyaltyPoints',
      'createdAt',
    ]

    const rows = customers.map(c => [
      escapeCSV(c.id),
      escapeCSV(c.firstName),
      escapeCSV(c.lastName),
      escapeCSV(c.email),
      escapeCSV(c.phone),
      escapeCSV(c.address),
      escapeCSV(c.city),
      escapeCSV(c.state),
      escapeCSV(c.zip),
      escapeCSV(c.isActive),
      escapeCSV(c.loyaltyPoints),
      escapeCSV(c.createdAt.toISOString()),
    ].join(','))

    const csv = [headers.join(','), ...rows].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
