import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const notes = await prisma.caseNote.findMany({
    where: { caseId: id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(notes)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { noteType, body: noteBody, authorName } = body

  if (!noteBody) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }

  const existing = await prisma.serviceCase2.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  const note = await prisma.caseNote.create({
    data: {
      caseId:     id,
      noteType:   noteType   ?? 'internal',
      body:       noteBody,
      authorName: authorName ?? null,
    },
  })

  return NextResponse.json(note, { status: 201 })
}
