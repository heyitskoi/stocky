"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Package,
  Scan,
  Plus,
  Minus,
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle,
  Building,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BarcodeScanner } from "./barcode-scanner"
import { stockApi } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import type { StockIntakeRequest, BarcodeItem, Department } from "@/types/stock"

interface StockIntakeFormProps {
  onSuccess?: () => void
}

export function StockIntakeForm({ onSuccess }: StockIntakeFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])

  // Form state
  const [formData, setFormData] = useState<Partial<StockIntakeRequest>>({
    item_name: "",
    barcode: "",
    quantity: 1,
    supplier_vendor: "",
    purchase_order_number: "",
    unit_cost: 0,
    total_cost: 0,
    received_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    category: "",
    department_id: user?.department_id || 1,
  })

  const [barcodeItem, setBarcodeItem] = useState<BarcodeItem | null>(null)
  const [isNewItem, setIsNewItem] = useState(false)
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)

  // Load departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await stockApi.getDepartments()
        setDepartments(depts)
      } catch (err) {
        console.error("Failed to load departments:", err)
      }
    }
    loadDepartments()
  }, [])

  // Auto-calculate total cost
  useEffect(() => {
    const total = (formData.unit_cost || 0) * (formData.quantity || 0)
    setFormData((prev) => ({ ...prev, total_cost: total }))
  }, [formData.unit_cost, formData.quantity])

  const handleInputChange = (field: keyof StockIntakeRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, (formData.quantity || 1) + delta)
    handleInputChange("quantity", newQuantity)
  }

  const handleBarcodeScan = async (barcode: string) => {
    try {
      setLoading(true)
      const item = await stockApi.lookupBarcode(barcode)

      if (item) {
        setBarcodeItem(item)
        setFormData((prev) => ({
          ...prev,
          barcode,
          item_name: item.name,
          category: item.category || prev.category,
          supplier_vendor: item.supplier || prev.supplier_vendor,
          unit_cost: item.unit_cost || prev.unit_cost,
        }))
        setIsNewItem(false)
        setSuccess(`Found existing item: ${item.name}`)
      } else {
        setBarcodeItem(null)
        setFormData((prev) => ({ ...prev, barcode }))
        setIsNewItem(true)
        setError("Unknown barcode - you can create a new item")
      }
    } catch (err) {
      setError("Failed to lookup barcode")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a JPEG, PNG, or PDF file")
        return
      }

      if (file.size > maxSize) {
        setError("File size must be less than 5MB")
        return
      }

      setInvoiceFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.item_name?.trim()) {
      setError("Item name is required")
      return
    }

    if (!formData.supplier_vendor?.trim()) {
      setError("Supplier/vendor is required")
      return
    }

    if ((formData.quantity || 0) <= 0) {
      setError("Quantity must be greater than 0")
      return
    }

    if ((formData.unit_cost || 0) < 0) {
      setError("Unit cost cannot be negative")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const intakeData: StockIntakeRequest = {
        ...formData,
        invoice_file: invoiceFile || undefined,
      } as StockIntakeRequest

      const response = await stockApi.intakeStock(intakeData)

      setSuccess(
        response.is_new_item
          ? `New item "${formData.item_name}" created and ${formData.quantity} units added to inventory`
          : `${formData.quantity} units of "${formData.item_name}" added to existing inventory`,
      )

      // Reset form
      setFormData({
        item_name: "",
        barcode: "",
        quantity: 1,
        supplier_vendor: "",
        purchase_order_number: "",
        unit_cost: 0,
        total_cost: 0,
        received_date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
        category: "",
        department_id: user?.department_id || 1,
      })
      setBarcodeItem(null)
      setIsNewItem(false)
      setInvoiceFile(null)

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process stock intake")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          Stock Intake Form
        </CardTitle>
        <CardDescription>Record new stock arrivals and deliveries. Scan barcodes for quick entry.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Barcode Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Item Identification</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setScannerOpen(true)}
                className="flex items-center gap-2"
              >
                <Scan className="h-4 w-4" />
                Scan Barcode
              </Button>
            </div>

            {formData.barcode && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Badge variant="outline">Barcode: {formData.barcode}</Badge>
                {barcodeItem && <Badge variant="secondary">Found in database</Badge>}
                {isNewItem && <Badge variant="outline">New item</Badge>}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name *</Label>
                <Input
                  id="item-name"
                  value={formData.item_name}
                  onChange={(e) => handleInputChange("item_name", e.target.value)}
                  placeholder="Enter or scan item name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category || ""} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="office-supplies">Office Supplies</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="consumables">Consumables</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quantity Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Quantity Received</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={formData.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 max-w-32">
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
                  className="text-center text-lg font-semibold"
                />
              </div>
              <Button type="button" variant="outline" size="icon" onClick={() => handleQuantityChange(1)}>
                <Plus className="h-4 w-4" />
              </Button>
              <div className="text-sm text-muted-foreground">Tap +/- to adjust quantity as you scan items</div>
            </div>
          </div>

          <Separator />

          {/* Supplier & Order Info */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Supplier & Order Information</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier/Vendor *</Label>
                <Input
                  id="supplier"
                  value={formData.supplier_vendor}
                  onChange={(e) => handleInputChange("supplier_vendor", e.target.value)}
                  placeholder="e.g., Dell, Amazon, Office Depot"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="po-number">Purchase Order Number</Label>
                <Input
                  id="po-number"
                  value={formData.purchase_order_number}
                  onChange={(e) => handleInputChange("purchase_order_number", e.target.value)}
                  placeholder="PO-2024-001"
                />
              </div>
            </div>
          </div>

          {/* Cost Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Information
            </Label>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="unit-cost">Unit Cost</Label>
                <Input
                  id="unit-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_cost}
                  onChange={(e) => handleInputChange("unit_cost", Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-cost">Total Cost</Label>
                <Input
                  id="total-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_cost}
                  onChange={(e) => handleInputChange("total_cost", Number(e.target.value))}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-calculated: {formData.quantity} × ${formData.unit_cost} = ${formData.total_cost?.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="received-date">Received Date</Label>
                <Input
                  id="received-date"
                  type="date"
                  value={formData.received_date}
                  onChange={(e) => handleInputChange("received_date", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Department & Notes */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department_id?.toString() || ""}
                  onValueChange={(value) => handleInputChange("department_id", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {dept.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-upload">Invoice/Receipt</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="invoice-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("invoice-upload")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {invoiceFile ? "Change File" : "Upload File"}
                  </Button>
                  {invoiceFile && <span className="text-sm text-muted-foreground">{invoiceFile.name}</span>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="e.g., Damaged packaging, partial delivery, special handling required..."
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.notes?.length || 0}/500 characters
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Record Stock Intake
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Barcode Scanner Modal */}
        <BarcodeScanner open={scannerOpen} onOpenChange={setScannerOpen} onScan={handleBarcodeScan} />
      </CardContent>
    </Card>
  )
}
