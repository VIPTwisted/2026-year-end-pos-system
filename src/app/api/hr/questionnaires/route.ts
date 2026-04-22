import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  const questionnaires = await prisma.questionnaire.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    },
    include: {
      questions: { orderBy: { sortOrder: 'asc' } },
      responses: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(questionnaires)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, description, type, anonymous, dueDate, questions } = body

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const questionnaire = await prisma.questionnaire.create({
    data: {
      title,
      description: description ?? null,
      type: type ?? 'survey',
      anonymous: anonymous ?? false,
      dueDate: dueDate ? new Date(dueDate) : null,
      questions: questions && questions.length > 0
        ? {
            create: questions.map((q: {
              sortOrder: number
              questionText: string
              questionType?: string
              required?: boolean
              optionsJson?: string | null
            }) => ({
              sortOrder: q.sortOrder,
              questionText: q.questionText,
              questionType: q.questionType ?? 'text',
              required: q.required ?? true,
              optionsJson: q.optionsJson ?? null,
            })),
          }
        : undefined,
    },
    include: { questions: true },
  })
  return NextResponse.json(questionnaire, { status: 201 })
}
