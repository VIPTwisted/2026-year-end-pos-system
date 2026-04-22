import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const reviews = [
  { id: 1,  employee: 'Alice Chen',       period: 'Q1 2026',    type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 30', status: 'In Progress', rating: null    },
  { id: 2,  employee: 'Bob Wilson',       period: 'Q1 2026',    type: 'Quarterly', manager: 'David Kim',    dueDate: 'Apr 30', status: 'In Progress', rating: null    },
  { id: 3,  employee: 'Carlos Mendez',    period: 'Q1 2026',    type: 'Quarterly', manager: 'David Kim',    dueDate: 'Apr 25', status: 'Overdue',     rating: null    },
  { id: 4,  employee: 'Sarah Kim',        period: 'Annual 2025',type: 'Annual',    manager: 'David Kim',    dueDate: 'Mar 31', status: 'Completed',   rating: '4.2/5' },
  { id: 5,  employee: 'Tom Jackson',      period: 'Annual 2025',type: 'Annual',    manager: 'Alice Chen',   dueDate: 'Mar 31', status: 'Completed',   rating: '3.8/5' },
  { id: 6,  employee: 'Emily Rodriguez',  period: 'Q1 2026',    type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 30', status: 'In Progress', rating: null    },
  { id: 7,  employee: 'James Liu',        period: 'Q1 2026',    type: 'Quarterly', manager: 'Alice Chen',   dueDate: 'Apr 30', status: 'Not Started', rating: null    },
  { id: 8,  employee: 'Priya Patel',      period: 'Annual 2025',type: 'Annual',    manager: 'David Kim',    dueDate: 'Mar 31', status: 'Completed',   rating: '4.5/5' },
  { id: 9,  employee: 'Marcus Green',     period: 'Q1 2026',    type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 30', status: 'Not Started', rating: null    },
  { id: 10, employee: 'Jennifer Walsh',   period: 'Q1 2026',    type: 'Quarterly', manager: 'David Kim',    dueDate: 'Apr 28', status: 'Overdue',     rating: null    },
  { id: 11, employee: 'Derek Nguyen',     period: 'Annual 2025',type: 'Annual',    manager: 'Alice Chen',   dueDate: 'Mar 31', status: 'Completed',   rating: '3.5/5' },
  { id: 12, employee: 'Sophia Martinez',  period: 'Q1 2026',    type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 30', status: 'In Progress', rating: null    },
  { id: 13, employee: 'Kevin Park',       period: 'Q1 2026',    type: 'Quarterly', manager: 'David Kim',    dueDate: 'Apr 30', status: 'Not Started', rating: null    },
  { id: 14, employee: 'Natalie Brown',    period: 'Annual 2025',type: 'Annual',    manager: 'Alice Chen',   dueDate: 'Mar 31', status: 'Completed',   rating: '4.0/5' },
  { id: 15, employee: 'Omar Hassan',      period: 'Q1 2026',    type: 'Quarterly', manager: 'David Kim',    dueDate: 'Apr 30', status: 'In Progress', rating: null    },
  { id: 16, employee: 'Rachel Torres',    period: 'Q1 2026',    type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 27', status: 'Overdue',     rating: null    },
  { id: 17, employee: 'Steven Clark',     period: 'Annual 2025',type: 'Annual',    manager: 'David Kim',    dueDate: 'Mar 31', status: 'Completed',   rating: '4.7/5' },
  { id: 18, employee: 'Tina Yamamoto',    period: 'Q1 2026',    type: 'Quarterly', manager: 'Alice Chen',   dueDate: 'Apr 30', status: 'Not Started', rating: null    },
  { id: 19, employee: 'Umar Johnson',     period: 'Q1 2026',    type: 'Quarterly', manager: 'Maria Santos', dueDate: 'Apr 30', status: 'In Progress', rating: null    },
  { id: 20, employee: 'Vivian Lee',       period: 'Annual 2025',type: 'Annual',    manager: 'David Kim',    dueDate: 'Mar 31', status: 'Completed',   rating: '3.9/5' },
]

const goals = [
  { id: 1,  employee: 'Alice Chen',    goal: 'Increase sales pipeline by 20%',      targetDate: 'Jun 30', category: 'Sales',       weight: '30%', status: 'In Progress', progress: 65  },
  { id: 2,  employee: 'Alice Chen',    goal: 'Complete leadership training program', targetDate: 'May 31', category: 'Development', weight: '20%', status: 'In Progress', progress: 40  },
  { id: 3,  employee: 'Alice Chen',    goal: 'Reduce customer response time to 2h', targetDate: 'Mar 31', category: 'Service',     weight: '25%', status: 'Completed',   progress: 100 },
  { id: 4,  employee: 'Bob Wilson',    goal: 'Launch 3 new product integrations',    targetDate: 'Jul 31', category: 'Product',     weight: '35%', status: 'In Progress', progress: 33  },
  { id: 5,  employee: 'Bob Wilson',    goal: 'Achieve 98% sprint velocity',          targetDate: 'Jun 30', category: 'Performance', weight: '30%', status: 'At Risk',     progress: 72  },
  { id: 6,  employee: 'Carlos Mendez', goal: 'Onboard 5 enterprise clients',         targetDate: 'Apr 30', category: 'Sales',       weight: '40%', status: 'Overdue',     progress: 20  },
  { id: 7,  employee: 'Carlos Mendez', goal: 'Certify in Salesforce Admin',          targetDate: 'May 15', category: 'Development', weight: '20%', status: 'Not Started', progress: 0   },
  { id: 8,  employee: 'Sarah Kim',     goal: 'Reduce COGS by 5%',                   targetDate: 'Dec 31', category: 'Finance',     weight: '35%', status: 'In Progress', progress: 55  },
  { id: 9,  employee: 'Sarah Kim',     goal: 'Implement ERP module rollout',         targetDate: 'Aug 31', category: 'Operations',  weight: '30%', status: 'In Progress', progress: 48  },
  { id: 10, employee: 'Tom Jackson',   goal: 'Hire 3 senior engineers',              targetDate: 'Jun 30', category: 'Hiring',      weight: '40%', status: 'In Progress', progress: 33  },
]

export async function GET() {
  return NextResponse.json({ reviews, goals, kpis: { due: 24, completed: 18, overdue: 6, avgRating: 3.8 } })
}

export async function POST(req: Request) {
  const body = await req.json()
  return NextResponse.json({ success: true, data: body }, { status: 201 })
}
