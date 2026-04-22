export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    batches: [
      { name: 'GJ-2026-041', desc: 'April Accruals', lines: 24, status: 'Draft', postedBy: 'Alice Chen', modified: 'Apr 22' },
      { name: 'GJ-2026-040', desc: 'Depreciation Run', lines: 12, status: 'Pending Approval', postedBy: 'System', modified: 'Apr 21' },
      { name: 'GJ-2026-039', desc: 'Intercompany Reclass', lines: 8, status: 'Posted', postedBy: 'Bob Wilson', modified: 'Apr 20' },
      { name: 'GJ-2026-038', desc: 'Month-End Accruals', lines: 36, status: 'Posted', postedBy: 'Alice Chen', modified: 'Apr 19' },
    ],
    summary: {
      totalDraft: 1,
      totalPendingApproval: 1,
      totalPosted: 6,
      totalRejected: 1,
    },
  })
}
