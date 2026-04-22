export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  const data = {
    kpis: {
      totalOrders: 642,
      onTimeInFullPct: 82,
      incompletePct: 6,
      earlyPct: 6,
      latePct: 8,
    },
    byDate: [
      { label: 'Apr 2016', onTime: 42, early: 8, late: 6, incomplete: 4, linePct: 84 },
      { label: 'May 2016', onTime: 38, early: 6, late: 5, incomplete: 3, linePct: 83 },
      { label: 'Jun 2016', onTime: 45, early: 9, late: 7, incomplete: 5, linePct: 82 },
      { label: 'Jul 2016', onTime: 50, early: 10, late: 8, incomplete: 6, linePct: 80 },
      { label: 'Aug 2016', onTime: 44, early: 7, late: 6, incomplete: 4, linePct: 81 },
      { label: 'Sep 2016', onTime: 39, early: 5, late: 4, incomplete: 3, linePct: 85 },
      { label: 'Oct 2016', onTime: 48, early: 8, late: 7, incomplete: 5, linePct: 83 },
      { label: 'Nov 2016', onTime: 52, early: 11, late: 9, incomplete: 6, linePct: 82 },
      { label: 'Dec 2016', onTime: 46, early: 9, late: 8, incomplete: 5, linePct: 81 },
      { label: 'Jan 2017', onTime: 41, early: 7, late: 5, incomplete: 3, linePct: 84 },
      { label: 'Feb 2017', onTime: 37, early: 6, late: 4, incomplete: 3, linePct: 86 },
    ],
    byProduct: [
      { label: 'Audio Products', onTime: 220, early: 40, late: 30, incomplete: 20 },
      { label: 'Car Audio Products', onTime: 310, early: 55, late: 45, incomplete: 30 },
    ],
    plannedByDate: [
      { label: 'Mar 2017', onTime: 4, early: 1, late: 1, incomplete: 0, linePct: 80 },
      { label: 'Apr 2017', onTime: 6, early: 2, late: 1, incomplete: 1, linePct: 75 },
      { label: 'May 2017', onTime: 5, early: 1, late: 1, incomplete: 0, linePct: 83 },
      { label: 'Jun 2017', onTime: 7, early: 2, late: 2, incomplete: 1, linePct: 78 },
      { label: 'Jul 2017', onTime: 4, early: 1, late: 0, incomplete: 0, linePct: 89 },
    ],
    bottom10: [
      { itemId: 'D0111', productName: 'Ruggedized Laser Projector', onTimeInFull: 35, totalOrders: 52, pct: 67.3 },
      { itemId: 'D0002', productName: 'Cabinet', onTimeInFull: 186, totalOrders: 230, pct: 80.9 },
      { itemId: 'D0005', productName: 'Car Audio System', onTimeInFull: 151, totalOrders: 180, pct: 83.9 },
      { itemId: 'D0001', productName: 'MidRangeSpeaker', onTimeInFull: 155, totalOrders: 180, pct: 86.1 },
    ],
    itemGroups: ['(Blank)', 'Audio Products', 'Audio Raw Materials', 'Car Audio Products'],
    products: [
      'A. Datum 50W Car Ra...',
      'AcousticFoamPanel',
      'Active speaker',
      'Aluminium Cabinet',
      'Amplifier',
      'Bass cabinet',
      'Binding posts',
      'Black paint - Gallon c...',
      'Cabinet',
    ],
  }

  return NextResponse.json(data)
}
