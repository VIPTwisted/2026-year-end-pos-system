import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [totalProfiles, activeSegments, activeMeasures, dataSourcesConnected, modelsActive] = await Promise.all([
    prisma.cICustomerProfile.count(),
    prisma.cISegment.count({ where: { isActive: true } }),
    prisma.cIMeasure.count({ where: { isActive: true } }),
    prisma.cIDataSource.count({ where: { status: 'active' } }),
    prisma.cIPredictionModel.count({ where: { status: { in: ['active', 'running'] } } }),
  ])
  return NextResponse.json({ totalProfiles, activeSegments, activeMeasures, dataSourcesConnected, modelsActive })
}
