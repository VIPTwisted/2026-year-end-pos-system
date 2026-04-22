export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',          symbol: '$',    rate: 1.00000, rateDate: 'Apr 22', rateType: 'Spot', rounding: '0.01', active: true  },
  { code: 'EUR', name: 'Euro',               symbol: '€',    rate: 1.08420, rateDate: 'Apr 22', rateType: 'Spot', rounding: '0.01', active: true  },
  { code: 'GBP', name: 'British Pound',      symbol: '£',    rate: 1.26340, rateDate: 'Apr 22', rateType: 'Spot', rounding: '0.01', active: true  },
  { code: 'CAD', name: 'Canadian Dollar',    symbol: 'CA$',  rate: 0.73980, rateDate: 'Apr 22', rateType: 'Spot', rounding: '0.01', active: true  },
  { code: 'JPY', name: 'Japanese Yen',       symbol: '¥',    rate: 0.00651, rateDate: 'Apr 22', rateType: 'Spot', rounding: '1',    active: true  },
  { code: 'MXN', name: 'Mexican Peso',       symbol: 'MX$',  rate: 0.05180, rateDate: 'Apr 22', rateType: 'Spot', rounding: '0.01', active: true  },
  { code: 'AUD', name: 'Australian Dollar',  symbol: 'A$',   rate: 0.64200, rateDate: 'Apr 22', rateType: 'Spot', rounding: '0.01', active: true  },
  { code: 'CHF', name: 'Swiss Franc',        symbol: 'CHF',  rate: 1.10890, rateDate: 'Apr 22', rateType: 'Spot', rounding: '0.01', active: true  },
  { code: 'CNY', name: 'Chinese Yuan',       symbol: '¥',    rate: 0.13810, rateDate: 'Apr 21', rateType: 'Spot', rounding: '0.01', active: true  },
  { code: 'BRL', name: 'Brazilian Real',     symbol: 'R$',   rate: 0.18340, rateDate: 'Apr 21', rateType: 'Spot', rounding: '0.01', active: true  },
  { code: 'INR', name: 'Indian Rupee',       symbol: '₹',    rate: 0.01200, rateDate: 'Apr 21', rateType: 'Spot', rounding: '0.01', active: true  },
  { code: 'HKD', name: 'Hong Kong Dollar',   symbol: 'HK$',  rate: 0.12800, rateDate: 'Apr 21', rateType: 'Spot', rounding: '0.01', active: true  },
]

export async function GET() {
  return NextResponse.json({
    baseCurrency: 'USD',
    activeCurrencies: 8,
    lastRateUpdate: 'Apr 22, 2026 10:30 AM',
    currencies: CURRENCIES,
  })
}
