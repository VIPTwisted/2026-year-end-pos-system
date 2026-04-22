import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    return headers.reduce(
      (obj, h, i) => ({ ...obj, [h]: values[i] ?? '' }),
      {} as Record<string, string>
    )
  })
}

interface ImportResult {
  imported: number
  updated: number
  errors: { row: number; message: string }[]
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 })
    }

    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Security: validate CSV
    const fileName = (file as File).name ?? ''
    const contentType = (file as File).type ?? ''
    if (!fileName.endsWith('.csv') && contentType !== 'text/csv') {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 })
    }

    const text = await (file as File).text()
    const rows = parseCSV(text)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV is empty or has no data rows' }, { status: 400 })
    }

    // Fetch first store for inventory records
    const store = await prisma.store.findFirst()
    if (!store) {
      return NextResponse.json({ error: 'No store configured' }, { status: 500 })
    }

    const result: ImportResult = { imported: 0, updated: 0, errors: [] }

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2 // +2: 1-based + header row
      const row = rows[i]

      try {
        const sku = row['sku']?.trim()
        if (!sku) {
          result.errors.push({ row: rowNum, message: 'Missing required field: sku' })
          continue
        }

        const name = row['name']?.trim()
        if (!name) {
          result.errors.push({ row: rowNum, message: 'Missing required field: name' })
          continue
        }

        // Parse numeric fields safely
        const price = parseFloat(row['price'] ?? '0')
        const costPrice = parseFloat(row['costPrice'] ?? '0')
        const reorderPoint = row['reorderPoint'] ? parseInt(row['reorderPoint'], 10) : undefined
        const minAge = row['minAge'] ? parseInt(row['minAge'], 10) : 0
        const requiresSerial = row['requiresSerial']?.toLowerCase() === 'true'

        if (isNaN(price)) {
          result.errors.push({ row: rowNum, message: 'Invalid price value' })
          continue
        }
        if (isNaN(costPrice)) {
          result.errors.push({ row: rowNum, message: 'Invalid costPrice value' })
          continue
        }

        // a. Find or create Category by name
        let categoryId: string | undefined
        const categoryName = row['category']?.trim()
        if (categoryName) {
          const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          const category = await prisma.productCategory.upsert({
            where: { slug },
            update: {},
            create: { name: categoryName, slug },
          })
          categoryId = category.id
        }

        // b. Find Supplier by name (skip if not found)
        let supplierId: string | undefined
        const supplierName = row['supplier']?.trim()
        if (supplierName) {
          const supplier = await prisma.supplier.findFirst({
            where: { name: supplierName },
          })
          if (supplier) {
            supplierId = supplier.id
          }
        }

        // c. Check if product with this SKU exists
        const existing = await prisma.product.findUnique({ where: { sku } })

        const productData = {
          name,
          barcode: row['barcode']?.trim() || undefined,
          description: row['description']?.trim() || undefined,
          salePrice: isNaN(price) ? 0 : price,
          costPrice: isNaN(costPrice) ? 0 : costPrice,
          categoryId: categoryId ?? null,
          supplierId: supplierId ?? null,
          reorderPoint: reorderPoint !== undefined && !isNaN(reorderPoint) ? reorderPoint : null,
          minAge: !isNaN(minAge) ? minAge : 0,
          requiresSerial,
        }

        let productId: string

        if (existing) {
          await prisma.product.update({
            where: { sku },
            data: productData,
          })
          productId = existing.id
          result.updated++
        } else {
          const created = await prisma.product.create({
            data: { sku, ...productData },
          })
          productId = created.id
          result.imported++
        }

        // d. Create/update Inventory record
        await prisma.inventory.upsert({
          where: { productId_storeId: { productId, storeId: store.id } },
          update: {},
          create: { productId, storeId: store.id, quantity: 0 },
        })
      } catch (rowErr) {
        const msg = rowErr instanceof Error ? rowErr.message : 'Unknown error'
        result.errors.push({ row: rowNum, message: msg })
      }
    }

    return NextResponse.json(result, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
