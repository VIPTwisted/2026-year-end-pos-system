import { NextRequest, NextResponse } from 'next/server'

const PLANS = [
  { id: '1', planName: 'Blue Shield PPO 2000',    planType: 'Medical',         provider: 'Blue Shield',  enrollment: 38, employeeCost: 220, employerCost: 580, effectiveDate: '2026-01-01', status: 'Active' },
  { id: '2', planName: 'Delta Dental Plus',        planType: 'Dental',          provider: 'Delta Dental', enrollment: 41, employeeCost: 32,  employerCost: 88,  effectiveDate: '2026-01-01', status: 'Active' },
  { id: '3', planName: 'VSP Vision Care',          planType: 'Vision',          provider: 'VSP',          enrollment: 35, employeeCost: 8,   employerCost: 22,  effectiveDate: '2026-01-01', status: 'Active' },
  { id: '4', planName: 'MetLife Basic Life 50k',   planType: 'Life Insurance',  provider: 'MetLife',      enrollment: 48, employeeCost: 0,   employerCost: 15,  effectiveDate: '2026-01-01', status: 'Active' },
  { id: '5', planName: 'Fidelity 401k Plus',       planType: '401k',            provider: 'Fidelity',     enrollment: 44, employeeCost: 0,   employerCost: 0,   effectiveDate: '2026-01-01', status: 'Active' },
  { id: '6', planName: 'Health FSA 2026',          planType: 'FSA',             provider: 'WageWorks',    enrollment: 18, employeeCost: 0,   employerCost: 0,   effectiveDate: '2026-01-01', status: 'Expiring' },
  { id: '7', planName: 'HSA High-Deductible Plan', planType: 'HSA',             provider: 'Optum Bank',   enrollment: 12, employeeCost: 180, employerCost: 420, effectiveDate: '2026-03-01', status: 'Active' },
]

export async function GET(_req: NextRequest) {
  return NextResponse.json(PLANS)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = { id: Date.now().toString(), enrollment: 0, status: 'Active', ...body }
    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
