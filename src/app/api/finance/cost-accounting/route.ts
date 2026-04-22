import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const KPI = {
  totalCostsMTD: 1847300,
  allocatedCosts: 1523800,
  varianceFromBudget: -84500,
}

const COST_LEDGER = [
  {
    id: 'cl-001',
    account: '5100-001',
    costElement: 'Direct Labor',
    costCenter: 'Assembly',
    actual: 284500,
    budget: 270000,
    variance: -14500,
    variancePct: -5.37,
  },
  {
    id: 'cl-002',
    account: '5200-001',
    costElement: 'Raw Materials',
    costCenter: 'Manufacturing',
    actual: 412800,
    budget: 400000,
    variance: -12800,
    variancePct: -3.20,
  },
  {
    id: 'cl-003',
    account: '5300-001',
    costElement: 'Machine Overhead',
    costCenter: 'Manufacturing',
    actual: 96400,
    budget: 105000,
    variance: 8600,
    variancePct: 8.19,
  },
  {
    id: 'cl-004',
    account: '5400-001',
    costElement: 'Maintenance',
    costCenter: 'Facilities',
    actual: 38200,
    budget: 42000,
    variance: 3800,
    variancePct: 9.05,
  },
  {
    id: 'cl-005',
    account: '5100-002',
    costElement: 'Indirect Labor',
    costCenter: 'Assembly',
    actual: 112600,
    budget: 110000,
    variance: -2600,
    variancePct: -2.36,
  },
  {
    id: 'cl-006',
    account: '6100-001',
    costElement: 'Utilities',
    costCenter: 'Facilities',
    actual: 67300,
    budget: 65000,
    variance: -2300,
    variancePct: -3.54,
  },
  {
    id: 'cl-007',
    account: '5500-001',
    costElement: 'Quality Control',
    costCenter: 'QA',
    actual: 44100,
    budget: 50000,
    variance: 5900,
    variancePct: 11.80,
  },
  {
    id: 'cl-008',
    account: '6200-001',
    costElement: 'Depreciation',
    costCenter: 'Manufacturing',
    actual: 188900,
    budget: 190000,
    variance: 1100,
    variancePct: 0.58,
  },
]

const COST_CENTERS = ['All', 'Assembly', 'Manufacturing', 'Facilities', 'QA']
const COST_ELEMENT_TYPES = ['All', 'Fixed', 'Variable', 'Semi-variable']

export async function GET() {
  return NextResponse.json({ kpi: KPI, ledger: COST_LEDGER, costCenters: COST_CENTERS, costElementTypes: COST_ELEMENT_TYPES })
}
