import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const workOrders = [
    { id: 'WO-MNT-0841', asset: 'Assembly Line A', type: 'Preventive', priority: 'High', assignedTo: 'John M.', dueDate: 'Apr 24', dueDateLabel: 'Apr 24', status: 'In Progress', completion: 45 },
    { id: 'WO-MNT-0840', asset: 'HVAC Unit 2', type: 'Corrective', priority: 'Critical', assignedTo: 'HVAC Contractor', dueDate: 'Apr 22', dueDateLabel: 'Apr 22 — TODAY', status: 'Scheduled', completion: 0 },
    { id: 'WO-MNT-0839', asset: 'Forklift #3', type: 'Preventive', priority: 'Medium', assignedTo: 'Tom K.', dueDate: 'Apr 25', dueDateLabel: 'Apr 25', status: 'Open', completion: 0 },
    { id: 'WO-MNT-0838', asset: 'Server Room AC', type: 'Inspection', priority: 'Low', assignedTo: 'IT Dept', dueDate: 'Apr 30', dueDateLabel: 'Apr 30', status: 'Open', completion: 0 },
    { id: 'WO-MNT-0837', asset: 'Paint Booth Exhaust', type: 'Corrective', priority: 'High', assignedTo: 'Ext. Vendor', dueDate: 'Apr 21', dueDateLabel: 'Apr 21', status: 'Overdue', completion: 20, isOverdue: true },
    { id: 'WO-MNT-0836', asset: 'Conveyor Belt B', type: 'Preventive', priority: 'Medium', assignedTo: 'Mike R.', dueDate: 'Apr 26', dueDateLabel: 'Apr 26', status: 'Open', completion: 0 },
    { id: 'WO-MNT-0835', asset: 'Compressor Unit 1', type: 'Inspection', priority: 'Low', assignedTo: 'Safety Team', dueDate: 'Apr 28', dueDateLabel: 'Apr 28', status: 'Scheduled', completion: 0 },
    { id: 'WO-MNT-0834', asset: 'Loading Dock Door 2', type: 'Corrective', priority: 'High', assignedTo: 'Facilities', dueDate: 'Apr 23', dueDateLabel: 'Apr 23', status: 'In Progress', completion: 75 },
    { id: 'WO-MNT-0833', asset: 'Fire Suppression System', type: 'Inspection', priority: 'Critical', assignedTo: 'Safety Team', dueDate: 'Apr 29', dueDateLabel: 'Apr 29', status: 'Scheduled', completion: 0 },
    { id: 'WO-MNT-0832', asset: 'Packaging Machine 3', type: 'Preventive', priority: 'Medium', assignedTo: 'Tom K.', dueDate: 'Apr 27', dueDateLabel: 'Apr 27', status: 'Open', completion: 0 },
    { id: 'WO-MNT-0831', asset: 'Electrical Panel B', type: 'Inspection', priority: 'High', assignedTo: 'Electrician', dueDate: 'Apr 25', dueDateLabel: 'Apr 25', status: 'Open', completion: 0 },
    { id: 'WO-MNT-0830', asset: 'Roof HVAC Unit 1', type: 'Preventive', priority: 'Low', assignedTo: 'HVAC Contractor', dueDate: 'May 2', dueDateLabel: 'May 2', status: 'Open', completion: 0 },
  ]

  return NextResponse.json({
    workOrders,
    kpis: { open: 8, overdue: 2, completedThisMonth: 24, avgResponseHrs: 4.2, uptime: 97.8 },
    updatedAt: new Date().toISOString(),
  })
}
