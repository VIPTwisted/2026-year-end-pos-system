// TODO: Replace with real job runner once JobQueue Prisma model + task runner are added
import { NextResponse } from 'next/server'
import { getJobs, setJobStatus } from '../../route'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const jobs = getJobs()
  const job = jobs.find(j => j.id === id)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  if (job.status === 'running') {
    return NextResponse.json({ error: 'Job is already running' }, { status: 409 })
  }

  // Mark as running (in real impl: enqueue task + update DB)
  setJobStatus(id, 'running')

  // Simulate async completion after 3s (in-memory only — resets on restart)
  setTimeout(() => {
    setJobStatus(id, 'active')
  }, 3000)

  return NextResponse.json({ message: `Job "${job.name}" triggered`, jobId: id, status: 'running' })
}
