import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, actorName, actorRole, comment } = body

    if (!action || !actorName || !actorRole) {
      return NextResponse.json({ error: 'action, actorName, actorRole are required' }, { status: 400 })
    }
    if (!['approve', 'reject', 'comment'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve | reject | comment' }, { status: 400 })
    }

    const approvalRequest = await prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        workflow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
      },
    })
    if (!approvalRequest) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (approvalRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request is no longer pending' }, { status: 400 })
    }

    const newAction = await prisma.approvalAction.create({
      data: {
        requestId: id,
        stepOrder: approvalRequest.currentStep,
        action,
        actorName,
        actorRole,
        comment: comment ?? null,
      },
    })

    // Determine new request state
    let newStatus = approvalRequest.status
    let nextStep = approvalRequest.currentStep

    if (action === 'reject') {
      newStatus = 'rejected'
    } else if (action === 'approve') {
      const totalSteps = approvalRequest.workflow.steps.length
      if (approvalRequest.currentStep >= totalSteps) {
        newStatus = 'approved'
      } else {
        nextStep = approvalRequest.currentStep + 1
      }
    }

    const updatedRequest = await prisma.approvalRequest.update({
      where: { id },
      data: { status: newStatus, currentStep: nextStep },
      include: {
        workflow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
        actions: { orderBy: { createdAt: 'asc' } },
      },
    })

    return NextResponse.json({ action: newAction, request: updatedRequest }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 })
  }
}
