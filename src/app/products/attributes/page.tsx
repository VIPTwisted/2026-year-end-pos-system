import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { AttributesClient } from './AttributesClient'

export const dynamic = 'force-dynamic'

export default async function ProductAttributesPage() {
  const attributes = await prisma.productVariantAttribute.findMany({
    include: {
      values: { orderBy: { value: 'asc' } },
    },
    orderBy: { name: 'asc' },
  })

  // Count how many products use each attribute (via variants)
  const usageCounts = await prisma.variantAttributeAssignment.groupBy({
    by: ['attributeValueId'],
    _count: { variantId: true },
  })

  // Map attributeValueId → count, then roll up to attributeId
  const valueToAttrId: Record<string, string> = {}
  for (const attr of attributes) {
    for (const val of attr.values) {
      valueToAttrId[val.id] = attr.id
    }
  }

  const attrUsage: Record<string, number> = {}
  for (const row of usageCounts) {
    const attrId = valueToAttrId[row.attributeValueId]
    if (attrId) {
      attrUsage[attrId] = (attrUsage[attrId] ?? 0) + row._count.variantId
    }
  }

  const attributesWithUsage = attributes.map(a => ({
    ...a,
    usageCount: attrUsage[a.id] ?? 0,
  }))

  return (
    <>
      <TopBar title="Product Attributes" />
      <AttributesClient initialAttributes={attributesWithUsage} />
    </>
  )
}
