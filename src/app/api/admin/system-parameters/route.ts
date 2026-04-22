export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

const SYSTEM_PARAMS = {
  general: {
    companyName: 'NovaPOS Demo Co.',
    legalName: 'NovaPOS Holdings LLC',
    taxRegistration: '12-3456789',
    primaryCurrency: 'USD',
    fiscalYearStart: 'January 1',
    timeZone: '(UTC-06:00) Central Time',
  },
  behavior: {
    auditLogging: true,
    approvalThreshold: 10000,
    electronicSignatures: false,
    maintenanceMode: false,
    defaultLanguage: 'English (US)',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: '1,234.56',
  },
  security: {
    passwordMinLength: 10,
    sessionTimeout: 30,
    maxFailedLogins: 5,
    mfaEnabled: true,
    ipWhitelist: '',
  },
  integration: {
    apiEndpoint: 'https://api.novapos.local',
    webhookUrl: '',
    apiKey: '***masked***',
  },
}

export async function GET() {
  return NextResponse.json(SYSTEM_PARAMS)
}
