import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    kpis: {
      openTransactions: 12,
      pendingReconciliation: 5,
      totalReceivables: 284120,
      totalPayables: 284120,
    },
    transactions: [
      { no:'IC-2026-0841', from:'USMF', to:'USRT', type:'Product Sale',    amount:'$84,200',  date:'Apr 22', status:'Open'       },
      { no:'IC-2026-0840', from:'USMF', to:'DEMF', type:'Service',         amount:'$12,400',  date:'Apr 21', status:'Posted'     },
      { no:'IC-2026-0839', from:'USRT', to:'USMF', type:'Loan Repayment',  amount:'$100,000', date:'Apr 20', status:'Posted'     },
      { no:'IC-2026-0838', from:'DEMF', to:'GBSI', type:'Product Sale',    amount:'€18,400',  date:'Apr 19', status:'Reconciled' },
      { no:'IC-2026-0837', from:'GBSI', to:'USMF', type:'Royalty',         amount:'£5,200',   date:'Apr 18', status:'Posted'     },
      { no:'IC-2026-0836', from:'USMF', to:'GBSI', type:'Management Fee',  amount:'$8,400',   date:'Apr 17', status:'Posted'     },
      { no:'IC-2026-0835', from:'USRT', to:'GBSI', type:'Consulting',      amount:'$9,600',   date:'Apr 16', status:'Open'       },
      { no:'IC-2026-0834', from:'DEMF', to:'USMF', type:'Dividend',        amount:'€20,000',  date:'Apr 14', status:'Reconciled' },
      { no:'IC-2026-0833', from:'USMF', to:'USRT', type:'IT Services',     amount:'$14,800',  date:'Apr 12', status:'Open'       },
      { no:'IC-2026-0832', from:'GBSI', to:'DEMF', type:'Loan Repayment',  amount:'£15,000',  date:'Apr 10', status:'Posted'     },
      { no:'IC-2026-0831', from:'USRT', to:'DEMF', type:'Cost Allocation', amount:'$22,100',  date:'Apr 8',  status:'Dispute'    },
      { no:'IC-2026-0830', from:'DEMF', to:'GBSI', type:'License Fee',     amount:'€11,500',  date:'Apr 5',  status:'Reconciled' },
    ],
    reconciliation: [
      { pair:'USMF ↔ USRT', balance:'$84,200 unreconciled', balanced: false },
      { pair:'USMF ↔ DEMF', balance:'$0 balanced',           balanced: true  },
      { pair:'USRT ↔ GBSI', balance:'$0 balanced',           balanced: true  },
      { pair:'DEMF ↔ GBSI', balance:'€11,500 unreconciled',  balanced: false },
    ],
    eliminations: [
      { entry:'EL-001', description:'USMF→USRT Product Sale elimination',   amount:'$84,200'  },
      { entry:'EL-002', description:'USRT→USMF Loan Repayment elimination', amount:'$100,000' },
      { entry:'EL-003', description:'DEMF→GBSI License Fee elimination',    amount:'€11,500'  },
      { entry:'EL-004', description:'GBSI→USMF Royalty elimination',        amount:'£5,200'   },
      { entry:'EL-005', description:'USMF→GBSI Management Fee elimination', amount:'$8,400'   },
    ],
  })
}
