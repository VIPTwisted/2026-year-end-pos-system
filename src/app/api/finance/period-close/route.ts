import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    currentPeriod: 'April 2026',
    periodStatus: 'Open',
    closePercentage: 78,
    summary: {
      trialBalanceVariance: 0,
      openItems: 1,
      blockingIssues: 1,
    },
    checklist: {
      preClose: {
        total: 8,
        complete: 7,
        tasks: [
          { done: true, label: 'Post all open journals', user: 'jsmith', due: 'Apr 20', status: 'Complete' },
          { done: true, label: 'Reconcile bank accounts', user: 'adavis', due: 'Apr 20', status: 'Complete' },
          { done: true, label: 'Clear intercompany transactions', user: 'jsmith', due: 'Apr 21', status: 'Complete' },
          { done: true, label: 'Review open purchase orders', user: 'bwilson', due: 'Apr 21', status: 'Complete' },
          { done: true, label: 'Complete expense reports', user: 'adavis', due: 'Apr 21', status: 'Complete' },
          { done: true, label: 'Post depreciation', user: 'jsmith', due: 'Apr 22', status: 'Complete' },
          { done: true, label: 'Accrue unbilled revenue', user: 'jsmith', due: 'Apr 22', status: 'Complete' },
          { done: false, label: 'Management review sign-off', user: 'CFO', due: 'Apr 25', status: 'Pending' },
        ],
      },
      systemClose: {
        total: 4,
        complete: 0,
        locked: true,
        tasks: [
          { done: false, label: 'Run currency revaluation', user: 'System', due: 'Apr 26', status: 'Locked' },
          { done: false, label: 'Post closing entries', user: 'System', due: 'Apr 26', status: 'Locked' },
          { done: false, label: 'Generate trial balance', user: 'System', due: 'Apr 26', status: 'Locked' },
          { done: false, label: 'Lock accounting period', user: 'System', due: 'Apr 26', status: 'Locked' },
        ],
      },
      reporting: {
        total: 3,
        complete: 0,
        tasks: [
          { done: false, label: 'Generate P&L statement', user: 'adavis', due: 'Apr 28' },
          { done: false, label: 'Generate balance sheet', user: 'adavis', due: 'Apr 28' },
          { done: false, label: 'Distribute to stakeholders', user: 'CFO', due: 'Apr 30' },
        ],
      },
      postClose: {
        total: 2,
        complete: 0,
        tasks: [
          { done: false, label: 'Verify closed period in subledgers', user: 'jsmith', due: 'May 1' },
          { done: false, label: 'Archive period documents', user: 'adavis', due: 'May 2' },
        ],
      },
    },
    recentActivity: [
      { user: 'jsmith', action: 'Posted depreciation run for April 2026', time: 'Today 14:32' },
      { user: 'adavis', action: 'Completed expense report reconciliation', time: 'Today 13:18' },
      { user: 'bwilson', action: 'Reviewed & closed 47 open POs', time: 'Today 11:45' },
      { user: 'adavis', action: 'Bank reconciliation approved', time: 'Today 09:22' },
      { user: 'jsmith', action: 'Period close checklist opened for April 2026', time: 'Yesterday 17:05' },
    ],
  })
}
