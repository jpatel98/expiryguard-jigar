import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'
import { dbConnect } from "@/lib/dbConnect"
import Product from "@/models/Product"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, barcode, price, quantity, expiryDate, batchNumber } = body

    // Create or find the product
    const product = await prisma.product.upsert({
      where: { barcode },
      update: {},
      create: {
        name,
        description,
        barcode,
        price,
      },
    })

    // Create a new batch
    const batch = await prisma.batch.create({
      data: {
        number: batchNumber,
        productId: product.id,
        quantity,
        expiryDate: new Date(expiryDate),
      },
    })

    // Generate QR codes for each item in the batch
    const stockItems = await Promise.all(
      Array(quantity)
        .fill(null)
        .map(async () => {
          const qrCodeData = {
            productId: product.id,
            batchId: batch.id,
            expiryDate: expiryDate,
          }
          const qrCode = await QRCode.toDataURL(JSON.stringify(qrCodeData))
          
          return prisma.stockItem.create({
            data: {
              productId: product.id,
              batchId: batch.id,
              qrCode,
            },
          })
        })
    )

    return NextResponse.json({
      success: true,
      data: {
        product,
        batch,
        stockItems,
      },
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const barcode = searchParams.get("barcode")
    const search = searchParams.get("search")

    if (!barcode && !search) {
      return NextResponse.json(
        { error: "Barcode or search query is required" },
        { status: 400 }
      )
    }

    await dbConnect()

    let query = {}
    if (barcode) {
      query = { barcode }
    } else if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { barcode: { $regex: search, $options: "i" } },
        ],
      }
    }

    const products = await Product.find(query).limit(10)

    if (!products.length) {
      return NextResponse.json(
        { error: "No products found" },
        { status: 404 }
      )
    }

    return NextResponse.json(products[0])
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
} 