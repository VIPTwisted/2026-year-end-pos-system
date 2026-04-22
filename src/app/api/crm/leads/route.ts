import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const LEADS = [
  { id: 'L001', name: 'Maria Garcia', company: 'Fabrikam Inc', jobTitle: 'VP Operations', phone: '+1 555 0401', source: 'Web', rating: 'Hot', status: 'New', owner: 'Alice Chen', created: 'Apr 22', score: 87 },
  { id: 'L002', name: 'James Wilson', company: 'Contoso Corp', jobTitle: 'CEO', phone: '+1 555 0402', source: 'Referral', rating: 'Warm', status: 'Contacted', owner: 'Bob Wilson', created: 'Apr 20', score: 72 },
  { id: 'L003', name: 'Sarah Kim', company: 'Adatum Corp', jobTitle: 'IT Director', phone: '+1 555 0403', source: 'Trade Show', rating: 'Hot', status: 'Qualified', owner: 'Alice Chen', created: 'Apr 18', score: 91 },
  { id: 'L004', name: 'Robert Lee', company: 'Litware Inc', jobTitle: 'CFO', phone: '+1 555 0404', source: 'Phone', rating: 'Cold', status: 'New', owner: 'Carlos M.', created: 'Apr 17', score: 34 },
  { id: 'L005', name: 'Linda Chen', company: 'Northwind', jobTitle: 'Marketing Dir', phone: '+1 555 0405', source: 'Email', rating: 'Warm', status: 'Contacted', owner: 'Alice Chen', created: 'Apr 15', score: 61 },
  { id: 'L006', name: 'Michael Torres', company: 'Alpine Ski House', jobTitle: 'VP Sales', phone: '+1 555 0406', source: 'Web', rating: 'Hot', status: 'Qualified', owner: 'Bob Wilson', created: 'Apr 14', score: 88 },
  { id: 'L007', name: 'Jennifer Park', company: 'Best For You Org', jobTitle: 'Director', phone: '+1 555 0407', source: 'Social', rating: 'Warm', status: 'New', owner: 'Carlos M.', created: 'Apr 13', score: 55 },
  { id: 'L008', name: 'David Martinez', company: 'Blue Yonder', jobTitle: 'CTO', phone: '+1 555 0408', source: 'Referral', rating: 'Hot', status: 'Contacted', owner: 'Alice Chen', created: 'Apr 12', score: 79 },
  { id: 'L009', name: 'Susan Brown', company: 'City Power', jobTitle: 'Procurement Mgr', phone: '+1 555 0409', source: 'Email', rating: 'Cold', status: 'Disqualified', owner: 'Bob Wilson', created: 'Apr 11', score: 22 },
  { id: 'L010', name: 'Kevin Johnson', company: 'Coho Winery', jobTitle: 'Owner', phone: '+1 555 0410', source: 'Trade Show', rating: 'Warm', status: 'Qualified', owner: 'Carlos M.', created: 'Apr 10', score: 68 },
  { id: 'L011', name: 'Patricia White', company: 'Datum Corp', jobTitle: 'CFO', phone: '+1 555 0411', source: 'Web', rating: 'Hot', status: 'New', owner: 'Alice Chen', created: 'Apr 9', score: 83 },
  { id: 'L012', name: 'Christopher Davis', company: 'Fabrikam Fiber', jobTitle: 'VP IT', phone: '+1 555 0412', source: 'Phone', rating: 'Warm', status: 'Contacted', owner: 'Bob Wilson', created: 'Apr 8', score: 64 },
  { id: 'L013', name: 'Amanda Taylor', company: 'Fourth Coffee', jobTitle: 'CEO', phone: '+1 555 0413', source: 'Referral', rating: 'Hot', status: 'Qualified', owner: 'Carlos M.', created: 'Apr 7', score: 92 },
  { id: 'L014', name: 'Daniel Anderson', company: 'Graphic Design Inst.', jobTitle: 'Dir. Operations', phone: '+1 555 0414', source: 'Social', rating: 'Cold', status: 'New', owner: 'Alice Chen', created: 'Apr 6', score: 41 },
  { id: 'L015', name: 'Michelle Jackson', company: 'Humongous Ins.', jobTitle: 'VP Finance', phone: '+1 555 0415', source: 'Email', rating: 'Warm', status: 'Contacted', owner: 'Bob Wilson', created: 'Apr 5', score: 57 },
  { id: 'L016', name: 'Andrew Harris', company: 'Lucerne Publishing', jobTitle: 'COO', phone: '+1 555 0416', source: 'Web', rating: 'Hot', status: 'Qualified', owner: 'Carlos M.', created: 'Apr 4', score: 85 },
  { id: 'L017', name: "Margie's Travel", company: "Margie's Travel", jobTitle: 'Owner', phone: '+1 555 0417', source: 'Trade Show', rating: 'Cold', status: 'Disqualified', owner: 'Alice Chen', created: 'Apr 3', score: 18 },
  { id: 'L018', name: 'Ryan Thompson', company: 'Munson Pickles', jobTitle: 'Sales Manager', phone: '+1 555 0418', source: 'Referral', rating: 'Warm', status: 'New', owner: 'Bob Wilson', created: 'Apr 2', score: 63 },
  { id: 'L019', name: 'Nicole Garcia', company: 'Northwind Traders', jobTitle: 'IT Manager', phone: '+1 555 0419', source: 'Phone', rating: 'Hot', status: 'Contacted', owner: 'Carlos M.', created: 'Apr 1', score: 77 },
  { id: 'L020', name: 'Brandon Wilson', company: 'Relecloud', jobTitle: 'VP Engineering', phone: '+1 555 0420', source: 'Social', rating: 'Warm', status: 'Qualified', owner: 'Alice Chen', created: 'Mar 31', score: 69 },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const rating = searchParams.get('rating')
  const source = searchParams.get('source')
  const search = searchParams.get('search')

  let leads = [...LEADS]
  if (status) leads = leads.filter(l => l.status === status)
  if (rating) leads = leads.filter(l => l.rating === rating)
  if (source) leads = leads.filter(l => l.source === source)
  if (search) leads = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase())
  )

  return NextResponse.json({ leads, total: 156, page: 1, pageSize: 20 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newLead = {
    id: `L${String(LEADS.length + 1).padStart(3, '0')}`,
    ...body,
    created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: 50,
  }
  return NextResponse.json({ lead: newLead }, { status: 201 })
}
