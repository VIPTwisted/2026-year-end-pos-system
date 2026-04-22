// TODO: Replace mock state with Prisma JobQueue model once schema is added
import { NextResponse } from 'next/server'
import { getJobs, setJobStatus } from '../route'
import type { JobQueueRecord } from '../route'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const jobs = getJobs()
  const job = jobs.find(j => j.id === id)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  return NextResponse.json(job)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json() as { status: JobQueueRecord['status'] }
  const jobs = getJobs()
  const job = jobs.find(j => j.id === id)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  setJobStatus(id, body.status)
  return NextResponse.json({ ...job, status: body.status })
}
