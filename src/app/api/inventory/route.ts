import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/dbConnect"
import Inventory from "@/models/Inventory"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, quantity, expiryDate, status } = body

    if (!productId || !quantity || !expiryDate || !status) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    await dbConnect()

    const inventoryItem = await Inventory.create({
      productId,
      quantity,
      expiryDate,
      status,
    })

    return NextResponse.json(inventoryItem, { status: 201 })
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const productId = searchParams.get("productId")

    await dbConnect()

    let query = {}
    if (status) {
      query = { ...query, status }
    }
    if (productId) {
      query = { ...query, productId }
    }

    const inventory = await Inventory.find(query)
      .populate("productId")
      .sort({ createdAt: -1 })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    )
  }
} 