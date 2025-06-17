"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Flashlight, FlashlightOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BarcodeScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (barcode: string) => void
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Simulate barcode scanning for demo purposes
  const simulateBarcodeScan = () => {
    const mockBarcodes = ["1234567890123", "9876543210987", "5555666677778", "1111222233334", "9999888877776"]
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]
    onScan(randomBarcode)
    onOpenChange(false)
  }

  const startCamera = async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Check if we're in a browser environment
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        throw new Error("Camera not supported in this environment")
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Check for flash capability
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      setHasFlash(!!capabilities.torch)
    } catch (err) {
      console.error("Camera error:", err)
      setError("Unable to access camera. Please ensure camera permissions are granted.")
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
    setFlashOn(false)
  }

  const toggleFlash = async () => {
    if (!streamRef.current) return

    try {
      const track = streamRef.current.getVideoTracks()[0]
      await track.applyConstraints({
        advanced: [{ torch: !flashOn }],
      })
      setFlashOn(!flashOn)
    } catch (err) {
      console.error("Flash toggle error:", err)
    }
  }

  useEffect(() => {
    if (open) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="relative">
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                {isScanning ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-white w-64 h-32 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500 rounded-br-lg"></div>
                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 animate-pulse"></div>
                      </div>
                    </div>
                    {/* Flash toggle */}
                    {hasFlash && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-4 right-4 bg-black/50 border-white/20"
                        onClick={toggleFlash}
                      >
                        {flashOn ? (
                          <FlashlightOff className="h-4 w-4 text-white" />
                        ) : (
                          <Flashlight className="h-4 w-4 text-white" />
                        )}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Position the barcode within the scanning area</p>

            {/* Demo button for testing */}
            <Button onClick={simulateBarcodeScan} variant="outline" className="w-full">
              Simulate Barcode Scan (Demo)
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={startCamera} disabled={isScanning} className="flex-1">
              {isScanning ? "Scanning..." : "Retry Camera"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
