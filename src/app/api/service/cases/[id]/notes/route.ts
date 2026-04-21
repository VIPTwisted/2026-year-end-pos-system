import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { content, authorId, isPublic } = body

  if (!content) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  const existing = await prisma.serviceCase.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  const note = await prisma.caseNote.create({
    data: {
      caseId: id,
      content,
      authorId: authorId ?? null,
      isPublic: isPublic ?? false,
    },
  })

  return NextResponse.json(note, { status: 201 })
}
