import { NextResponse } from 'next/server'

const STORES = [
  {
    id: 'STR001',
    number: '001',
    name: 'Chicago Flagship',
    manager: 'Rebecca Torres',
    city: 'Chicago',
    state: 'IL',
    status: 'Open',
    openHours: '9:00 AM – 9:00 PM',
    todaySales: 8420.5,
    terminalsOnline: 4,
    terminalsTotal: 4,
  },
  {
    id: 'STR002',
    number: '002',
    name: 'New York Midtown',
    manager: 'James Liu',
    city: 'New York',
    state: 'NY',
    status: 'Open',
    openHours: '8:00 AM – 10:00 PM',
    todaySales: 12340.0,
    terminalsOnline: 5,
    terminalsTotal: 5,
  },
  {
    id: 'STR003',
    number: '003',
    name: 'Los Angeles West',
    manager: 'Sofia Navarro',
    city: 'Los Angeles',
    state: 'CA',
    status: 'Open',
    openHours: '10:00 AM – 9:00 PM',
    todaySales: 9870.75,
    terminalsOnline: 3,
    terminalsTotal: 4,
  },
  {
    id: 'STR004',
    number: '004',
    name: 'Dallas Galleria',
    manager: 'Marcus Webb',
    city: 'Dallas',
    state: 'TX',
    status: 'Maintenance',
    openHours: '10:00 AM – 8:00 PM',
    todaySales: 3210.0,
    terminalsOnline: 2,
    terminalsTotal: 4,
  },
  {
    id: 'STR005',
    number: '005',
    name: 'Miami Brickell',
    manager: 'Alyssa Grant',
    city: 'Miami',
    state: 'FL',
    status: 'Open',
    openHours: '9:00 AM – 9:00 PM',
    todaySales: 7650.25,
    terminalsOnline: 3,
    terminalsTotal: 3,
  },
  {
    id: 'STR006',
    number: '006',
    name: 'Seattle Downtown',
    manager: 'Kevin Park',
    city: 'Seattle',
    state: 'WA',
    status: 'Closed',
    openHours: '10:00 AM – 8:00 PM',
    todaySales: 1399.0,
    terminalsOnline: 1,
    terminalsTotal: 4,
  },
]

const ALERTS = [
  {
    id: 'ALT001',
    storeId: 'STR003',
    storeNumber: '003',
    type: 'Equipment Offline',
    message: 'Receipt printer POS-03-02 offline — LA West',
    severity: 'warning',
    time: '14:32',
  },
  {
    id: 'ALT002',
    storeId: 'STR004',
    storeNumber: '004',
    type: 'Terminal Error',
    message: '2 terminals in maintenance mode — Dallas Galleria',
    severity: 'error',
    time: '11:05',
  },
]

export async function GET() {
  const todayRevenue = STORES.reduce((sum, s) => sum + s.todaySales, 0)
  const terminalsOnline = STORES.reduce((sum, s) => sum + s.terminalsOnline, 0)
  const terminalsTotal = STORES.reduce((sum, s) => sum + s.terminalsTotal, 0)

  return NextResponse.json({
    stores: STORES,
    kpis: {
      totalStores: STORES.length,
      terminalsOnline,
      terminalsTotal,
      todayRevenue,
      alertCount: ALERTS.length,
    },
    alerts: ALERTS,
  })
}
