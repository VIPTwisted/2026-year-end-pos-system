import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    kpis: {
      deferredRevenue: 2400000,
      recognizedThisMonth: 284000,
      schedulesActive: 47,
      nextRecognitionRun: 'Apr 30',
    },
    schedules: [
      { no:'RS-2026-001', customer:'Fabrikam Inc',  contract:'ERP Contract',    total:125000,  recognized:62500,  deferred:62500, start:'Jan 1',  end:'Jun 30', method:'Straight-Line', status:'Active' },
      { no:'RS-2026-002', customer:'Contoso Ltd',   contract:'Support SLA',     total:48000,   recognized:16000,  deferred:32000, start:'Jan 1',  end:'Dec 31', method:'Monthly',       status:'Active' },
      { no:'RS-2026-003', customer:'Adatum Corp',   contract:'License Fee',     total:200000,  recognized:200000, deferred:0,     start:'Apr 1',  end:'Apr 1',  method:'At Delivery',   status:'Completed' },
      { no:'RS-2026-004', customer:'Northwind',     contract:'Cloud Hosting',   total:36000,   recognized:9000,   deferred:27000, start:'Jan 1',  end:'Dec 31', method:'Monthly',       status:'Active' },
      { no:'RS-2026-005', customer:'Tailspin Toys', contract:'Dev Services',    total:85000,   recognized:42500,  deferred:42500, start:'Feb 1',  end:'Jul 31', method:'Straight-Line', status:'Active' },
      { no:'RS-2026-006', customer:'Woodgrove Bk',  contract:'Integration Pkg', total:60000,   recognized:60000,  deferred:0,     start:'Jan 1',  end:'Mar 31', method:'Milestone',     status:'Completed' },
      { no:'RS-2026-007', customer:'Lucerne Pub',   contract:'Print SaaS',      total:24000,   recognized:8000,   deferred:16000, start:'Jan 1',  end:'Dec 31', method:'Monthly',       status:'Active' },
      { no:'RS-2026-008', customer:'Alpine Ski',    contract:'Booking Engine',  total:150000,  recognized:0,      deferred:150000,start:'May 1',  end:'Apr 30', method:'Straight-Line', status:'Active' },
      { no:'RS-2026-009', customer:'Humongous Ins', contract:'Risk Module',     total:72000,   recognized:36000,  deferred:36000, start:'Jan 1',  end:'Dec 31', method:'Monthly',       status:'Suspended' },
      { no:'RS-2026-010', customer:'Bellows Coll',  contract:'LMS License',     total:18000,   recognized:18000,  deferred:0,     start:'Jan 1',  end:'Jan 1',  method:'At Delivery',   status:'Completed' },
      { no:'RS-2026-011', customer:'Fourth Coffee', contract:'POS SaaS',        total:42000,   recognized:10500,  deferred:31500, start:'Jan 1',  end:'Dec 31', method:'Monthly',       status:'Active' },
      { no:'RS-2026-012', customer:'Proseware Inc', contract:'Analytics Suite', total:95000,   recognized:0,      deferred:95000, start:'Jun 1',  end:'May 31', method:'Straight-Line', status:'Cancelled' },
    ],
    events: [
      { date:'Apr 20, 2026', no:'RS-2026-001', period:'Apr 2026', amount:10417, dr:'1200 · Deferred Rev', cr:'4000 · Revenue', status:'Posted' },
      { date:'Apr 20, 2026', no:'RS-2026-002', period:'Apr 2026', amount:4000,  dr:'1200 · Deferred Rev', cr:'4000 · Revenue', status:'Posted' },
      { date:'Apr 20, 2026', no:'RS-2026-007', period:'Apr 2026', amount:2000,  dr:'1200 · Deferred Rev', cr:'4000 · Revenue', status:'Posted' },
      { date:'Apr 20, 2026', no:'RS-2026-011', period:'Apr 2026', amount:3500,  dr:'1200 · Deferred Rev', cr:'4000 · Revenue', status:'Posted' },
      { date:'Apr 30, 2026', no:'RS-2026-004', period:'Apr 2026', amount:3000,  dr:'1200 · Deferred Rev', cr:'4000 · Revenue', status:'Pending' },
      { date:'Apr 30, 2026', no:'RS-2026-005', period:'Apr 2026', amount:14167, dr:'1200 · Deferred Rev', cr:'4000 · Revenue', status:'Pending' },
      { date:'Apr 30, 2026', no:'RS-2026-008', period:'Apr 2026', amount:12500, dr:'1200 · Deferred Rev', cr:'4000 · Revenue', status:'Pending' },
      { date:'May 1, 2026',  no:'RS-2026-009', period:'May 2026', amount:6000,  dr:'1200 · Deferred Rev', cr:'4000 · Revenue', status:'Pending' },
    ],
  })
}
