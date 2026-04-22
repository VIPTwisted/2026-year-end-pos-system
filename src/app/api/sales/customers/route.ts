import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    customers: [
      { no: 'C10000', name: 'The Cannon Group PLC', group: 'Large Corp', phone: '+1 555 0100', balance: 8432.10, creditLimit: 50000, blocked: '', rep: 'John Smith' },
      { no: 'C20000', name: 'Selangorian Ltd.', group: 'Import/Export', phone: '+44 20 0200', balance: 2184.90, creditLimit: 20000, blocked: '', rep: 'Alice Chen' },
      { no: 'C30000', name: 'Blanemark Inc.', group: 'Retail', phone: '+1 555 0300', balance: 0.00, creditLimit: 10000, blocked: '', rep: 'Bob Wilson' },
      { no: 'C40000', name: 'Trey Research', group: 'Technology', phone: '+1 555 0400', balance: 15200.00, creditLimit: 100000, blocked: 'Credit', rep: 'Carlos Mendez' },
      { no: 'C50000', name: 'School of Fine Art', group: 'Education', phone: '+1 555 0500', balance: 847.50, creditLimit: 5000, blocked: '', rep: 'Sarah Lopez' },
      { no: 'C60000', name: 'Fabrikam Inc', group: 'Manufacturing', phone: '+1 555 0600', balance: 24300.00, creditLimit: 80000, blocked: '', rep: 'Alice Chen' },
      { no: 'C70000', name: 'Adatum Corp', group: 'Distribution', phone: '+1 555 0700', balance: 8750.00, creditLimit: 40000, blocked: '', rep: 'Bob Wilson' },
      { no: 'C80000', name: 'Contoso Ltd', group: 'Large Corp', phone: '+1 555 0800', balance: -3200.00, creditLimit: 200000, blocked: '', rep: 'John Smith' },
      { no: 'C90000', name: 'Litware Inc', group: 'Technology', phone: '+1 555 0900', balance: 22100.00, creditLimit: 30000, blocked: 'Credit', rep: 'Carlos Mendez' },
      { no: 'C10100', name: 'Northwind Traders', group: 'Retail', phone: '+1 555 0101', balance: 12875.00, creditLimit: 60000, blocked: '', rep: 'Sarah Lopez' },
    ],
    total: 1247,
    page: 1,
    pageSize: 25,
  })
}
