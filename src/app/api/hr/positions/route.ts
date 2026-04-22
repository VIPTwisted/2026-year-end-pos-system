export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    total: 287,
    positions: [
      { id: 'POS-001', title: 'Chief Executive Officer', dept: 'Executive', reportsTo: '—', employee: 'John Williams', fte: 1.0, location: 'Chicago HQ', status: 'Active', effectiveDate: 'Jan 2020' },
      { id: 'POS-002', title: 'Chief Financial Officer', dept: 'Finance', reportsTo: 'CEO', employee: 'Maria Santos', fte: 1.0, location: 'Chicago HQ', status: 'Active', effectiveDate: 'Mar 2021' },
      { id: 'POS-003', title: 'VP Operations', dept: 'Operations', reportsTo: 'CEO', employee: 'David Kim', fte: 1.0, location: 'Chicago HQ', status: 'Active', effectiveDate: 'Jun 2019' },
      { id: 'POS-004', title: 'Finance Manager', dept: 'Finance', reportsTo: 'CFO', employee: 'Alice Chen', fte: 1.0, location: 'Chicago HQ', status: 'Active', effectiveDate: 'Jan 2022' },
      { id: 'POS-005', title: 'Sr. Software Engineer', dept: 'IT', reportsTo: 'VP Engineering', employee: '', fte: 1.0, location: 'Remote', status: 'Open', effectiveDate: 'Feb 2024' },
      { id: 'POS-006', title: 'Marketing Coordinator', dept: 'Marketing', reportsTo: 'VP Marketing', employee: '', fte: 1.0, location: 'New York', status: 'Open', effectiveDate: 'Mar 2024' },
      { id: 'POS-007', title: 'VP Engineering', dept: 'IT', reportsTo: 'CEO', employee: 'Ryan Patel', fte: 1.0, location: 'Chicago HQ', status: 'Active', effectiveDate: 'Sep 2020' },
      { id: 'POS-008', title: 'HR Manager', dept: 'HR', reportsTo: 'VP HR', employee: 'Sandra Lee', fte: 1.0, location: 'Chicago HQ', status: 'Active', effectiveDate: 'May 2021' },
      { id: 'POS-009', title: 'Operations Analyst', dept: 'Operations', reportsTo: 'VP Operations', employee: 'Tom Bradley', fte: 1.0, location: 'Chicago HQ', status: 'Active', effectiveDate: 'Apr 2022' },
      { id: 'POS-010', title: 'Sales Manager', dept: 'Sales', reportsTo: 'VP Sales', employee: 'Marcus Torres', fte: 1.0, location: 'New York', status: 'Active', effectiveDate: 'Jul 2021' },
      { id: 'POS-011', title: 'Data Engineer', dept: 'IT', reportsTo: 'VP Engineering', employee: '', fte: 1.0, location: 'Remote', status: 'Open', effectiveDate: 'Jan 2025' },
      { id: 'POS-012', title: 'Manufacturing Supervisor', dept: 'Manufacturing', reportsTo: 'VP Operations', employee: 'Lisa Park', fte: 1.0, location: 'Detroit', status: 'Active', effectiveDate: 'Mar 2020' },
      { id: 'POS-013', title: 'Payroll Specialist', dept: 'Finance', reportsTo: 'Finance Manager', employee: 'Grace Huang', fte: 1.0, location: 'Chicago HQ', status: 'Active', effectiveDate: 'Aug 2022' },
      { id: 'POS-014', title: 'Recruitment Specialist', dept: 'HR', reportsTo: 'HR Manager', employee: '', fte: 0.5, location: 'Chicago HQ', status: 'Open', effectiveDate: 'Feb 2025' },
      { id: 'POS-015', title: 'VP Sales', dept: 'Sales', reportsTo: 'CEO', employee: 'Brian Mitchell', fte: 1.0, location: 'New York', status: 'Active', effectiveDate: 'Jan 2019' },
      { id: 'POS-016', title: 'Account Executive', dept: 'Sales', reportsTo: 'Sales Manager', employee: 'Priya Patel', fte: 1.0, location: 'New York', status: 'Active', effectiveDate: 'Jun 2023' },
      { id: 'POS-017', title: 'VP Marketing', dept: 'Marketing', reportsTo: 'CEO', employee: 'Diane Foster', fte: 1.0, location: 'New York', status: 'Active', effectiveDate: 'Apr 2021' },
      { id: 'POS-018', title: 'Supply Chain Analyst', dept: 'Operations', reportsTo: 'VP Operations', employee: '', fte: 1.0, location: 'Chicago HQ', status: 'Open', effectiveDate: 'Mar 2025' },
      { id: 'POS-019', title: 'Quality Assurance Lead', dept: 'Manufacturing', reportsTo: 'Manufacturing Supervisor', employee: 'Kenji Tanaka', fte: 1.0, location: 'Detroit', status: 'Active', effectiveDate: 'Nov 2021' },
      { id: 'POS-020', title: 'VP HR', dept: 'HR', reportsTo: 'CEO', employee: 'Camille Dubois', fte: 1.0, location: 'Chicago HQ', status: 'Active', effectiveDate: 'Feb 2020' },
    ],
  })
}
