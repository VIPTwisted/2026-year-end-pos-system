import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export interface VendorPaymentInvoice {
  id: string
  number: string
  vendor: string
  dueDate: string
  currency: string
  amount: number
  balance: number
}

const MOCK_INVOICES: VendorPaymentInvoice[] = [
  { id: '1',  number: 'inv62811', vendor: 'Acme Office Supplies',       dueDate: '1/11/2013',  currency: 'USD', amount: 179800.00, balance: -179800.00 },
  { id: '2',  number: 'inv62812', vendor: 'City Power & Light',          dueDate: '2/15/2013',  currency: 'USD', amount:  42500.00, balance:  -42500.00 },
  { id: '3',  number: 'inv62813', vendor: 'City-wide Advertising',       dueDate: '3/01/2013',  currency: 'USD', amount:  28750.00, balance:  -28750.00 },
  { id: '4',  number: 'inv62814', vendor: 'Contoso Asia',                dueDate: '3/22/2013',  currency: 'USD', amount:  95000.00, balance:  -95000.00 },
  { id: '5',  number: 'inv62815', vendor: 'Contoso Asia',                dueDate: '4/05/2013',  currency: 'USD', amount:  67250.00, balance:  -67250.00 },
  { id: '6',  number: 'inv62816', vendor: 'Contoso Chemicals Japan',     dueDate: '4/18/2013',  currency: 'JPY', amount: 512000.00, balance: -512000.00 },
  { id: '7',  number: 'inv62817', vendor: 'Contoso Asia',                dueDate: '5/03/2013',  currency: 'USD', amount:  31400.00, balance:  -31400.00 },
  { id: '8',  number: 'inv62818', vendor: 'Datum Receivers',             dueDate: '5/14/2013',  currency: 'USD', amount: 118900.00, balance: -118900.00 },
  { id: '9',  number: 'inv62819', vendor: 'Fabrikam Electronics',        dueDate: '5/28/2013',  currency: 'USD', amount:  73600.00, balance:  -73600.00 },
  { id: '10', number: 'inv62820', vendor: 'Fabrikam Electronics',        dueDate: '6/10/2013',  currency: 'USD', amount: 245000.00, balance: -245000.00 },
  { id: '11', number: 'inv62821', vendor: 'Fabrikam Supplier',           dueDate: '6/22/2013',  currency: 'USD', amount:  54300.00, balance:  -54300.00 },
  { id: '12', number: 'inv62822', vendor: 'Fabrikam Electronics',        dueDate: '7/08/2013',  currency: 'USD', amount:  88750.00, balance:  -88750.00 },
  { id: '13', number: 'inv62823', vendor: 'Acme Office Supplies',        dueDate: '7/20/2013',  currency: 'USD', amount:  22100.00, balance:  -22100.00 },
  { id: '14', number: 'inv62824', vendor: 'Contoso Chemicals Japan',     dueDate: '8/01/2013',  currency: 'JPY', amount: 390000.00, balance: -390000.00 },
  { id: '15', number: 'inv62825', vendor: 'Datum Receivers',             dueDate: '8/14/2013',  currency: 'USD', amount:  61800.00, balance:  -61800.00 },
]

export async function GET() {
  return NextResponse.json({ invoices: MOCK_INVOICES })
}
