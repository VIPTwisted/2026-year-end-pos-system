import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const profiles = await prisma.sMTPProfile.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(profiles)
}

export async function POST(req: Request) {
  const body = await req.json()
  const profile = await prisma.sMTPProfile.create({
    data: {
      profileName: body.profileName,
      host: body.host,
      port: body.port ?? 587,
      username: body.username,
      useTLS: body.useTLS ?? true,
      fromEmail: body.fromEmail,
      fromName: body.fromName,
      isDefault: body.isDefault ?? false,
    },
  })
  return NextResponse.json(profile, { status: 201 })
}
