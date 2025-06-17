"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowRight, Building, Package, AlertCircle, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { stockApi } from "@/lib/api"
import type { StockItem, Department } from "@/types/stock"

interface TransferStockDialogProps {
  item?: StockItem | null // Optional pre-selected item
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TransferStockDialog({
  item: preSelectedItem,
  open,
  onOpenChange,
  onSuccess,
}: TransferStockDialogProps) {
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(preSelectedItem || null)
  const [toDepartmentId, setToDepartmentId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingData, setLoadingData] = useState(true)

  // Load departments and stock items (only if no pre-selected item)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true)
        const depts = await stockApi.getDepartments()

        if (preSelectedItem) {
          // If we have a pre-selected item, filter out its current department
          setDepartments(depts.filter((dept) => dept.id !== preSelectedItem.department_id))
          setStockItems([]) // Don't need to load all stock items
        } else {
          // If no pre-selected item, load all departments and stock items
          setDepartments(depts)
          const stock = await stockApi.getStock()
          setStockItems(stock)
        }
      } catch (err) {
        console.error("Failed to load data:", err)
        setError("Failed to load departments and stock items")
      } finally {
        setLoadingData(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open, preSelectedItem])

  // Reset form when dialog opens/closes or when pre-selected item changes
  useEffect(() => {
    if (!open) {
      setSelectedItem(preSelectedItem || null)
      setToDepartmentId(null)
      setQuantity(1)
      setReason("")
      setNotes("")
      setError(null)
      setSearchTerm("")
    } else {
      setSelectedItem(preSelectedItem || null)
      if (preSelectedItem) {
        setSearchTerm(preSelectedItem.name)
        setQuantity(Math.min(1, preSelectedItem.quantity))
      }
    }
  }, [open, preSelectedItem])

  // Update quantity when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setQuantity(Math.min(1, selectedItem.quantity))
    }
  }, [selectedItem])

  const filteredStockItems = stockItems.filter(
    (item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toString().includes(searchTerm),
  )

  const selectedDepartment = departments.find((dept) => dept.id === toDepartmentId)
  const currentDepartment =
    departments.find((dept) => dept.id === selectedItem?.department_id) ||
    (preSelectedItem ? { id: preSelectedItem.department_id, name: "Current Department" } : null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedItem || !toDepartmentId) {
      setError("Please select both a stock item and destination department")
      return
    }

    if (selectedItem.department_id === toDepartmentId) {
      setError("Cannot transfer to the same department")
      return
    }

    if (quantity <= 0 || quantity > selectedItem.quantity) {
      setError(`Quantity must be between 1 and ${selectedItem.quantity}`)
      return
    }

    try {
      setLoading(true)
      setError(null)

      await stockApi.transferStock({
        stock_item_id: selectedItem.id,
        from_department_id: selectedItem.department_id,
        to_department_id: toDepartmentId,
        quantity,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
      })

      // Show success message
      if (typeof window !== "undefined") {
        alert(
          `Success: Transfer request for ${quantity} ${selectedItem.name} from ${currentDepartment?.name} to ${selectedDepartment?.name} has been initiated.`,
        )
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initiate transfer"
      setError(errorMessage)

      // Also show error toast
      if (typeof window !== "undefined") {
        alert(`Error: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    selectedItem && toDepartmentId !== null && quantity > 0 && quantity <= (selectedItem?.quantity || 0) && !loading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{preSelectedItem ? "Transfer Stock Item" : "Initiate Stock Transfer"}</DialogTitle>
          <DialogDescription>
            {preSelectedItem
              ? `Transfer "${preSelectedItem.name}" to another department. This action will be logged and may require approval.`
              : "Transfer stock items between departments. This will create a transfer request that may require approval."}
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stock Item Selection - Only show if no pre-selected item */}
            {!preSelectedItem && (
              <div className="space-y-3">
                <Label htmlFor="stock-search">Select Stock Item *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="stock-search"
                    placeholder="Search by item name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchTerm && (
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    {filteredStockItems.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No items found matching "{searchTerm}"
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {filteredStockItems.map((item) => (
                          <Card
                            key={item.id}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-muted/50",
                              selectedItem?.id === item.id && "bg-blue-50 border-blue-200",
                            )}
                            onClick={() => {
                              setSelectedItem(item)
                              setSearchTerm(item.name)
                              setError(null)
                            }}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      ID: {item.id} • Qty: {item.quantity} • Dept:{" "}
                                      {departments.find((d) => d.id === item.department_id)?.name}
                                    </div>
                                  </div>
                                </div>
                                {item.below_par && (
                                  <Badge variant="destructive" className="text-xs">
                                    Below Par
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Selected Item Display */}
            {selectedItem && (
              <>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{selectedItem.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Available: {selectedItem.quantity} units • Current Dept: {currentDepartment?.name}
                          </div>
                        </div>
                      </div>
                      {selectedItem.below_par && <Badge variant="destructive">Below Par</Badge>}
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                {/* Transfer Flow Visualization */}
                <div className="flex items-center justify-center space-x-4 py-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-2">
                      <Building className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">From</p>
                    <p className="text-xs text-muted-foreground">{currentDepartment?.name}</p>
                  </div>

                  <ArrowRight className="h-6 w-6 text-muted-foreground" />

                  <div className="text-center">
                    <div
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full mb-2",
                        selectedDepartment ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400",
                      )}
                    >
                      <Building className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">To</p>
                    <p className="text-xs text-muted-foreground">{selectedDepartment?.name || "Select department"}</p>
                  </div>
                </div>

                {/* Transfer Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Department Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="department-select">Transfer To Department *</Label>
                    <Select
                      value={toDepartmentId?.toString() || ""}
                      onValueChange={(value) => {
                        setToDepartmentId(Number(value))
                        setError(null)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination department..." />
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

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity to Transfer *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedItem.quantity}
                      value={quantity}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        setQuantity(value)
                        if (value > 0 && value <= selectedItem.quantity) {
                          setError(null)
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Maximum: {selectedItem.quantity} available</p>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Transfer Reason</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Department reorganization, project requirements..."
                    maxLength={200}
                  />
                  <div className="text-xs text-muted-foreground text-right">{reason.length}/200 characters</div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional context or special instructions..."
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-muted-foreground text-right">{notes.length}/500 characters</div>
                </div>

                {/* Transfer Summary */}
                {selectedDepartment && (
                  <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-medium mb-2">Transfer Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Item:</span>
                        <span>{selectedItem.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span>
                          {quantity} unit{quantity !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">From:</span>
                        <span>{currentDepartment?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">To:</span>
                        <span>{selectedDepartment.name}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Transfer Logic:</strong>
                          <ul className="mt-1 space-y-1 list-disc list-inside">
                            <li>If destination department has this item: quantities will be merged</li>
                            <li>If destination department doesn't have this item: new item record will be created</li>
                            <li>All transfers are tracked in audit logs for full traceability</li>
                            <li>Source department quantity will be reduced by transfer amount</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isFormValid} className="min-w-[120px]">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initiating...
                  </>
                ) : (
                  "Initiate Transfer"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
