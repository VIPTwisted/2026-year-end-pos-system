export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    workspaceTiles: [
      { label: 'My team', count: 12, badge: null },
      { label: 'Pending approvals', count: 5, badge: 'amber' },
      { label: 'Expiring certifications', count: 7, badge: 'amber' },
      { label: 'Open positions', count: 14, badge: null },
      { label: 'Performance reviews due', count: 8, badge: null },
      { label: 'Training requests', count: 11, badge: null },
    ],
    directReports: [
      { initials: 'JW', color: '#6366f1', name: 'James Wilson', title: 'Operations Manager', status: 'Active' },
      { initials: 'SK', color: '#0891b2', name: 'Sarah Kim', title: 'Finance Analyst', status: 'Active' },
      { initials: 'RP', color: '#059669', name: 'Rachel Park', title: 'HR Coordinator', status: 'On Leave' },
      { initials: 'MT', color: '#dc2626', name: 'Marcus Torres', title: 'Sales Lead', status: 'Active' },
      { initials: 'AB', color: '#d97706', name: 'Aisha Brown', title: 'IT Specialist', status: 'Active' },
    ],
    pendingActions: [
      { icon: 'clock', desc: 'Annual performance review due for 3 employees', priority: 'High' },
      { icon: 'file', desc: '2 job offers awaiting approval', priority: 'High' },
      { icon: 'shield', desc: '1 background check pending', priority: 'Medium' },
      { icon: 'award', desc: '4 certifications expiring within 30 days', priority: 'Medium' },
      { icon: 'user', desc: 'Update org chart for new hires', priority: 'Low' },
    ],
    calendarEvents: [
      { day: 3, type: 'training', label: 'Onboarding Training' },
      { day: 7, type: 'review', label: 'Performance Review' },
      { day: 10, type: 'hire', label: 'New Hire Start' },
      { day: 14, type: 'training', label: 'Compliance Training' },
      { day: 18, type: 'review', label: 'Quarterly Review' },
      { day: 22, type: 'hire', label: 'New Hire Start' },
      { day: 23, type: 'training', label: 'Interview Scheduled' },
      { day: 28, type: 'hire', label: 'Orientation Day' },
      { day: 30, type: 'review', label: 'Performance Review' },
    ],
    upcomingEvents: [
      { date: 'Apr 23', event: 'Interview — Sr. Software Engineer candidate', type: 'training' },
      { date: 'Apr 25', event: 'Benefits enrollment deadline', type: 'review' },
      { date: 'Apr 28', event: 'New employee orientation', type: 'hire' },
      { date: 'Apr 30', event: 'Q2 performance reviews due', type: 'review' },
      { date: 'May 2', event: 'James Chen transfer effective', type: 'hire' },
    ],
    metrics: {
      turnoverRate: 8.4,
      timeToHire: 24,
      timeToHireTrend: [28, 26, 30, 25, 22, 24, 27, 23, 21, 25, 24, 24],
      trainingCompletion: 72,
      diversity: {
        gender: { male: 58, female: 42 },
        age: { young: 28, mid: 51, senior: 21 },
        dept: { ops: 25, sales: 20, it: 11, other: 44 },
      },
    },
  })
}
