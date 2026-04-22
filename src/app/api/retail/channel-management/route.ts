export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    channels: [
      { id: 'c1', name: 'Chicago Flagship Store', type: 'Physical', status: 'Active', productsPublished: 2847, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sales today', metricValue: '$8,420' },
      { id: 'c2', name: 'New York Store', type: 'Physical', status: 'Active', productsPublished: 2847, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sales today', metricValue: '$6,230' },
      { id: 'c3', name: 'Los Angeles Store', type: 'Physical', status: 'Active', productsPublished: 2847, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sales today', metricValue: '$5,810' },
      { id: 'c4', name: 'Dallas Store', type: 'Physical', status: 'Active', productsPublished: 2847, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sales today', metricValue: '$4,120' },
      { id: 'c5', name: 'Miami Store', type: 'Physical', status: 'Active', productsPublished: 2847, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sales today', metricValue: '$3,840' },
      { id: 'c6', name: 'NovaPOS Online Store', type: 'Online', status: 'Active', productsPublished: 2341, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Orders today', metricValue: '47 orders' },
      { id: 'c7', name: 'Mobile App', type: 'Mobile', status: 'Active', productsPublished: 2341, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sessions today', metricValue: '1,240' },
      { id: 'c8', name: 'B2B Portal', type: 'Online', status: 'Inactive', productsPublished: 847, productsTotal: 2847, lastSync: '3 days ago', metricLabel: '', metricValue: '—' },
    ],
    kpis: {
      activeChannels: 8,
      onlineChannels: 3,
      physicalStores: 5,
      productsPublished: 2847,
      lastSync: '14 minutes ago',
    },
    syncLog: [
      { id: 's1', timestamp: 'Apr 22 10:45 AM', channel: 'NovaPOS Online Store', direction: 'Outbound', itemsSynced: 2341, errors: 0, duration: '1m 12s', status: 'Success' },
      { id: 's2', timestamp: 'Apr 22 10:30 AM', channel: 'Mobile App', direction: 'Outbound', itemsSynced: 2341, errors: 0, duration: '58s', status: 'Success' },
      { id: 's3', timestamp: 'Apr 22 10:00 AM', channel: 'Chicago Flagship Store', direction: 'Bidirectional', itemsSynced: 2847, errors: 0, duration: '2m 04s', status: 'Success' },
      { id: 's4', timestamp: 'Apr 22 9:45 AM', channel: 'New York Store', direction: 'Bidirectional', itemsSynced: 2847, errors: 0, duration: '1m 58s', status: 'Success' },
      { id: 's5', timestamp: 'Apr 22 9:30 AM', channel: 'Los Angeles Store', direction: 'Bidirectional', itemsSynced: 2847, errors: 0, duration: '2m 01s', status: 'Success' },
      { id: 's6', timestamp: 'Apr 22 9:00 AM', channel: 'Dallas Store', direction: 'Bidirectional', itemsSynced: 2844, errors: 3, duration: '2m 15s', status: 'Warning' },
      { id: 's7', timestamp: 'Apr 22 8:45 AM', channel: 'Miami Store', direction: 'Bidirectional', itemsSynced: 2847, errors: 0, duration: '1m 48s', status: 'Success' },
      { id: 's8', timestamp: 'Apr 22 8:00 AM', channel: 'B2B Portal', direction: 'Outbound', itemsSynced: 0, errors: 5, duration: '0m 12s', status: 'Error' },
    ],
  })
}
