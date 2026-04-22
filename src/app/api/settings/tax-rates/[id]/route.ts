import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const taxCode = await prisma.taxCode.findUnique({ where: { id } })
    if (!taxCode) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(taxCode)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json() as Partial<{
      code: string
      name: string
      rate: number
      taxType: string
      description: string | null
      isActive: boolean
    }>

    const data: Prisma.TaxCodeUpdateInput = {}
    if (body.code       !== undefined) data.code        = body.code
    if (body.name       !== undefined) data.name        = body.name
    if (body.rate       !== undefined) data.rate        = Number(body.rate)
    if (body.taxType    !== undefined) data.taxType     = body.taxType
    if (body.description !== undefined) data.description = body.description
    if (body.isActive   !== undefined) data.isActive    = body.isActive

    const taxCode = await prisma.taxCode.update({ where: { id }, data })
    return NextResponse.json(taxCode)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    // Check if this tax code is referenced by any tax transactions
    const usageCount = await prisma.taxTransaction.count({
      where: { taxCodeId: id },
    })

    if (usageCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete — this tax code is referenced by ${usageCount} transaction(s)` },
        { status: 409 },
      )
    }

    await prisma.taxCode.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
