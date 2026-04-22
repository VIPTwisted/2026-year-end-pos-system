import { NextResponse } from 'next/server'

export async function GET() {
  const data = {
    leadsBySource: [
      { name: 'Website', value: 67, color: '#4f46e5' },
      { name: 'Advertisement', value: 21, color: '#7c3aed' },
      { name: 'LinkedIn', value: 9, color: '#0891b2' },
      { name: 'In Person', value: 4, color: '#059669' },
      { name: 'Other', value: 14, color: '#d97706' },
      { name: 'Unknown', value: 5, color: '#475569' },
    ],
    salesPipeline: [
      { stage: 'Qualify', amount: 2911187, color: '#4f46e5', pct: 100 },
      { stage: 'Develop', amount: 4241442, color: '#7c3aed', pct: 82 },
      { stage: 'Propose', amount: 3705361, color: '#0891b2', pct: 62 },
      { stage: 'Close', amount: 2966400, color: '#059669', pct: 44 },
    ],
    opportunities: [
      {
        topic: 'Interested in new call p...',
        estRev: 12500,
        healthKpi: 'Good',
        trend: 'Improving',
        account: 'Adatum Corp',
        timeSpent: '4h',
        timeEngaged: '87%',
      },
      {
        topic: 'Interested in Sales Prod...',
        estRev: 8200,
        healthKpi: 'Poor',
        trend: 'Declining',
        account: 'Contoso Ltd',
        timeSpent: '2h',
        timeEngaged: '43%',
      },
      {
        topic: 'Audio Format MP4',
        estRev: 5600,
        healthKpi: 'Fair',
        trend: 'Steady',
        account: 'Fabrikam Inc',
        timeSpent: '6h',
        timeEngaged: '61%',
      },
      {
        topic: 'Portable Computing',
        estRev: 19000,
        healthKpi: 'Good',
        trend: 'Improving',
        account: 'Northwind Traders',
        timeSpent: '8h',
        timeEngaged: '92%',
      },
      {
        topic: 'Audio Format',
        estRev: 3400,
        healthKpi: 'Fair',
        trend: 'Steady',
        account: 'Trey Research',
        timeSpent: '1h',
        timeEngaged: '55%',
      },
    ],
    kpis: {
      avgDealSize: 3400,
      workingCapital: 1800,
      cogs: 1120000,
    },
    gauges: {
      newBusinessToday: { value: 75000, max: 400000 },
      chatsToday: { value: 6512, max: 7500 },
      csatToday: { value: 3.2, goal: 4.0, delta: -3.5 },
      escalationsToday: { value: 14, max: 50 },
    },
    candidatesPipeline: [
      { stage: 'New', count: 119, color: '#4f46e5' },
      { stage: 'Screen', count: 320, color: '#7c3aed' },
      { stage: 'Phone interviews', count: 50, color: '#0891b2' },
      { stage: 'In-person interviews', count: 10, color: '#059669' },
      { stage: 'Offer', count: 4, color: '#d97706' },
    ],
    openLeads: [
      {
        name: 'Alex Wu',
        source: 'Website',
        note: 'Expressed interest in A. Datum X lin...',
        initials: 'AW',
        color: '#4f46e5',
      },
      {
        name: 'Allison Brown',
        source: 'In Person',
        note: 'Wants to expand',
        initials: 'AB',
        color: '#7c3aed',
      },
      {
        name: 'Brian LaMee',
        source: 'Website',
        note: 'Interested in online only store',
        initials: 'BL',
        color: '#0891b2',
      },
    ],
    workItems: [
      {
        title: 'Item defective on delivery',
        category: 'Delivery',
        timeLeft: '12 hrs left',
        status: 'In Progress',
        initials: 'ID',
        color: '#ef4444',
      },
      {
        title: 'Customer case pending',
        category: 'Loan',
        timeLeft: '12 hrs left',
        status: 'In Progress',
        initials: 'TE',
        color: '#f59e0b',
      },
    ],
    casesByOrigin: [
      {
        origin: 'Email',
        normal: 18,
        low: 7,
        high: 12,
      },
      {
        origin: 'Facebook',
        normal: 9,
        low: 3,
        high: 5,
      },
      {
        origin: 'Phone',
        normal: 24,
        low: 11,
        high: 19,
      },
      {
        origin: 'Twitter',
        normal: 6,
        low: 2,
        high: 4,
      },
      {
        origin: 'Web',
        normal: 15,
        low: 8,
        high: 10,
      },
    ],
  }

  return NextResponse.json(data)
}
