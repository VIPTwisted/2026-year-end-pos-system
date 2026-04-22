import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const countries = await prisma.countryConfig.findMany({ orderBy: { countryName: 'asc' } })
  return NextResponse.json(countries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { countryCode, countryName, currencyCode, defaultLanguage, taxRegionId, dateFormat, addressFormat, phoneFormat } = body
  if (!countryCode || !countryName) {
    return NextResponse.json({ error: 'countryCode and countryName required' }, { status: 400 })
  }
  const country = await prisma.countryConfig.create({
    data: {
      countryCode: countryCode.toUpperCase(),
      countryName,
      currencyCode: currencyCode ?? 'USD',
      defaultLanguage: defaultLanguage ?? 'en-US',
      taxRegionId: taxRegionId ?? null,
      dateFormat: dateFormat ?? 'MM/DD/YYYY',
      addressFormat: addressFormat ?? 'standard',
      phoneFormat: phoneFormat ?? null,
      isActive: true,
    },
  })
  return NextResponse.json(country, { status: 201 })
}
