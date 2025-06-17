"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  ArrowRight,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Building,
  Package,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import type { StockTransfer, TransferFilters } from "@/types/stock"
import { stockApi } from "@/lib/api"
import { TransferStockDialog } from "@/components/transfer-stock-dialog"

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "secondary",
  rejected: "destructive",
  completed: "default",
}

function useTransfers(filters: TransferFilters = {}) {
  const [data, setData] = useState<{
    transfers: StockTransfer[]
    total: number
    page: number
    total_pages: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransfers = async (newFilters: TransferFilters = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await stockApi.getTransfers({ ...filters, ...newFilters })
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transfers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransfers()
  }, [])

  return {
    data,
    transfers: data?.transfers || [],
    loading,
    error,
    refetch: fetchTransfers,
  }
}

function TransferManagementContent() {
  const { user, hasRole } = useAuth()
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([])

  // Filter state
  const [filters, setFilters] = useState<TransferFilters>({
    page: 1,
    per_page: 50,
  })

  const [transferDialogOpen, setTransferDialogOpen] = useState(false)

  const { data, transfers, loading, error, refetch } = useTransfers(filters)

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

  const handleFilterChange = (key: keyof TransferFilters, value: string | number | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value === "" ? undefined : value,
      page: key !== "page" ? 1 : value, // Reset to page 1 when changing filters
    }
    setFilters(newFilters)
    refetch(newFilters)
  }

  const handlePageChange = (newPage: number) => {
    handleFilterChange("page", newPage)
  }

  const clearFilters = () => {
    const clearedFilters = { page: 1, per_page: 50 }
    setFilters(clearedFilters)
    refetch(clearedFilters)
  }

  const handleApproveTransfer = async (transferId: number) => {
    try {
      await stockApi.approveTransfer(transferId)
      alert("Transfer approved successfully!")
      refetch(filters)
    } catch (err) {
      alert("Failed to approve transfer")
    }
  }

  const handleRejectTransfer = async (transferId: number) => {
    try {
      await stockApi.rejectTransfer(transferId)
      alert("Transfer rejected successfully!")
      refetch(filters)
    } catch (err) {
      alert("Failed to reject transfer")
    }
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">Error loading transfers</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
              <Button onClick={() => refetch(filters)} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transfer Management</h1>
          <p className="text-muted-foreground">Manage stock transfers between departments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch(filters)} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setTransferDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <ArrowRight className="mr-2 h-4 w-4" />
            New Transfer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter transfers by status, department, or item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="status-select">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value === "all" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from-dept-select">From Department</Label>
              <Select
                value={filters.from_department_id?.toString() || "all"}
                onValueChange={(value) =>
                  handleFilterChange("from_department_id", value === "all" ? undefined : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-dept-select">To Department</Label>
              <Select
                value={filters.to_department_id?.toString() || "all"}
                onValueChange={(value) =>
                  handleFilterChange("to_department_id", value === "all" ? undefined : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-id">Item ID</Label>
              <Input
                id="item-id"
                type="number"
                placeholder="Enter item ID..."
                value={filters.item_id || ""}
                onChange={(e) => handleFilterChange("item_id", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
            {data && (
              <p className="text-sm text-muted-foreground">
                Showing {transfers.length} of {data.total} results
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Stock Transfers
          </CardTitle>
          <CardDescription>All stock transfer requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : transfers.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item & Transfer</TableHead>
                      <TableHead>Departments</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Initiated By</TableHead>
                      <TableHead>Date</TableHead>
                      {hasRole("admin") && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{transfer.stock_item_name}</div>
                              <div className="text-sm text-muted-foreground">ID: {transfer.stock_item_id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {transfer.from_department_name}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <ArrowRight className="h-3 w-3" />
                                <Building className="h-3 w-3" />
                                {transfer.to_department_name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transfer.quantity}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[transfer.status] || "default"}>
                            {statusLabels[transfer.status] || transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{transfer.initiated_by_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(transfer.created_at), "MMM dd, yyyy")}
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(transfer.created_at), "h:mm a")}
                            </div>
                          </div>
                        </TableCell>
                        {hasRole("admin") && (
                          <TableCell>
                            {transfer.status === "pending" && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => handleApproveTransfer(transfer.id)}>
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleRejectTransfer(transfer.id)}>
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {transfers.map((transfer) => (
                  <Card key={transfer.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant={statusColors[transfer.status] || "default"}>
                            {statusLabels[transfer.status] || transfer.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(transfer.created_at), "MMM dd, h:mm a")}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium">{transfer.stock_item_name}</div>
                          <div className="text-sm text-muted-foreground">Quantity: {transfer.quantity}</div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{transfer.from_department_name}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{transfer.to_department_name}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Initiated by: {transfer.initiated_by_name}</span>
                        </div>

                        {transfer.reason && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Reason: </span>
                            <span>{transfer.reason}</span>
                          </div>
                        )}

                        {hasRole("admin") && transfer.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveTransfer(transfer.id)}
                              className="flex-1"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectTransfer(transfer.id)}
                              className="flex-1"
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {data && data.total_pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {data.page} of {data.total_pages} ({data.total} total results)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.page - 1)}
                      disabled={data.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.page + 1)}
                      disabled={data.page >= data.total_pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Unified Transfer Dialog */}
      <TransferStockDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onSuccess={() => {
          refetch(filters)
          setTransferDialogOpen(false)
        }}
      />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <ArrowRight className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Transfers Found</h3>
      <p className="text-muted-foreground mb-4">No stock transfers match your current filter criteria.</p>
      <p className="text-sm text-muted-foreground">Try adjusting your filters or clearing them to see more results.</p>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function TransferManagementPage() {
  return <TransferManagementContent />
}
