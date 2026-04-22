import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const notes = await prisma.cRMNote.findMany({
      where: { contactId: id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(notes)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const note = await prisma.cRMNote.create({ data: { ...body, contactId: id } })
    return NextResponse.json(note, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
