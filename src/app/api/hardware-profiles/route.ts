import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const profiles = await prisma.hardwareProfile.findMany({
    include: { registers: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(profiles)
}

export async function POST(req: Request) {
  const body = await req.json()
  const profile = await prisma.hardwareProfile.create({
    data: {
      profileNumber: body.profileNumber,
      profileName: body.profileName,
      hardwareStationType: body.hardwareStationType ?? 'dedicated',
      cashDrawerDevice: body.cashDrawerDevice,
      cashDrawerOpenBeforeTender: body.cashDrawerOpenBeforeTender ?? true,
      barcodeDevice: body.barcodeDevice,
      barcodeKeyboardWedge: body.barcodeKeyboardWedge ?? true,
      printerDevice: body.printerDevice,
      printerDriver: body.printerDriver,
      customerDisplayActive: body.customerDisplayActive ?? false,
      customerDisplayLines: body.customerDisplayLines ?? 2,
      scaleDevice: body.scaleDevice,
    },
  })
  return NextResponse.json(profile, { status: 201 })
}
