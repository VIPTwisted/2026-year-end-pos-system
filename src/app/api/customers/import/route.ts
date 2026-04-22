import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] ?? '' }), {} as Record<string, string>)
  })
}

function parseBool(val: string): boolean {
  const v = val.trim().toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const text = await (file as File).text()
    const rows = parseCSV(text)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV is empty or missing header row' }, { status: 400 })
    }

    let imported = 0
    let updated = 0
    const errors: { row: number; message: string }[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // 1-based, +1 for header

      const firstName = (row['firstName'] ?? '').trim()
      const lastName = (row['lastName'] ?? '').trim()

      if (!firstName && !lastName) {
        errors.push({ row: rowNum, message: 'firstName or lastName is required' })
        continue
      }

      const email = (row['email'] ?? '').trim() || null

      const loyaltyRaw = (row['loyaltyPoints'] ?? '').trim()
      const loyaltyPoints = loyaltyRaw !== '' ? parseInt(loyaltyRaw, 10) : 0
      if (loyaltyRaw !== '' && isNaN(loyaltyPoints)) {
        errors.push({ row: rowNum, message: `Invalid loyaltyPoints value: "${loyaltyRaw}"` })
        continue
      }

      const isActiveRaw = (row['isActive'] ?? '').trim()
      const isActive = isActiveRaw !== '' ? parseBool(isActiveRaw) : true

      const data = {
        firstName: firstName || ' ',
        lastName: lastName || ' ',
        email,
        phone: (row['phone'] ?? '').trim() || null,
        address: (row['address'] ?? '').trim() || null,
        city: (row['city'] ?? '').trim() || null,
        state: (row['state'] ?? '').trim() || null,
        zip: (row['zip'] ?? '').trim() || null,
        notes: (row['notes'] ?? '').trim() || null,
        loyaltyPoints,
        isActive,
      }

      try {
        if (email) {
          const existing = await prisma.customer.findUnique({ where: { email } })
          if (existing) {
            await prisma.customer.update({ where: { email }, data })
            updated++
          } else {
            await prisma.customer.create({ data })
            imported++
          }
        } else {
          await prisma.customer.create({ data })
          imported++
        }
      } catch (rowErr) {
        const msg = rowErr instanceof Error ? rowErr.message : 'Unknown error'
        errors.push({ row: rowNum, message: msg })
      }
    }

    return NextResponse.json({ imported, updated, errors })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
