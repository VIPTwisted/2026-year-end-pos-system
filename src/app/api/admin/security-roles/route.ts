import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    roles: [
      { id: 'sysadmin',   label: 'System Administrator', users: 1,  system: true  },
      { id: 'finmgr',     label: 'Finance Manager',       users: 8  },
      { id: 'salesrep',   label: 'Sales Representative',  users: 24 },
      { id: 'purchagent', label: 'Purchasing Agent',       users: 6  },
      { id: 'hrmgr',      label: 'HR Manager',             users: 4  },
      { id: 'whworker',   label: 'Warehouse Worker',       users: 18 },
      { id: 'readonly',   label: 'Read Only',              users: 12 },
      { id: 'manager',    label: 'Manager',                users: 15 },
      { id: 'itadmin',    label: 'IT Administrator',       users: 3  },
      { id: 'approver',   label: 'Approver',               users: 9  },
    ],
  })
}
