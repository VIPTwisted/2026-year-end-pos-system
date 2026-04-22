import { NextResponse } from 'next/server'

export async function GET() {
  const activeCases = [
    {
      id: 'CAS-01001',
      priority: 'Normal',
      channel: 'Phone',
      owner: 'MOD Administrator',
      title: 'Request to Schedule Preventive Maintenance',
      status: 'In Progress',
      initials: 'Rt',
      color: '#7c3aed',
    },
    {
      id: 'CAS-01002',
      priority: 'High',
      channel: 'Twitter',
      owner: 'MOD Administrator',
      title: 'Noise from product',
      status: 'In Progress',
      initials: 'Nf',
      color: '#0f766e',
    },
    {
      id: 'CAS-01003',
      priority: 'High',
      channel: 'Phone',
      owner: 'MOD Administrator',
      title: 'Parent Case for Item defective on delivery',
      status: 'In Progress',
      initials: 'PC',
      color: '#15803d',
    },
    {
      id: 'CAS-01004',
      priority: 'Normal',
      channel: 'Email',
      owner: 'MOD Administrator',
      title: 'Product manual missing from package',
      status: 'In Progress',
      initials: 'Mm',
      color: '#b45309',
    },
    {
      id: 'CAS-01005',
      priority: 'Low',
      channel: 'Web',
      owner: 'MOD Administrator',
      title: 'Inquiry about extended warranty options',
      status: 'In Progress',
      initials: 'Ew',
      color: '#0369a1',
    },
    {
      id: 'CAS-01006',
      priority: 'High',
      channel: 'Phone',
      owner: 'MOD Administrator',
      title: 'Device overheating during normal use',
      status: 'In Progress',
      initials: 'Do',
      color: '#b91c1c',
    },
    {
      id: 'CAS-01007',
      priority: 'Normal',
      channel: 'Chat',
      owner: 'MOD Administrator',
      title: 'Software update causing boot loop',
      status: 'In Progress',
      initials: 'Su',
      color: '#6d28d9',
    },
    {
      id: 'CAS-01008',
      priority: 'Low',
      channel: 'Email',
      owner: 'MOD Administrator',
      title: 'Request for product documentation PDF',
      status: 'Resolved',
      initials: 'Rp',
      color: '#0891b2',
    },
  ]

  const casesByPriority = {
    high: { value: 6, total: 32 },
    low: { value: 9, total: 32 },
    normal: { value: 17, total: 32 },
  }

  const casesByProduct = [
    { name: '(blank)', count: 30 },
    { name: 'A. Datum M200', count: 1 },
    { name: 'Carbon Fiber 3D Printer 20"', count: 1 },
  ]

  const casesByIncidentType = [
    { label: '(blank)', count: 8 },
    { label: 'Defau...', count: 3 },
    { label: 'Delive...', count: 5 },
    { label: 'Infor...', count: 2 },
    { label: 'Maint...', count: 4 },
    { label: 'Produ...', count: 7 },
    { label: 'Query', count: 1 },
    { label: 'Service', count: 2 },
  ]

  const queueTiles = [
    { label: 'My Active Cases', count: 7, sublabel: 'Filtered', variant: 'blue' },
    { label: 'My Resolved Ca...', count: 1, sublabel: 'Filtered', variant: 'blue' },
    { label: 'My Activities', count: 17, sublabel: 'Unfiltered', variant: 'dark' },
    { label: 'My Phone Calls', count: 0, sublabel: 'Unfiltered', variant: 'dark' },
    { label: 'My Emails', count: 3, sublabel: 'Unfiltered', variant: 'dark' },
    { label: 'My Tasks', count: 5, sublabel: 'Filtered', variant: 'blue' },
    { label: 'Cases Closing Soon', count: 2, sublabel: 'Filtered', variant: 'blue' },
    { label: 'Escalated Cases', count: 4, sublabel: 'Filtered', variant: 'blue' },
  ]

  return NextResponse.json({
    activeCases,
    casesByPriority,
    casesByProduct,
    casesByIncidentType,
    queueTiles,
  })
}
