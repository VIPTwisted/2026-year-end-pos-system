import { prisma } from '@/lib/prisma'
import WrapUpClient from './WrapUpClient'

export const dynamic = 'force-dynamic'

export default async function WrapUpCodesPage() {
  const codes = await prisma.wrapUpCode.findMany({ orderBy: [{ category: 'asc' }, { code: 'asc' }] })
  return <WrapUpClient codes={codes} />
}
