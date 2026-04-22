import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    entities: [
      {
        id: 'USMF',
        companyName: 'NovaPOS Demo Co. (US Manufacturing)',
        legalName: 'NovaPOS Holdings LLC',
        taxId: '12-3456789',
        vat: 'N/A',
        phone: '+1 312 555 0100',
        fax: '+1 312 555 0101',
        email: 'info@novapos.local',
        website: 'https://novapos.local',
        duns: '04-123-4567',
        address: {
          street: '123 Innovation Drive',
          suite: 'Suite 400',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
          country: 'United States',
          timezone: '(UTC-06:00) Central Time (US & Canada)',
        },
        fiscal: {
          year: 'Calendar Year (Jan 1 – Dec 31)',
          currentPeriod: 'April 2026',
          accountingCurrency: 'USD',
          reportingCurrency: 'USD',
          exchangeRateType: 'Average',
        },
        bank: {
          name: 'JPMorgan Chase Checking-001',
          routing: '021000021',
          account: '****7890',
        },
      },
    ],
  })
}
