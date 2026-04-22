export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    kpis: {
      totalEmployees: 342,
      newHires30d: 8,
      transfersPending: 3,
      terminations30d: 2,
      openPositions: 14,
    },
    headcountByDept: [
      { dept: 'Operations', count: 84 },
      { dept: 'Sales', count: 67 },
      { dept: 'Manufacturing', count: 48 },
      { dept: 'Finance', count: 42 },
      { dept: 'IT', count: 38 },
      { dept: 'Marketing', count: 31 },
      { dept: 'HR', count: 24 },
      { dept: 'Management', count: 8 },
    ],
    hireTrend: [
      { month: 'Jan', hires: 6, terminations: 2 },
      { month: 'Feb', hires: 4, terminations: 3 },
      { month: 'Mar', hires: 9, terminations: 1 },
      { month: 'Apr', hires: 8, terminations: 2 },
      { month: 'May', hires: 5, terminations: 4 },
      { month: 'Jun', hires: 11, terminations: 2 },
      { month: 'Jul', hires: 7, terminations: 3 },
      { month: 'Aug', hires: 6, terminations: 1 },
      { month: 'Sep', hires: 10, terminations: 5 },
      { month: 'Oct', hires: 8, terminations: 2 },
      { month: 'Nov', hires: 5, terminations: 3 },
      { month: 'Dec', hires: 3, terminations: 1 },
    ],
    lifecycleEvents: [
      { type: 'Hire', name: 'Sarah Martinez', event: 'New Hire — Operations', date: 'Apr 22', status: 'Active' },
      { type: 'Transfer', name: 'James Chen', event: 'IT → Development', date: 'Apr 20', status: 'Effective May 1' },
      { type: 'Promote', name: 'Lisa Park', event: 'Associate → Senior Analyst', date: 'Apr 18', status: 'Completed' },
      { type: 'Leave', name: 'Robert Johnson', event: 'Paternity Leave', date: 'Apr 15', status: 'On Leave' },
      { type: 'Terminate', name: '', event: 'Voluntary Resignation', date: 'Apr 10', status: 'Processed' },
      { type: 'Hire', name: 'Kevin Nguyen', event: 'New Hire — IT', date: 'Apr 8', status: 'Active' },
      { type: 'Promote', name: 'Angela Torres', event: 'Analyst → Lead Analyst', date: 'Apr 7', status: 'Completed' },
      { type: 'Transfer', name: 'Michael Brown', event: 'Sales → Marketing', date: 'Apr 5', status: 'Effective Apr 15' },
      { type: 'Leave', name: 'Priya Patel', event: 'Medical Leave', date: 'Apr 3', status: 'On Leave' },
      { type: 'Hire', name: 'Dana Williams', event: 'New Hire — Finance', date: 'Apr 1', status: 'Active' },
    ],
    onboardingPipeline: [
      { name: 'Sarah Martinez', startDate: 'Apr 22', completion: 15 },
      { name: 'Kevin Nguyen', startDate: 'Apr 8', completion: 60 },
      { name: 'Dana Williams', startDate: 'Apr 1', completion: 85 },
      { name: 'Tom Bradley', startDate: 'Mar 28', completion: 100 },
      { name: 'Naomi Fields', startDate: 'Mar 25', completion: 100 },
      { name: 'Carlos Reyes', startDate: 'Mar 20', completion: 100 },
      { name: 'Jen Park', startDate: 'Mar 18', completion: 100 },
      { name: 'Amir Hassan', startDate: 'Mar 15', completion: 100 },
    ],
  })
}
