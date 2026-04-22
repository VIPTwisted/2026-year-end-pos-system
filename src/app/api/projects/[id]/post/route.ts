import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Transfer planning lines to ledger entries (BC "Post" action)
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        planningLines: { where: { isTransferred: false } },
      },
    })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot post a cancelled project' }, { status: 400 })
    }

    const unposted = project.planningLines
    if (unposted.length === 0) {
      return NextResponse.json({ message: 'No unposted planning lines', posted: 0 })
    }

    const docNo = `POST-${Date.now()}`

    await prisma.$transaction([
      // Create ledger entries for each planning line
      ...unposted.map((line) =>
        prisma.projectEntry.create({
          data: {
            projectId: id,
            taskId: line.taskId,
            entryType: line.lineType,
            description: line.description,
            quantity: Number(line.quantity),
            unitPrice: Number(line.unitPrice),
            totalCost: Number(line.quantity) * Number(line.unitCost),
            totalPrice: Number(line.quantity) * Number(line.unitPrice),
            postingDate: new Date(),
          },
        })
      ),
      // Mark lines as transferred
      prisma.projectPlanningLine.updateMany({
        where: { projectId: id, isTransferred: false },
        data: { isTransferred: true },
      }),
      // Auto-open project if still planning
      ...(project.status === 'planning'
        ? [prisma.project.update({ where: { id }, data: { status: 'open' } })]
        : []),
    ])

    return NextResponse.json({ message: 'Posted successfully', posted: unposted.length })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Post failed' }, { status: 500 })
  }
}
