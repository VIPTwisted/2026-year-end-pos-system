import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const profiles = await prisma.functionalityProfile.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(profiles)
}

export async function POST(req: Request) {
  const body = await req.json()
  const profile = await prisma.functionalityProfile.create({
    data: { profileId: body.profileId, name: body.name, description: body.description },
  })
  return NextResponse.json(profile, { status: 201 })
}
