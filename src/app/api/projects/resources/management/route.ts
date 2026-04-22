import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const RESOURCES = [
  { id: 'res-001', resourceNo: 'RES-0001', name: 'Alex Torres', type: 'Human', role: 'Senior Developer', department: 'Engineering', availableHours: 160, bookedHours: 124, skills: ['React', 'Node.js', 'TypeScript'] },
  { id: 'res-002', resourceNo: 'RES-0002', name: 'Maria Chen', type: 'Human', role: 'Project Manager', department: 'PMO', availableHours: 160, bookedHours: 148, skills: ['Agile', 'Scrum', 'Risk Mgmt'] },
  { id: 'res-003', resourceNo: 'RES-0003', name: 'CNC Mill #4', type: 'Machine', role: 'Machining', department: 'Manufacturing', availableHours: 200, bookedHours: 195, skills: ['Milling', 'CNC', '5-Axis'] },
  { id: 'res-004', resourceNo: 'RES-0004', name: 'James Okafor', type: 'Human', role: 'QA Engineer', department: 'Quality', availableHours: 160, bookedHours: 88, skills: ['Selenium', 'Jest', 'Postman'] },
  { id: 'res-005', resourceNo: 'RES-0005', name: 'Warehouse Bay A', type: 'Facility', role: 'Storage', department: 'Warehouse', availableHours: 240, bookedHours: 96, skills: ['Cold Storage', 'Racking', 'Dock Access'] },
  { id: 'res-006', resourceNo: 'RES-0006', name: 'Steel Sheet Stock', type: 'Material', role: 'Raw Material', department: 'Procurement', availableHours: 500, bookedHours: 312, skills: ['Grade A', 'Cut-to-Size'] },
  { id: 'res-007', resourceNo: 'RES-0007', name: 'Sarah Patel', type: 'Human', role: 'UX Designer', department: 'Product', availableHours: 160, bookedHours: 40, skills: ['Figma', 'Prototyping', 'Research'] },
  { id: 'res-008', resourceNo: 'RES-0008', name: 'Laser Cutter L2', type: 'Machine', role: 'Fabrication', department: 'Manufacturing', availableHours: 200, bookedHours: 204, skills: ['CO2 Laser', 'Sheet Metal', 'Engraving'] },
  { id: 'res-009', resourceNo: 'RES-0009', name: 'Conference Room B', type: 'Facility', role: 'Meeting Space', department: 'Admin', availableHours: 160, bookedHours: 72, skills: ['A/V', 'Video Conf', 'Whiteboard'] },
  { id: 'res-010', resourceNo: 'RES-0010', name: 'Diego Martinez', type: 'Human', role: 'DevOps Engineer', department: 'Engineering', availableHours: 160, bookedHours: 130, skills: ['Kubernetes', 'AWS', 'CI/CD'] },
]

export async function GET() {
  const data = RESOURCES.map(r => ({
    ...r,
    utilizationPct: Math.round((r.bookedHours / r.availableHours) * 100),
  }))
  return NextResponse.json(data)
}
