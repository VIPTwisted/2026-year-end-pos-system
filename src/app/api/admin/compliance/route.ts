import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SEED_ITEMS = [
  { id: 'CI-001', category: 'Financial', description: 'SOX Section 302 quarterly certification', owner: 'CFO', dueDate: '2026-04-25', priority: 'Critical', status: 'In Progress', riskLevel: 'High', likelihood: 4, impact: 5 },
  { id: 'CI-002', category: 'Data Privacy', description: 'GDPR Article 30 records of processing activities update', owner: 'DPO', dueDate: '2026-04-28', priority: 'Critical', status: 'Open', riskLevel: 'High', likelihood: 4, impact: 4 },
  { id: 'CI-003', category: 'Tax', description: 'Q1 sales tax nexus review — 5 new states', owner: 'Tax Manager', dueDate: '2026-04-30', priority: 'High', status: 'Open', riskLevel: 'Medium', likelihood: 3, impact: 4 },
  { id: 'CI-004', category: 'Employment', description: 'I-9 re-verification for remote workers batch', owner: 'HR Director', dueDate: '2026-05-05', priority: 'Medium', status: 'Pending Review', riskLevel: 'Medium', likelihood: 2, impact: 3 },
  { id: 'CI-005', category: 'Safety', description: 'OSHA 300A posting — annual summary display', owner: 'Ops Manager', dueDate: '2026-05-10', priority: 'High', status: 'Open', riskLevel: 'Medium', likelihood: 3, impact: 3 },
  { id: 'CI-006', category: 'Data Privacy', description: 'CCPA opt-out mechanism audit — California storefronts', owner: 'Privacy Counsel', dueDate: '2026-05-15', priority: 'High', status: 'In Progress', riskLevel: 'Medium', likelihood: 3, impact: 4 },
  { id: 'CI-007', category: 'Environmental', description: 'EPA Tier II chemical inventory report submission', owner: 'Compliance Officer', dueDate: '2026-05-20', priority: 'Medium', status: 'Open', riskLevel: 'Low', likelihood: 2, impact: 2 },
  { id: 'CI-008', category: 'Financial', description: 'Anti-money laundering (AML) transaction monitoring review', owner: 'Finance Director', dueDate: '2026-03-31', priority: 'Medium', status: 'Closed', riskLevel: 'Low', likelihood: 1, impact: 3 },
  { id: 'CI-009', category: 'Tax', description: 'Annual 1099 vendor filing reconciliation', owner: 'AP Manager', dueDate: '2026-03-15', priority: 'High', status: 'Closed', riskLevel: 'Low', likelihood: 1, impact: 2 },
  { id: 'CI-010', category: 'Employment', description: 'EEO-1 Component 1 workforce data submission', owner: 'HR Director', dueDate: '2026-03-28', priority: 'Medium', status: 'Closed', riskLevel: 'Low', likelihood: 1, impact: 2 },
]

export async function GET() {
  return NextResponse.json(SEED_ITEMS)
}

export async function POST(req: Request) {
  const body = await req.json()
  const item = {
    id: `CI-${String(SEED_ITEMS.length + 1).padStart(3, '0')}`,
    likelihood: 2,
    impact: 2,
    ...body,
  }
  return NextResponse.json(item, { status: 201 })
}
