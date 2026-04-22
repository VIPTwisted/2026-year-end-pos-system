import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const lead = await prisma.salesLead.update({
      where: { id },
      data: { status: 'qualified', qualifiedAt: new Date() },
    })
    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to qualify lead' }, { status: 500 })
  }
}
