import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const courses = [
  { id: 1,  name: 'Workplace Safety 2026',        category: 'Compliance',  duration: '2 hrs',   format: 'Online',    instructor: 'HR Team',      enrolled: 342, completions: 330, mandatory: true,  status: 'Active' },
  { id: 2,  name: 'Data Privacy (GDPR)',           category: 'Compliance',  duration: '1.5 hrs', format: 'Online',    instructor: 'Legal',        enrolled: 342, completions: 338, mandatory: true,  status: 'Active' },
  { id: 3,  name: 'Leadership Essentials',         category: 'Development', duration: '8 hrs',   format: 'In-Person', instructor: 'Ext. Trainer', enrolled: 12,  completions: 10,  mandatory: false, status: 'Active' },
  { id: 4,  name: 'Excel Advanced',               category: 'Technical',   duration: '4 hrs',   format: 'Online',    instructor: 'IT Dept',      enrolled: 24,  completions: 18,  mandatory: false, status: 'Active' },
  { id: 5,  name: 'Customer Service Excellence',  category: 'Skills',      duration: '3 hrs',   format: 'Online',    instructor: 'Sales',        enrolled: 45,  completions: 40,  mandatory: false, status: 'Active' },
]

const deptCompliance = [
  { dept: 'Finance',       pct: 98  },
  { dept: 'Operations',    pct: 94  },
  { dept: 'Sales',         pct: 87  },
  { dept: 'IT',            pct: 96  },
  { dept: 'HR',            pct: 100 },
  { dept: 'Manufacturing', pct: 82  },
]

export async function GET() {
  return NextResponse.json({
    courses,
    deptCompliance,
    kpis: { activeCourses: 18, enrolled: 124, completionsYTD: 287, complianceDue: 12 },
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  return NextResponse.json({ success: true, data: body }, { status: 201 })
}
