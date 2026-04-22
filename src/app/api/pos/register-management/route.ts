import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/pos/register-management — stub; returns mock register data
// Replace with real DB queries when CashDrawer / RegisterShift models are available
export async function GET() {
  try {
    const registers = [
      {
        id: 'reg-1',
        name: 'Register 1',
        status: 'OPEN',
        cashier: 'Alice Chen',
        shiftOpened: '8:00 AM',
        cashSalesToday: 1247.82,
        transactionCount: 47,
      },
      {
        id: 'reg-2',
        name: 'Register 2',
        status: 'OPEN',
        cashier: 'James Rivera',
        shiftOpened: '9:15 AM',
        cashSalesToday: 893.44,
        transactionCount: 31,
      },
      {
        id: 'reg-3',
        name: 'Register 3',
        status: 'CLOSED',
        lastClosed: '2:30 PM',
        lastCashier: 'Maria Santos',
      },
      {
        id: 'reg-4',
        name: 'Register 4',
        status: 'CLOSED',
        lastClosed: '12:00 PM',
        lastCashier: 'Tom Bradley',
      },
    ]

    const drawerEvents = [
      { time: '8:00 AM',  register: 'REG-001', cashier: 'Alice Chen',   eventType: 'OPEN_SHIFT',   amount: 300,  reason: 'Shift start',     authBy: 'Manager' },
      { time: '9:15 AM',  register: 'REG-002', cashier: 'James Rivera', eventType: 'OPEN_SHIFT',   amount: 300,  reason: 'Shift start',     authBy: 'Manager' },
      { time: '10:02 AM', register: 'REG-001', cashier: 'Alice Chen',   eventType: 'OPEN_SALE',    amount: null, reason: 'TXN-001',         authBy: '' },
      { time: '10:45 AM', register: 'REG-001', cashier: 'Alice Chen',   eventType: 'SAFE_DROP',    amount: 500,  reason: 'Drawer too high', authBy: 'Mgr: Kim' },
      { time: '11:20 AM', register: 'REG-002', cashier: 'James Rivera', eventType: 'OPEN_NO_SALE', amount: null, reason: 'Change request',  authBy: '' },
      { time: '11:55 AM', register: 'REG-001', cashier: 'Alice Chen',   eventType: 'PAID_OUT',     amount: -25,  reason: 'Coffee supplies', authBy: 'Mgr: Kim' },
      { time: '12:00 PM', register: 'REG-004', cashier: 'Tom Bradley',  eventType: 'CLOSE_SHIFT',  amount: 487.50, reason: 'Shift end',    authBy: 'Manager' },
      { time: '1:10 PM',  register: 'REG-002', cashier: 'James Rivera', eventType: 'OPEN_SALE',    amount: null, reason: 'TXN-089',         authBy: '' },
      { time: '2:30 PM',  register: 'REG-003', cashier: 'Maria Santos', eventType: 'CLOSE_SHIFT',  amount: 602.10, reason: 'Shift end',    authBy: 'Manager' },
      { time: '2:47 PM',  register: 'REG-001', cashier: 'Alice Chen',   eventType: 'PAID_IN',      amount: 50,   reason: 'Petty cash',      authBy: 'Mgr: Kim' },
    ]

    return NextResponse.json({ registers, drawerEvents })
  } catch (e) {
    console.error('[pos/register-management GET]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
