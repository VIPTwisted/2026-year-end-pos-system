import { NextResponse } from 'next/server'

export type DeviceStatus = 'Online' | 'Offline' | 'Warning'
export type DeviceType =
  | 'POS Terminal'
  | 'Cash Drawer'
  | 'Receipt Printer'
  | 'Barcode Scanner'
  | 'Payment Terminal'
  | 'Scale'

export interface Device {
  id: string
  type: DeviceType
  storeNumber: string
  storeName: string
  lastHeartbeat: string
  status: DeviceStatus
  version: string
  uptimeHistory: number[] // 7-day uptime % per day
}

const DEVICES: Device[] = [
  { id: 'DEV-CHI-001', type: 'POS Terminal',     storeNumber: '001', storeName: 'Chicago',    lastHeartbeat: '2 min ago',  status: 'Online',  version: '10.0.7',  uptimeHistory: [100, 100, 99, 100, 100, 100, 100] },
  { id: 'DEV-CHI-002', type: 'Cash Drawer',       storeNumber: '001', storeName: 'Chicago',    lastHeartbeat: '2 min ago',  status: 'Online',  version: '4.1.2',   uptimeHistory: [100, 100, 100, 100, 99, 100, 100] },
  { id: 'DEV-NYC-001', type: 'POS Terminal',     storeNumber: '002', storeName: 'New York',   lastHeartbeat: '1 min ago',  status: 'Online',  version: '10.0.7',  uptimeHistory: [98, 100, 100, 99, 100, 100, 100] },
  { id: 'DEV-NYC-002', type: 'Receipt Printer',  storeNumber: '002', storeName: 'New York',   lastHeartbeat: '1 min ago',  status: 'Online',  version: '3.2.1',   uptimeHistory: [100, 100, 98, 100, 100, 100, 100] },
  { id: 'DEV-LAX-001', type: 'POS Terminal',     storeNumber: '003', storeName: 'Los Angeles',lastHeartbeat: '3 min ago',  status: 'Online',  version: '10.0.7',  uptimeHistory: [99, 99, 100, 100, 100, 98, 100] },
  { id: 'DEV-LAX-002', type: 'Receipt Printer',  storeNumber: '003', storeName: 'Los Angeles',lastHeartbeat: '47 min ago', status: 'Warning', version: '3.1.9',   uptimeHistory: [100, 100, 100, 92, 100, 87, 95] },
  { id: 'DEV-DAL-001', type: 'Barcode Scanner',  storeNumber: '004', storeName: 'Dallas',     lastHeartbeat: '2 hr ago',   status: 'Offline', version: '2.0.4',   uptimeHistory: [100, 99, 100, 60, 0, 0, 42] },
  { id: 'DEV-DAL-002', type: 'Payment Terminal', storeNumber: '004', storeName: 'Dallas',     lastHeartbeat: '2 hr ago',   status: 'Offline', version: '5.3.1',   uptimeHistory: [100, 100, 100, 100, 0, 0, 55] },
  { id: 'DEV-MIA-001', type: 'POS Terminal',     storeNumber: '005', storeName: 'Miami',      lastHeartbeat: '1 min ago',  status: 'Online',  version: '10.0.7',  uptimeHistory: [100, 100, 100, 100, 100, 100, 100] },
  { id: 'DEV-MIA-002', type: 'Scale',            storeNumber: '005', storeName: 'Miami',      lastHeartbeat: '4 min ago',  status: 'Online',  version: '1.0.3',   uptimeHistory: [99, 100, 100, 100, 100, 100, 100] },
  { id: 'DEV-SEA-001', type: 'POS Terminal',     storeNumber: '006', storeName: 'Seattle',    lastHeartbeat: '6 min ago',  status: 'Warning', version: '10.0.6',  uptimeHistory: [100, 100, 90, 95, 100, 88, 94] },
  { id: 'DEV-SEA-002', type: 'Cash Drawer',      storeNumber: '006', storeName: 'Seattle',    lastHeartbeat: '6 min ago',  status: 'Online',  version: '4.1.1',   uptimeHistory: [100, 100, 100, 100, 100, 100, 100] },
]

export async function GET() {
  const online = DEVICES.filter(d => d.status === 'Online').length
  const offline = DEVICES.filter(d => d.status === 'Offline').length
  const warning = DEVICES.filter(d => d.status === 'Warning').length
  const pendingUpdates = DEVICES.filter(d => d.version !== '10.0.7' && d.type === 'POS Terminal').length + 3

  return NextResponse.json({
    devices: DEVICES,
    kpis: {
      devicesOnline: online,
      devicesTotal: DEVICES.length,
      devicesOffline: offline,
      devicesWarning: warning,
      pendingUpdates,
      openTickets: 2,
      lastSync: new Date().toISOString(),
    },
  })
}
