"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarcodeScanner } from "@/components/BarcodeScanner"
import { toast } from "sonner"

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [expiryDate, setExpiryDate] = useState("")

  const handleScan = async (barcode: string) => {
    try {
      const response = await fetch(`/api/products?barcode=${barcode}`)
      if (!response.ok) {
        throw new Error("Failed to fetch product details")
      }
      const data = await response.json()
      setProduct(data)
      toast.success("Product found!")
    } catch (error) {
      toast.error("Failed to fetch product details")
      console.error(error)
    }
  }

  const handleSubmit = async () => {
    if (!product || !expiryDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          expiryDate,
          status: "In stock",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add product to inventory")
      }

      toast.success("Product added to inventory!")
      setProduct(null)
      setQuantity(1)
      setExpiryDate("")
      setManualBarcode("")
    } catch (error) {
      toast.error("Failed to add product to inventory")
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Scan Product</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scan Barcode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => setIsScanning(!isScanning)}
                className="w-full"
              >
                {isScanning ? "Stop Scanning" : "Start Scanning"}
              </Button>
              
              {isScanning && (
                <div className="aspect-video relative">
                  <BarcodeScanner onScan={handleScan} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="manual-barcode">Or Enter Barcode Manually</Label>
                <Input
                  id="manual-barcode"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Enter barcode number"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleScan(manualBarcode)
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {product && (
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Product Name</Label>
                  <p className="text-lg font-medium">{product.name}</p>
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="expiry-date">Expiry Date</Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Add to Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 