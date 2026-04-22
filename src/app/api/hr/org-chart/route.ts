import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type OrgNodeWithChildren = {
  id: string
  employeeId: string | null
  employeeName: string
  title: string | null
  departmentName: string | null
  parentId: string | null
  level: number
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  children?: OrgNodeWithChildren[]
}

function buildTree(nodes: OrgNodeWithChildren[], parentId: string | null = null): OrgNodeWithChildren[] {
  return nodes
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((n) => ({ ...n, children: buildTree(nodes, n.id) }))
}

export async function GET() {
  try {
    const nodes = await prisma.orgNode.findMany({
      where: { isActive: true },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
    })
    const tree = buildTree(nodes as OrgNodeWithChildren[])
    return NextResponse.json({ nodes, tree })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch org chart' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const node = await prisma.orgNode.create({ data: body })
    return NextResponse.json(node, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create org node' }, { status: 500 })
  }
}
