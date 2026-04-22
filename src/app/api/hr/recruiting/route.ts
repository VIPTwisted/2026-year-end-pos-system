import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const jobs = [
  { id: 1,  title: 'Sr. Software Engineer',   dept: 'IT',         location: 'Remote',   posted: 'Apr 1',  applications: 23, stage: 'Interviewing', recruiter: 'Sarah Kim',    status: 'Active' },
  { id: 2,  title: 'Marketing Coordinator',   dept: 'Marketing',  location: 'New York', posted: 'Apr 5',  applications: 15, stage: 'Screening',    recruiter: 'Alice Chen',   status: 'Active' },
  { id: 3,  title: 'Operations Analyst',      dept: 'Operations', location: 'Chicago',  posted: 'Apr 10', applications: 12, stage: 'Phone Screen', recruiter: 'Maria Santos', status: 'Active' },
  { id: 4,  title: 'Financial Analyst',       dept: 'Finance',    location: 'Chicago',  posted: 'Apr 12', applications: 8,  stage: 'New',          recruiter: 'Alice Chen',   status: 'Active' },
  { id: 5,  title: 'Warehouse Lead',          dept: 'Operations', location: 'Chicago',  posted: 'Apr 15', applications: 18, stage: 'Offer',        recruiter: 'David Kim',    status: 'Active' },
  { id: 6,  title: 'UX Designer',             dept: 'IT',         location: 'Remote',   posted: 'Apr 18', applications: 11, stage: 'Interviewing', recruiter: 'Sarah Kim',    status: 'Active' },
  { id: 7,  title: 'HR Business Partner',     dept: 'HR',         location: 'Chicago',  posted: 'Apr 2',  applications: 9,  stage: 'Screening',    recruiter: 'Maria Santos', status: 'Active' },
  { id: 8,  title: 'DevOps Engineer',         dept: 'IT',         location: 'Remote',   posted: 'Apr 8',  applications: 14, stage: 'Phone Screen', recruiter: 'Sarah Kim',    status: 'Active' },
  { id: 9,  title: 'Supply Chain Manager',    dept: 'Operations', location: 'Chicago',  posted: 'Mar 28', applications: 6,  stage: 'Interviewing', recruiter: 'Alice Chen',   status: 'Active' },
  { id: 10, title: 'Data Analyst',            dept: 'Finance',    location: 'New York', posted: 'Apr 20', applications: 4,  stage: 'New',          recruiter: 'David Kim',    status: 'Active' },
]

const interviews = [
  { id: 1, date: 'Apr 22', time: '9:00 AM',  candidate: 'Jordan Mills',  position: 'Sr. Software Engineer', interviewer: 'David Kim',    type: 'Video'    },
  { id: 2, date: 'Apr 22', time: '11:00 AM', candidate: 'Lena Hoffman',  position: 'Sr. Software Engineer', interviewer: 'Sarah Kim',    type: 'Video'    },
  { id: 3, date: 'Apr 23', time: '10:00 AM', candidate: 'Nina Osei',     position: 'UX Designer',           interviewer: 'Alice Chen',   type: 'Video'    },
  { id: 4, date: 'Apr 23', time: '2:00 PM',  candidate: 'Marco Silva',   position: 'Sr. Software Engineer', interviewer: 'Tom Jackson',  type: 'On-site'  },
  { id: 5, date: 'Apr 24', time: '9:30 AM',  candidate: 'Priya Gupta',   position: 'HR Business Partner',   interviewer: 'Maria Santos', type: 'Phone'    },
  { id: 6, date: 'Apr 24', time: '3:00 PM',  candidate: 'Alex Reeves',   position: 'DevOps Engineer',       interviewer: 'David Kim',    type: 'Video'    },
  { id: 7, date: 'Apr 25', time: '1:00 PM',  candidate: 'Sam Torres',    position: 'Operations Analyst',    interviewer: 'Maria Santos', type: 'On-site'  },
  { id: 8, date: 'Apr 25', time: '4:00 PM',  candidate: 'Chloe Park',    position: 'Financial Analyst',     interviewer: 'Alice Chen',   type: 'Phone'    },
]

export async function GET() {
  return NextResponse.json({
    jobs,
    interviews,
    kpis: { openPositions: 14, applications: 87, interviewsScheduled: 12, offersPending: 3, avgTimeToFill: 28 },
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  return NextResponse.json({ success: true, data: body }, { status: 201 })
}
