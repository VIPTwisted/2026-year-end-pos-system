import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const PROJECTS = [
  { id: 'PRJ-2026-001', name: 'ERP Implementation', customer: 'Fabrikam Inc', type: 'Fixed Price', manager: 'Sarah Chen', startDate: '2026-01-06', endDate: '2026-06-30', budget: 125000, billed: 62500, status: 'In Progress' },
  { id: 'PRJ-2026-002', name: 'IT Infrastructure Upgrade', customer: 'Contoso Ltd', type: 'Time & Material', manager: 'Mike Johnson', startDate: '2026-02-01', endDate: '2026-05-31', budget: 80000, billed: 48200, status: 'In Progress' },
  { id: 'PRJ-2026-003', name: 'Marketing Campaign Q2', customer: 'Internal', type: 'Internal', manager: 'Alice Brown', startDate: '2026-04-01', endDate: '2026-06-30', budget: 25000, billed: 8400, status: 'In Progress' },
  { id: 'PRJ-2026-004', name: 'Supply Chain Audit', customer: 'Adatum Corp', type: 'Fixed Price', manager: 'David Park', startDate: '2026-03-15', endDate: '2026-04-30', budget: 18500, billed: 18500, status: 'Completed' },
  { id: 'PRJ-2026-005', name: 'Cloud Migration Phase 2', customer: 'Litware Inc', type: 'Time & Material', manager: 'Sarah Chen', startDate: '2026-05-01', endDate: '2026-12-31', budget: 200000, billed: 0, status: 'Planning' },
  { id: 'PRJ-2026-006', name: 'HR System Modernization', customer: 'Northwind Traders', type: 'Fixed Price', manager: 'Mike Johnson', startDate: '2026-03-01', endDate: '2026-08-31', budget: 95000, billed: 38000, status: 'In Progress' },
  { id: 'PRJ-2026-007', name: 'Data Warehouse Build', customer: 'Fabrikam Inc', type: 'Time & Material', manager: 'Alice Brown', startDate: '2026-04-15', endDate: '2026-10-31', budget: 150000, billed: 12500, status: 'In Progress' },
  { id: 'PRJ-2026-008', name: 'Retail Analytics Platform', customer: 'Trey Research', type: 'Fixed Price', manager: 'David Park', startDate: '2026-02-15', endDate: '2026-07-15', budget: 72000, billed: 72000, status: 'Completed' },
  { id: 'PRJ-2026-009', name: 'Security Compliance Audit', customer: 'Wingtip Toys', type: 'Time & Material', manager: 'Sarah Chen', startDate: '2026-04-01', endDate: '2026-05-15', budget: 22000, billed: 11000, status: 'On Hold' },
  { id: 'PRJ-2026-010', name: 'Mobile App Development', customer: 'Contoso Ltd', type: 'Fixed Price', manager: 'Mike Johnson', startDate: '2026-05-15', endDate: '2026-11-30', budget: 180000, billed: 0, status: 'Planning' },
  { id: 'PRJ-2026-011', name: 'Network Infrastructure', customer: 'Alpine Ski House', type: 'Time & Material', manager: 'Alice Brown', startDate: '2026-01-15', endDate: '2026-03-31', budget: 45000, billed: 45000, status: 'Completed' },
  { id: 'PRJ-2026-012', name: 'BI Dashboard Suite', customer: 'Adatum Corp', type: 'Fixed Price', manager: 'David Park', startDate: '2026-03-01', endDate: '2026-09-30', budget: 88000, billed: 33000, status: 'In Progress' },
  { id: 'PRJ-2026-013', name: 'Legacy System Migration', customer: 'Litware Inc', type: 'Time & Material', manager: 'Sarah Chen', startDate: '2026-06-01', endDate: '2027-02-28', budget: 320000, billed: 0, status: 'Planning' },
  { id: 'PRJ-2026-014', name: 'Customer Portal Build', customer: 'Fabrikam Inc', type: 'Fixed Price', manager: 'Mike Johnson', startDate: '2026-02-01', endDate: '2026-05-01', budget: 55000, billed: 55000, status: 'Completed' },
  { id: 'PRJ-2026-015', name: 'Training Program Q2', customer: 'Internal', type: 'Internal', manager: 'Alice Brown', startDate: '2026-04-01', endDate: '2026-06-30', budget: 12000, billed: 4800, status: 'In Progress' },
  { id: 'PRJ-2026-016', name: 'API Integration Suite', customer: 'Northwind Traders', type: 'Time & Material', manager: 'David Park', startDate: '2026-03-15', endDate: '2026-07-31', budget: 67000, billed: 28000, status: 'In Progress' },
  { id: 'PRJ-2026-017', name: 'Compliance Framework', customer: 'Wingtip Toys', type: 'Fixed Price', manager: 'Sarah Chen', startDate: '2026-01-01', endDate: '2026-04-30', budget: 38000, billed: 0, status: 'Cancelled' },
  { id: 'PRJ-2026-018', name: 'E-Commerce Platform', customer: 'Trey Research', type: 'Time & Material', manager: 'Mike Johnson', startDate: '2026-05-01', endDate: '2026-12-31', budget: 275000, billed: 0, status: 'Planning' },
  { id: 'PRJ-2026-019', name: 'DevOps Transformation', customer: 'Contoso Ltd', type: 'Fixed Price', manager: 'Alice Brown', startDate: '2026-02-15', endDate: '2026-06-30', budget: 92000, billed: 46000, status: 'On Hold' },
  { id: 'PRJ-2026-020', name: 'Sustainability Reporting', customer: 'Alpine Ski House', type: 'Internal', manager: 'David Park', startDate: '2026-04-01', endDate: '2026-09-30', budget: 31000, billed: 9300, status: 'In Progress' },
]

export async function GET() {
  return NextResponse.json({ projects: PROJECTS, total: 94 })
}
