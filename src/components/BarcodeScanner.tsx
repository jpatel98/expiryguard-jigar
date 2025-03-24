'use client'

import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    scannerRef.current = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    )

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText)
      },
      (error) => {
        // Ignore errors as they are common during scanning
        console.debug(error)
      }
    )

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [onScan])

  return <div id="reader" ref={containerRef} />
} 