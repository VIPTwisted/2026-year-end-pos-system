export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

const WORKFLOWS = [
  { id: 'WF-001', name: 'Purchase Order Approval',  module: 'Procurement', type: 'Approval', version: 'v3', status: 'Active',   createdBy: 'admin',      lastModified: 'Apr 10'  },
  { id: 'WF-002', name: 'Expense Report Approval',  module: 'Finance',     type: 'Approval', version: 'v2', status: 'Active',   createdBy: 'alice.chen', lastModified: 'Mar 15'  },
  { id: 'WF-003', name: 'Sales Quote Approval',     module: 'Sales',       type: 'Approval', version: 'v1', status: 'Active',   createdBy: 'bob.wilson', lastModified: 'Feb 28'  },
  { id: 'WF-004', name: 'Budget Plan Approval',     module: 'Finance',     type: 'Approval', version: 'v2', status: 'Active',   createdBy: 'alice.chen', lastModified: 'Jan 20'  },
  { id: 'WF-005', name: 'New Employee Onboarding',  module: 'HR',          type: 'Process',  version: 'v1', status: 'Active',   createdBy: 'maria.s',    lastModified: 'Dec 10'  },
  { id: 'WF-006', name: 'Vendor Onboarding',        module: 'Procurement', type: 'Process',  version: 'v1', status: 'Draft',    createdBy: 'bob.wilson', lastModified: 'Apr 18'  },
  { id: 'WF-007', name: 'Journal Entry Approval',   module: 'Finance',     type: 'Approval', version: 'v1', status: 'Draft',    createdBy: 'alice.chen', lastModified: 'Apr 20'  },
  { id: 'WF-008', name: 'Asset Disposal Approval',  module: 'Finance',     type: 'Approval', version: 'v1', status: 'Inactive', createdBy: 'admin',      lastModified: 'Oct 5'   },
  { id: 'WF-009', name: 'Credit Limit Approval',    module: 'Sales',       type: 'Approval', version: 'v2', status: 'Active',   createdBy: 'carlos.m',   lastModified: 'Mar 22'  },
  { id: 'WF-010', name: 'Return Order Approval',    module: 'Sales',       type: 'Approval', version: 'v1', status: 'Active',   createdBy: 'carlos.m',   lastModified: 'Feb 14'  },
  { id: 'WF-011', name: 'Payroll Approval',         module: 'HR',          type: 'Approval', version: 'v3', status: 'Active',   createdBy: 'maria.s',    lastModified: 'Apr 01'  },
  { id: 'WF-012', name: 'Invoice Posting',          module: 'Finance',     type: 'Process',  version: 'v2', status: 'Active',   createdBy: 'alice.chen', lastModified: 'Mar 30'  },
  { id: 'WF-013', name: 'Inventory Adjustment',     module: 'Inventory',   type: 'Approval', version: 'v1', status: 'Draft',    createdBy: 'kevin.p',    lastModified: 'Apr 19'  },
  { id: 'WF-014', name: 'Transfer Order Approval',  module: 'Inventory',   type: 'Approval', version: 'v1', status: 'Inactive', createdBy: 'admin',      lastModified: 'Sep 12'  },
  { id: 'WF-015', name: 'Customer Refund Approval', module: 'Sales',       type: 'Approval', version: 'v1', status: 'Active',   createdBy: 'carlos.m',   lastModified: 'Apr 05'  },
]

export async function GET() {
  return NextResponse.json({ workflows: WORKFLOWS })
}
