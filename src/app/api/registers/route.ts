import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId')
  const status = searchParams.get('status')
  const terminalType = searchParams.get('terminalType')

  const registers = await prisma.pOSRegister.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(status ? { status } : {}),
      ...(terminalType ? { terminalType } : {}),
    },
    include: { hardwareProfile: true, shifts: { take: 1, orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(registers)
}

export async function POST(req: Request) {
  const body = await req.json()
  const register = await prisma.pOSRegister.create({
    data: {
      registerNumber: body.registerNumber,
      storeId: body.storeId,
      storeName: body.storeName,
      hardwareProfileId: body.hardwareProfileId,
      terminalType: body.terminalType ?? 'POS',
      drawerLimit: body.drawerLimit ?? 500,
    },
  })
  return NextResponse.json(register, { status: 201 })
}
