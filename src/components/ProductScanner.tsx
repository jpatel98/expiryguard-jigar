'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { BarcodeScanner } from './BarcodeScanner'

interface ProductScannerProps {
  onProductAdded?: () => void
}

export function ProductScanner({ onProductAdded }: ProductScannerProps) {
  const [barcode, setBarcode] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [expiryDate, setExpiryDate] = useState('')
  const [batchNumber, setBatchNumber] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleBarcodeScan = (scannedBarcode: string) => {
    setBarcode(scannedBarcode)
    toast.success('Barcode scanned successfully!')
  }

  const handleScanError = (error: string) => {
    toast.error('Error scanning barcode: ' + error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real application, you would fetch product details from the store's database
      // For now, we'll use mock data
      const productData = {
        name: 'Sample Product', // This would come from the store's database
        description: 'Sample description',
        barcode,
        price: 9.99,
        quantity,
        expiryDate,
        batchNumber,
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error('Failed to add product')
      }

      const data = await response.json()
      toast.success('Product added successfully!')
      onProductAdded?.()
      
      // Reset form
      setBarcode('')
      setQuantity(1)
      setExpiryDate('')
      setBatchNumber(prev => prev + 1)
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error('Failed to add product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan or enter barcode"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setBarcode('')}
              >
                Clear
              </Button>
            </div>
          </div>

          <BarcodeScanner
            onScan={handleBarcodeScan}
            onError={handleScanError}
          />

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">Batch Number</Label>
            <Input
              id="batchNumber"
              type="number"
              min="1"
              value={batchNumber}
              onChange={(e) => setBatchNumber(parseInt(e.target.value))}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 