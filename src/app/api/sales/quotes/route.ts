import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    quotes: [
      { id: '1', quoteNo: 'QT-2026-0892', date: 'Apr 1', validUntil: 'May 1', customer: 'Fabrikam Inc', contact: 'John Smith', amount: 45200, probability: 80, status: 'Sent', rep: 'Alice Chen' },
      { id: '2', quoteNo: 'QT-2026-0893', date: 'Apr 2', validUntil: 'May 2', customer: 'Adatum Corp', contact: 'Jane Doe', amount: 128500, probability: 60, status: 'Draft', rep: 'Bob Wilson' },
      { id: '3', quoteNo: 'QT-2026-0894', date: 'Apr 3', validUntil: 'Apr 25', customer: 'Contoso Ltd', contact: 'Mike Brown', amount: 8900, probability: 90, status: 'Won', rep: 'Alice Chen' },
      { id: '4', quoteNo: 'QT-2026-0895', date: 'Apr 4', validUntil: 'Apr 20', customer: 'Litware Inc', contact: 'Sarah Jones', amount: 22100, probability: 20, status: 'Expired', rep: 'Carlos Mendez' },
      { id: '5', quoteNo: 'QT-2026-0896', date: 'Apr 5', validUntil: 'May 5', customer: 'Northwind Traders', contact: 'David Lee', amount: 67400, probability: 75, status: 'Sent', rep: 'Bob Wilson' },
      { id: '6', quoteNo: 'QT-2026-0897', date: 'Apr 6', validUntil: 'May 6', customer: 'Alpine Ski House', contact: 'Emma White', amount: 14200, probability: 50, status: 'Draft', rep: 'Carlos Mendez' },
      { id: '7', quoteNo: 'QT-2026-0898', date: 'Apr 7', validUntil: 'May 7', customer: 'Wide World Importers', contact: 'Omar Khalid', amount: 215000, probability: 65, status: 'Sent', rep: 'Alice Chen' },
      { id: '8', quoteNo: 'QT-2026-0899', date: 'Apr 8', validUntil: 'May 8', customer: 'Trey Research', contact: 'Lisa Grant', amount: 31600, probability: 45, status: 'Draft', rep: 'Sarah Lopez' },
      { id: '9', quoteNo: 'QT-2026-0900', date: 'Apr 9', validUntil: 'May 9', customer: 'Tailspin Toys', contact: 'Paul Nguyen', amount: 5800, probability: 85, status: 'Won', rep: 'Bob Wilson' },
      { id: '10', quoteNo: 'QT-2026-0901', date: 'Apr 10', validUntil: 'Apr 30', customer: 'The Phone Company', contact: 'Nina Patel', amount: 42000, probability: 30, status: 'Lost', rep: 'Carlos Mendez' },
    ],
    total: 156,
    page: 1,
    pageSize: 20,
  })
}
