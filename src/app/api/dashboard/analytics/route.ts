import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    salesPipeline: {
      stages: [
        { label: '1-Qualify', value: '$2,911,187', color: '#6366f1', width: 280 },
        { label: '2-Develop', value: '$4,241,442', color: '#0891b2', width: 240 },
        { label: '3-Propose (a)', value: '$730,000', color: '#22d3ee', width: 200 },
        { label: '3-Propose (b)', value: '$3,705,361', color: '#7dd3fc', width: 160 },
        { label: '4-Close', value: '$2,986,400', color: '#ef4444', width: 120 },
        { label: 'Bottom', value: '$2,750,000', color: '#dc2626', width: 80 },
      ],
    },
    leadsBySource: [
      { label: 'Website', value: 67, color: '#6366f1' },
      { label: 'Advertisement', value: 21, color: '#0891b2' },
      { label: 'LinkedIn', value: 9, color: '#f97316' },
      { label: 'In Person', value: 14, color: '#a855f7' },
      { label: 'Other A', value: 5, color: '#22d3ee' },
      { label: 'Other B', value: 4, color: '#84cc16' },
    ],
    leadsByRating: [
      { label: 'Cold', value: 27, color: '#6366f1' },
      { label: 'Warm', value: 34, color: '#f97316' },
      { label: 'Hot', value: 19, color: '#ef4444' },
    ],
    financialKpis: [
      { label: 'Current ratio', value: '1.35', trend: 'up', goal: 2, delta: '-32.62%', alert: true },
      { label: 'Gross margin', value: '632.63K', trend: null, goal: null, delta: null, alert: false },
      { label: 'EBIT', value: '1.80K', trend: null, goal: null, delta: null, alert: false },
      { label: 'Cost of goods sold', value: '1.12M', trend: null, goal: null, delta: null, alert: false },
      { label: 'Debt to total assets', value: '0.65', trend: null, goal: null, delta: null, alert: false },
      { label: 'Working capital', value: '1.80K', trend: null, goal: null, delta: null, alert: false },
    ],
    gauges: [
      { label: 'New business today', value: 75000, max: 400000, display: '75.0K', subLabel: '0K–400K', alert: false },
      { label: 'Chats today', value: 6512, max: 7500, display: '6512', subLabel: '0–7500', alert: false },
      { label: 'CSAT today', value: 1.1, max: 5, display: '1.1↓', subLabel: 'Goal: 4 (-72.5%)', alert: true },
      { label: 'Escalations today', value: 4310, max: 2000, display: '2K↑', subLabel: 'Goal: 1K (-331%)', alert: true },
    ],
    opportunities: [
      { topic: 'Home PC', estRev: '$2,470,86...', healthState: 'Fair', healthColor: '#eab308', trend: '→ Steady', account: 'Adventure Wo', timeSpent: 17.6, timeEngaged: 10.0, lastUpdated: '2/14/2018 4:13 PM' },
      { topic: 'Expressed interest in A', estRev: '$2,053,94...', healthState: 'Fair', healthColor: '#eab308', trend: '→ Steady', account: 'Northwind Tra', timeSpent: 23.1, timeEngaged: 11.0, lastUpdated: '3/2/2018 9:00 AM' },
      { topic: 'Portable Computing', estRev: '$2,000,00...', healthState: 'Poor', healthColor: '#ef4444', trend: '→ Steady', account: 'Northwind Tra', timeSpent: 14.8, timeEngaged: 1.7, lastUpdated: '1/15/2018 2:30 PM' },
      { topic: 'Replacing SD exhibits', estRev: '$1,840,95...', healthState: 'Good', healthColor: '#22c55e', trend: '→ Steady', account: 'Coho Winery', timeSpent: 31.3, timeEngaged: 7.3, lastUpdated: '4/1/2018 11:00 AM' },
      { topic: 'Server upgrade project', estRev: '$1,650,00...', healthState: 'Good', healthColor: '#22c55e', trend: '↑ Rising', account: 'Fabrikam Inc', timeSpent: 28.5, timeEngaged: 14.2, lastUpdated: '3/28/2018 3:45 PM' },
    ],
    candidatesPipeline: [
      { label: 'New', value: 119, max: 320 },
      { label: 'Screened', value: 320, max: 320 },
      { label: 'Phone interviews', value: 50, max: 320 },
      { label: 'In-person interviews', value: 10, max: 320 },
      { label: 'Offer', value: 3, max: 320 },
    ],
    jobsMetrics: {
      withApplicants: 12,
      noApplicants: 9,
    },
    openLeads: [
      { initials: 'AW', name: 'Alex Wu', color: '#6366f1', description: 'Interested in enterprise licensing deal for upcoming fiscal year', badge: 'New' },
      { initials: 'AB', name: 'Allison Brown', color: '#374151', description: 'Follow-up on demo request submitted via website contact form', badge: 'New' },
      { initials: 'BL', name: 'Brian LaMee', color: '#0891b2', description: 'Referral from existing client — needs custom pricing proposal', badge: 'New' },
    ],
    workItems: [
      { initials: 'ID', color: '#6366f1', title: 'Item defective on delivery', status: 'In Progress' },
      { initials: 'TE', color: '#0891b2', title: 'Customer case pending', status: 'In Progress' },
    ],
    casesByOrigin: [
      {
        priority: 'Normal',
        segments: [
          { label: 'Email', value: 7, color: '#6366f1' },
          { label: 'Facebook', value: 3, color: '#3b82f6' },
          { label: 'Phone', value: 8, color: '#0891b2' },
          { label: 'Twitter', value: 2, color: '#22d3ee' },
          { label: 'Web', value: 5, color: '#84cc16' },
        ],
      },
      {
        priority: 'Low',
        segments: [
          { label: 'Email', value: 2, color: '#6366f1' },
          { label: 'Facebook', value: 1, color: '#3b82f6' },
          { label: 'Phone', value: 4, color: '#0891b2' },
          { label: 'Twitter', value: 1, color: '#22d3ee' },
          { label: 'Web', value: 3, color: '#84cc16' },
        ],
      },
      {
        priority: 'High',
        segments: [
          { label: 'Email', value: 8, color: '#6366f1' },
          { label: 'Facebook', value: 2, color: '#3b82f6' },
          { label: 'Phone', value: 6, color: '#0891b2' },
          { label: 'Twitter', value: 3, color: '#22d3ee' },
          { label: 'Web', value: 4, color: '#84cc16' },
        ],
      },
    ],
    workOrdersByStatus: [
      { label: 'Open-Unscheduled', value: 3, color: '#f97316' },
      { label: 'Open-Completed', value: 5, color: '#0891b2' },
      { label: 'Open-In-P...', value: 11, color: '#374151' },
      { label: 'Open-Scheduled', value: 25, color: '#6366f1' },
    ],
    headcount: [
      { dept: 'Client Service', lastYear: 139, thisYear: 152 },
      { dept: 'Finance', lastYear: 31, thisYear: 38 },
      { dept: 'Sales & Mktg', lastYear: 19, thisYear: 25 },
      { dept: 'IT', lastYear: 8, thisYear: 10 },
      { dept: 'Departments', lastYear: 61, thisYear: 72 },
      { dept: 'Operations', lastYear: 45, thisYear: 58 },
    ],
  })
}
