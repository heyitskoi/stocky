"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Package,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Building,
  DollarSign,
  FileText,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/hooks/useAuth"
import type { StockIntakeLog, IntakeFilters } from "@/types/stock"
import { stockApi } from "@/lib/api"

function useIntakeLogs(filters: IntakeFilters = {}) {
  const [data, setData] = useState<{
    logs: StockIntakeLog[]
    total: number
    page: number
    total_pages: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async (newFilters: IntakeFilters = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await stockApi.getIntakeLogs({ ...filters, ...newFilters })
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch intake logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  return {
    data,
    logs: data?.logs || [],
    loading,
    error,
    refetch: fetchLogs,
  }
}

function StockIntakeHistoryContent() {
  const { user, hasRole } = useAuth()
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([])

  // Filter state
  const [filters, setFilters] = useState<IntakeFilters>({
    page: 1,
    per_page: 50,
  })

  const { data, logs, loading, error, refetch } = useIntakeLogs(filters)

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

  const handleFilterChange = (key: keyof IntakeFilters, value: string | number | undefined) => {
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

  const totalValue = logs.reduce((sum, log) => sum + log.total_cost, 0)

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <Package className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">Error loading intake history</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Stock Intake History</h1>
          <p className="text-muted-foreground">Track all stock receipts and deliveries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => refetch(filters)} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Intake transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total cost of received items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(logs.map((log) => log.item_id)).size}</div>
            <p className="text-xs text-muted-foreground">Different items received</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter intake history by supplier, department, or date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-filter">Supplier</Label>
              <Input
                id="supplier-filter"
                placeholder="Enter supplier name..."
                value={filters.supplier || ""}
                onChange={(e) => handleFilterChange("supplier", e.target.value || undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department-select">Department</Label>
              <Select
                value={filters.department_id?.toString() || "all"}
                onValueChange={(value) =>
                  handleFilterChange("department_id", value === "all" ? undefined : Number(value))
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
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.date_from || ""}
                onChange={(e) => handleFilterChange("date_from", e.target.value || undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.date_to || ""}
                onChange={(e) => handleFilterChange("date_to", e.target.value || undefined)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
            {data && (
              <p className="text-sm text-muted-foreground">
                Showing {logs.length} of {data.total} results
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Intake Records
          </CardTitle>
          <CardDescription>Complete history of all stock receipts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : logs.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Received By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>PO Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{log.item_name}</div>
                              <div className="text-sm text-muted-foreground">ID: {log.item_id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.quantity}</Badge>
                        </TableCell>
                        <TableCell>{log.supplier_vendor}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">${log.total_cost.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">${log.unit_cost.toFixed(2)} each</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{log.department_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{log.received_by_name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(log.received_date), "MMM dd, yyyy")}
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(log.created_at), "h:mm a")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.purchase_order_number ? (
                            <Badge variant="outline">{log.purchase_order_number}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {logs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{log.item_name}</div>
                          <Badge variant="outline">{log.quantity} units</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Supplier:</span>
                            <div>{log.supplier_vendor}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Cost:</span>
                            <div className="font-medium">${log.total_cost.toFixed(2)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{log.department_name}</span>
                        </div>

                        <div className="text-sm">
                          <span className="text-muted-foreground">Received by: </span>
                          <span>{log.received_by_name}</span>
                          <span className="text-muted-foreground"> on </span>
                          <span>{format(new Date(log.received_date), "MMM dd, yyyy")}</span>
                        </div>

                        {log.purchase_order_number && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">PO: </span>
                            <Badge variant="outline" className="text-xs">
                              {log.purchase_order_number}
                            </Badge>
                          </div>
                        )}

                        {log.notes && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Notes: </span>
                            <span>{log.notes}</span>
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
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Intake Records Found</h3>
      <p className="text-muted-foreground mb-4">No stock intake records match your current filter criteria.</p>
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
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

export default function StockIntakeHistoryPage() {
  return (
    <ProtectedRoute requiredRoles={["stock_manager", "admin"]}>
      <MainLayout title="Stock Intake History" subtitle="Track all stock receipts and deliveries">
        <StockIntakeHistoryContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
