import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const WORKERS = [
  { id: 'W001', empNo: 'EMP-001', fullName: 'John Williams', initials: 'JW', jobTitle: 'CEO', department: 'Executive', manager: '—', hireDate: 'Jan 12, 2020', status: 'Active', location: 'Chicago HQ', deptColor: '#6366f1' },
  { id: 'W002', empNo: 'EMP-002', fullName: 'Maria Santos', initials: 'MS', jobTitle: 'CFO', department: 'Finance', manager: 'John Williams', hireDate: 'Mar 5, 2021', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W003', empNo: 'EMP-003', fullName: 'David Kim', initials: 'DK', jobTitle: 'VP Operations', department: 'Operations', manager: 'John Williams', hireDate: 'Jun 22, 2019', status: 'Active', location: 'Chicago HQ', deptColor: '#f59e0b' },
  { id: 'W004', empNo: 'EMP-004', fullName: 'Alice Chen', initials: 'AC', jobTitle: 'Finance Manager', department: 'Finance', manager: 'Maria Santos', hireDate: 'Jan 8, 2022', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W005', empNo: 'EMP-005', fullName: 'Bob Wilson', initials: 'BW', jobTitle: 'Sr. Purchasing Agent', department: 'Procurement', manager: 'David Kim', hireDate: 'Apr 30, 2020', status: 'Active', location: 'Chicago HQ', deptColor: '#3b82f6' },
  { id: 'W006', empNo: 'EMP-006', fullName: 'Rachel Lopez', initials: 'RL', jobTitle: 'HR Manager', department: 'HR', manager: 'David Kim', hireDate: 'Sep 14, 2021', status: 'Active', location: 'Chicago HQ', deptColor: '#ec4899' },
  { id: 'W007', empNo: 'EMP-007', fullName: 'Carlos Mendez', initials: 'CM', jobTitle: 'Sales Rep', department: 'Sales', manager: 'David Kim', hireDate: 'Feb 17, 2023', status: 'Active', location: 'New York', deptColor: '#8b5cf6' },
  { id: 'W008', empNo: 'EMP-008', fullName: 'Sarah Kim', initials: 'SK', jobTitle: 'IT Admin', department: 'IT', manager: 'David Kim', hireDate: 'Nov 3, 2022', status: 'Active', location: 'Remote', deptColor: '#06b6d4' },
  { id: 'W009', empNo: 'EMP-009', fullName: 'Tom Jackson', initials: 'TJ', jobTitle: 'Sr. Accountant', department: 'Finance', manager: 'Alice Chen', hireDate: 'Aug 22, 2020', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W010', empNo: 'EMP-010', fullName: 'Mary Lee', initials: 'ML', jobTitle: 'Payroll Specialist', department: 'Finance', manager: 'Alice Chen', hireDate: 'Jul 1, 2023', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W011', empNo: 'EMP-011', fullName: 'James Parker', initials: 'JP', jobTitle: 'Sr. Sales Rep', department: 'Sales', manager: 'David Kim', hireDate: 'Mar 15, 2020', status: 'Active', location: 'New York', deptColor: '#8b5cf6' },
  { id: 'W012', empNo: 'EMP-012', fullName: 'Priya Sharma', initials: 'PS', jobTitle: 'Procurement Analyst', department: 'Procurement', manager: 'Bob Wilson', hireDate: 'Oct 11, 2022', status: 'Active', location: 'Chicago HQ', deptColor: '#3b82f6' },
  { id: 'W013', empNo: 'EMP-013', fullName: "Kevin O'Brien", initials: 'KO', jobTitle: 'HR Generalist', department: 'HR', manager: 'Rachel Lopez', hireDate: 'Jan 25, 2023', status: 'Active', location: 'Chicago HQ', deptColor: '#ec4899' },
  { id: 'W014', empNo: 'EMP-014', fullName: 'Diana Foster', initials: 'DF', jobTitle: 'IT Systems Admin', department: 'IT', manager: 'Sarah Kim', hireDate: 'Jun 5, 2021', status: 'On Leave', location: 'Remote', deptColor: '#06b6d4' },
  { id: 'W015', empNo: 'EMP-015', fullName: 'Marcus Johnson', initials: 'MJ', jobTitle: 'Operations Analyst', department: 'Operations', manager: 'David Kim', hireDate: 'Sep 9, 2020', status: 'Active', location: 'Chicago HQ', deptColor: '#f59e0b' },
  { id: 'W016', empNo: 'EMP-016', fullName: 'Elena Vasquez', initials: 'EV', jobTitle: 'Sales Manager', department: 'Sales', manager: 'David Kim', hireDate: 'Feb 1, 2019', status: 'Active', location: 'Los Angeles', deptColor: '#8b5cf6' },
  { id: 'W017', empNo: 'EMP-017', fullName: 'Nathan Reed', initials: 'NR', jobTitle: 'Financial Analyst', department: 'Finance', manager: 'Alice Chen', hireDate: 'Aug 14, 2023', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W018', empNo: 'EMP-018', fullName: 'Olivia Brooks', initials: 'OB', jobTitle: 'Marketing Coordinator', department: 'Sales', manager: 'Elena Vasquez', hireDate: 'Apr 3, 2022', status: 'On Leave', location: 'New York', deptColor: '#8b5cf6' },
  { id: 'W019', empNo: 'EMP-019', fullName: 'Raj Patel', initials: 'RP', jobTitle: 'Sr. IT Developer', department: 'IT', manager: 'Sarah Kim', hireDate: 'Nov 28, 2020', status: 'Active', location: 'Remote', deptColor: '#06b6d4' },
  { id: 'W020', empNo: 'EMP-020', fullName: 'Chloe Bennett', initials: 'CB', jobTitle: 'Supply Chain Analyst', department: 'Operations', manager: 'David Kim', hireDate: 'Jan 16, 2024', status: 'Active', location: 'Chicago HQ', deptColor: '#f59e0b' },
  { id: 'W021', empNo: 'EMP-021', fullName: 'Tyler Hudson', initials: 'TH', jobTitle: 'Accounts Receivable', department: 'Finance', manager: 'Alice Chen', hireDate: 'Mar 22, 2021', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W022', empNo: 'EMP-022', fullName: 'Samantha Wright', initials: 'SW', jobTitle: 'Talent Acquisition', department: 'HR', manager: 'Rachel Lopez', hireDate: 'Jul 7, 2022', status: 'Active', location: 'Chicago HQ', deptColor: '#ec4899' },
  { id: 'W023', empNo: 'EMP-023', fullName: 'Derek Cole', initials: 'DC', jobTitle: 'Procurement Manager', department: 'Procurement', manager: 'David Kim', hireDate: 'Oct 1, 2018', status: 'Active', location: 'Chicago HQ', deptColor: '#3b82f6' },
  { id: 'W024', empNo: 'EMP-024', fullName: 'Fatima Hassan', initials: 'FH', jobTitle: 'Sr. Sales Analyst', department: 'Sales', manager: 'Elena Vasquez', hireDate: 'May 19, 2022', status: 'Active', location: 'New York', deptColor: '#8b5cf6' },
  { id: 'W025', empNo: 'EMP-025', fullName: 'Greg Monroe', initials: 'GM', jobTitle: 'Operations Manager', department: 'Operations', manager: 'David Kim', hireDate: 'Feb 14, 2017', status: 'Terminated', location: 'Chicago HQ', deptColor: '#f59e0b' },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const department = searchParams.get('department')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let workers = [...WORKERS]
  if (department) workers = workers.filter(w => w.department === department)
  if (status) workers = workers.filter(w => w.status === status)
  if (search) workers = workers.filter(w =>
    w.fullName.toLowerCase().includes(search.toLowerCase()) ||
    w.empNo.toLowerCase().includes(search.toLowerCase()) ||
    w.jobTitle.toLowerCase().includes(search.toLowerCase())
  )

  return NextResponse.json({ workers, total: 342, page: 1, pageSize: 25 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newWorker = {
    id: `W${String(WORKERS.length + 1).padStart(3, '0')}`,
    empNo: `EMP-${String(WORKERS.length + 1).padStart(3, '0')}`,
    ...body,
    status: 'Active',
    deptColor: '#6366f1',
  }
  return NextResponse.json({ worker: newWorker }, { status: 201 })
}
