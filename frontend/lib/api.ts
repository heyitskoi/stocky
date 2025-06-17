import type {
  StockItem,
  AssignStockRequest,
  MarkFaultyRequest,
  Department,
  MyEquipmentItem,
  UserOption,
  AuditLog,
  AuditLogsResponse,
  AuditLogsFilters,
  StockTransfer,
  TransferFilters,
  TransfersResponse,
  TransferStockRequest,
  TransferStockResponse,
  StockIntakeRequest,
  StockIntakeResponse,
  BarcodeItem,
  IntakeFilters,
  IntakeLogsResponse,
  StockIntakeLog,
  StockCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  AccountApprovalsResponse,
  PendingUser,
  ApprovalRequest,
  UserRoleUpdate,
  UserStatusUpdate,
} from "@/types/stock"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Mock data for preview/development
const mockStockData: StockItem[] = [
  {
    id: 1,
    name: "Dell Laptop XPS 13",
    quantity: 5,
    par_level: 10,
    age_in_days: 45,
    below_par: true,
    department_id: 1,
    status: "available",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    quantity: 12,
    par_level: 8,
    age_in_days: 30,
    below_par: false,
    department_id: 1,
    status: "available",
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
  },
  {
    id: 3,
    name: "Wireless Mouse",
    quantity: 2,
    par_level: 15,
    age_in_days: 120,
    below_par: true,
    department_id: 1,
    status: "available",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
  },
  {
    id: 4,
    name: "Monitor 27 inch",
    quantity: 8,
    par_level: 5,
    age_in_days: 60,
    below_par: false,
    department_id: 1,
    status: "available",
    created_at: "2024-01-12T10:00:00Z",
    updated_at: "2024-01-12T10:00:00Z",
  },
]

// Mock equipment data for preview/development
const mockEquipmentData: MyEquipmentItem[] = [
  {
    id: 1,
    name: "MacBook Pro 16-inch",
    department: "IT Department",
    assigned_at: "2024-01-15T09:30:00Z",
    is_faulty: false,
    serial_number: "MBP2024001",
    category: "Laptop",
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    department: "IT Department",
    assigned_at: "2024-01-20T14:15:00Z",
    is_faulty: false,
    serial_number: "IP15001",
    category: "Mobile Device",
  },
  {
    id: 3,
    name: "Wireless Headset",
    department: "IT Department",
    assigned_at: "2024-01-10T11:45:00Z",
    is_faulty: true,
    serial_number: "WH2024003",
    category: "Audio Equipment",
  },
]

// Mock users data for preview/development
const mockUsersData: UserOption[] = [
  {
    id: 1,
    username: "john_doe",
    email: "john.doe@company.com",
    full_name: "John Doe",
    role: "tech_support",
    department_name: "IT Department",
  },
  {
    id: 2,
    username: "jane_smith",
    email: "jane.smith@company.com",
    full_name: "Jane Smith",
    role: "sales",
    department_name: "Sales Department",
  },
  {
    id: 3,
    username: "mike_wilson",
    email: "mike.wilson@company.com",
    full_name: "Mike Wilson",
    role: "tech_support",
    department_name: "IT Department",
  },
  {
    id: 4,
    username: "sarah_johnson",
    email: "sarah.johnson@company.com",
    full_name: "Sarah Johnson",
    role: "admin",
    department_name: "Administration",
  },
  {
    id: 5,
    username: "david_brown",
    email: "david.brown@company.com",
    full_name: "David Brown",
    role: "warehouse",
    department_name: "Warehouse",
  },
]

// Mock audit logs data for preview/development
const mockAuditLogsData: AuditLog[] = [
  {
    id: 1,
    timestamp: "2024-01-25T14:30:00Z",
    action: "assign",
    reason: "New employee setup",
    stock_item_id: 1,
    stock_item_name: "Dell Laptop XPS 13",
    user_id: 1,
    user_name: "John Doe",
    department_id: 2,
    department_name: "IT Department",
    performed_by_id: 5,
    performed_by_name: "David Brown",
    details: { quantity_assigned: 1 },
  },
  {
    id: 2,
    timestamp: "2024-01-25T13:15:00Z",
    action: "mark_faulty",
    reason: "Screen flickering issue",
    stock_item_id: 3,
    stock_item_name: "Wireless Headset",
    user_id: 3,
    user_name: "Mike Wilson",
    department_id: 2,
    department_name: "IT Department",
    performed_by_id: 4,
    performed_by_name: "Sarah Johnson",
  },
  {
    id: 3,
    timestamp: "2024-01-25T11:45:00Z",
    action: "return",
    reason: "Employee departure",
    stock_item_id: 2,
    stock_item_name: "iPhone 15 Pro",
    user_id: 2,
    user_name: "Jane Smith",
    department_id: 1,
    department_name: "Sales Department",
    performed_by_id: 5,
    performed_by_name: "David Brown",
    details: { quantity_returned: 1 },
  },
  {
    id: 4,
    timestamp: "2024-01-25T10:20:00Z",
    action: "add_stock",
    reason: "Monthly restock",
    stock_item_id: 4,
    stock_item_name: "Monitor 27 inch",
    department_id: 1,
    department_name: "Warehouse",
    performed_by_id: 5,
    performed_by_name: "David Brown",
    details: { quantity_added: 5 },
  },
  {
    id: 5,
    timestamp: "2024-01-25T09:30:00Z",
    action: "transfer",
    reason: "Department reorganization",
    stock_item_id: 1,
    stock_item_name: "Dell Laptop XPS 13",
    department_id: 2,
    department_name: "IT Department",
    performed_by_id: 4,
    performed_by_name: "Sarah Johnson",
    details: { from_department: "Warehouse", to_department: "IT Department", quantity: 2 },
  },
  {
    id: 6,
    timestamp: "2024-01-24T16:45:00Z",
    action: "update_par_level",
    reason: "Increased demand forecast",
    stock_item_id: 3,
    stock_item_name: "Wireless Mouse",
    department_id: 1,
    department_name: "Warehouse",
    performed_by_id: 4,
    performed_by_name: "Sarah Johnson",
    details: { old_par_level: 10, new_par_level: 15 },
  },
  {
    id: 7,
    timestamp: "2024-01-24T15:20:00Z",
    action: "delete",
    reason: "Obsolete equipment",
    stock_item_id: 99,
    stock_item_name: "Old CRT Monitor",
    department_id: 1,
    department_name: "Warehouse",
    performed_by_id: 5,
    performed_by_name: "David Brown",
  },
]

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // For preview/development, return mock data
  if (endpoint.includes("/stock")) {
    return mockStockData as T
  }

  // In production, use real API
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`)
  }

  return response.json()
}

export const stockApi = {
  getStock: async (departmentId?: number): Promise<StockItem[]> => {
    // Return mock data for preview
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate loading
    return mockStockData.filter((item) => !departmentId || item.department_id === departmentId)
  },

  assignStock: async (data: AssignStockRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    // Simulate potential errors for testing
    if (Math.random() < 0.1) {
      // 10% chance of error for testing
      throw new ApiError(400, "User is not eligible for this equipment type")
    }

    return {
      success: true,
      message: "Stock item assigned successfully",
      assignment_id: Math.floor(Math.random() * 1000),
    }
  },

  markFaulty: async (data: MarkFaultyRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true }
  },

  deleteStock: async (itemId: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true }
  },

  getDepartments: async (): Promise<Department[]> => {
    return [
      { id: 1, name: "Warehouse", tenant_id: 1 },
      { id: 2, name: "IT Department", tenant_id: 1 },
      { id: 3, name: "Sales Department", tenant_id: 1 },
      { id: 4, name: "Administration", tenant_id: 1 },
    ]
  },

  getMyEquipment: async (): Promise<MyEquipmentItem[]> => {
    // Return mock data for preview
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate loading
    return mockEquipmentData
  },

  getUsers: async (): Promise<UserOption[]> => {
    // Return mock data for preview
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate loading
    return mockUsersData
  },

  getAuditLogs: async (filters: AuditLogsFilters = {}): Promise<AuditLogsResponse> => {
    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1200))

    let filteredLogs = [...mockAuditLogsData]

    // Apply filters
    if (filters.item_id) {
      filteredLogs = filteredLogs.filter((log) => log.stock_item_id === filters.item_id)
    }
    if (filters.user_id) {
      filteredLogs = filteredLogs.filter((log) => log.user_id === filters.user_id)
    }
    if (filters.department_id) {
      filteredLogs = filteredLogs.filter((log) => log.department_id === filters.department_id)
    }
    if (filters.action) {
      filteredLogs = filteredLogs.filter((log) => log.action === filters.action)
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Pagination
    const page = filters.page || 1
    const perPage = filters.per_page || 50
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    return {
      logs: paginatedLogs,
      total: filteredLogs.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(filteredLogs.length / perPage),
    }
  },

  returnItem: async (data: { item_id: number; reason: string; condition: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    // Simulate potential errors for testing
    if (Math.random() < 0.1) {
      // 10% chance of error for testing
      throw new ApiError(400, "Item cannot be returned at this time")
    }

    return {
      success: true,
      message: "Item returned successfully",
      return_id: Math.floor(Math.random() * 1000),
    }
  },

  transferStock: async (data: TransferStockRequest): Promise<TransferStockResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    // Simulate potential errors for testing
    if (Math.random() < 0.1) {
      // 10% chance of error for testing
      throw new ApiError(400, "Transfer not allowed between these departments")
    }

    // Simulate checking if destination department already has this item
    const destinationHasItem = Math.random() > 0.5 // 50% chance for demo
    const transferType = destinationHasItem ? "merge" : "new_record"

    return {
      success: true,
      message: destinationHasItem
        ? `Transfer request initiated successfully. Item quantities will be merged at destination.`
        : `Transfer request initiated successfully. New item record will be created at destination.`,
      transfer_id: Math.floor(Math.random() * 1000),
      transfer_type: transferType,
      audit_note: `Stock transfer: ${data.quantity} units from dept ${data.from_department_id} to dept ${data.to_department_id}. ${destinationHasItem ? "Quantities merged." : "New record created."}`,
    }
  },

  getTransfers: async (filters: TransferFilters = {}): Promise<TransfersResponse> => {
    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock transfer data
    const mockTransfers: StockTransfer[] = [
      {
        id: 1,
        stock_item_id: 1,
        stock_item_name: "Dell Laptop XPS 13",
        from_department_id: 1,
        from_department_name: "Warehouse",
        to_department_id: 2,
        to_department_name: "IT Department",
        quantity: 2,
        reason: "Department reorganization",
        notes: "Urgent transfer for new project",
        status: "pending",
        initiated_by_id: 1,
        initiated_by_name: "John Manager",
        created_at: "2024-01-25T14:30:00Z",
      },
      {
        id: 2,
        stock_item_id: 2,
        stock_item_name: "iPhone 15 Pro",
        from_department_id: 2,
        from_department_name: "IT Department",
        to_department_id: 3,
        to_department_name: "Sales Department",
        quantity: 1,
        reason: "Sales team requirement",
        status: "completed",
        initiated_by_id: 2,
        initiated_by_name: "Jane Smith",
        approved_by_id: 4,
        approved_by_name: "Sarah Johnson",
        created_at: "2024-01-24T10:15:00Z",
        completed_at: "2024-01-24T15:30:00Z",
      },
      {
        id: 3,
        stock_item_id: 3,
        stock_item_name: "Wireless Mouse",
        from_department_id: 1,
        from_department_name: "Warehouse",
        to_department_id: 4,
        to_department_name: "Administration",
        quantity: 5,
        reason: "Office setup",
        status: "approved",
        initiated_by_id: 5,
        initiated_by_name: "David Brown",
        approved_by_id: 4,
        approved_by_name: "Sarah Johnson",
        created_at: "2024-01-23T09:45:00Z",
      },
    ]

    let filteredTransfers = [...mockTransfers]

    // Apply filters
    if (filters.status) {
      filteredTransfers = filteredTransfers.filter((transfer) => transfer.status === filters.status)
    }
    if (filters.from_department_id) {
      filteredTransfers = filteredTransfers.filter(
        (transfer) => transfer.from_department_id === filters.from_department_id,
      )
    }
    if (filters.to_department_id) {
      filteredTransfers = filteredTransfers.filter((transfer) => transfer.to_department_id === filters.to_department_id)
    }
    if (filters.item_id) {
      filteredTransfers = filteredTransfers.filter((transfer) => transfer.stock_item_id === filters.item_id)
    }

    // Sort by created_at (newest first)
    filteredTransfers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Pagination
    const page = filters.page || 1
    const perPage = filters.per_page || 50
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedTransfers = filteredTransfers.slice(startIndex, endIndex)

    return {
      transfers: paginatedTransfers,
      total: filteredTransfers.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(filteredTransfers.length / perPage),
    }
  },

  approveTransfer: async (transferId: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true, message: "Transfer approved successfully" }
  },

  rejectTransfer: async (transferId: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true, message: "Transfer rejected successfully" }
  },

  intakeStock: async (data: StockIntakeRequest): Promise<StockIntakeResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call

    // Simulate potential errors for testing
    if (Math.random() < 0.1) {
      // 10% chance of error for testing
      throw new ApiError(400, "Supplier validation failed")
    }

    // Simulate checking if item exists
    const existingItem = mockStockData.find((item) => item.name.toLowerCase() === data.item_name.toLowerCase())

    return {
      success: true,
      message: existingItem ? "Stock quantity updated successfully" : "New item created and added to inventory",
      intake_id: Math.floor(Math.random() * 1000),
      item_id: existingItem?.id || Math.floor(Math.random() * 1000) + 100,
      is_new_item: !existingItem,
    }
  },

  lookupBarcode: async (barcode: string): Promise<BarcodeItem | null> => {
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API call

    // Mock barcode database
    const barcodeDatabase: Record<string, BarcodeItem> = {
      "1234567890123": {
        barcode: "1234567890123",
        name: "Dell Laptop XPS 13",
        category: "electronics",
        supplier: "Dell",
        unit_cost: 1299.99,
      },
      "9876543210987": {
        barcode: "9876543210987",
        name: "iPhone 15 Pro",
        category: "electronics",
        supplier: "Apple",
        unit_cost: 999.99,
      },
      "5555666677778": {
        barcode: "5555666677778",
        name: "Wireless Mouse",
        category: "electronics",
        supplier: "Logitech",
        unit_cost: 29.99,
      },
    }

    return barcodeDatabase[barcode] || null
  },

  getIntakeLogs: async (filters: IntakeFilters = {}): Promise<IntakeLogsResponse> => {
    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock intake logs data
    const mockIntakeLogs: StockIntakeLog[] = [
      {
        id: 1,
        item_id: 1,
        item_name: "Dell Laptop XPS 13",
        quantity: 5,
        supplier_vendor: "Dell",
        purchase_order_number: "PO-2024-001",
        unit_cost: 1299.99,
        total_cost: 6499.95,
        received_date: "2024-01-25",
        notes: "All units in good condition",
        received_by_id: 1,
        received_by_name: "John Manager",
        department_id: 2,
        department_name: "IT Department",
        created_at: "2024-01-25T14:30:00Z",
      },
      {
        id: 2,
        item_id: 2,
        item_name: "iPhone 15 Pro",
        quantity: 10,
        supplier_vendor: "Apple",
        purchase_order_number: "PO-2024-002",
        unit_cost: 999.99,
        total_cost: 9999.9,
        received_date: "2024-01-24",
        notes: "Partial delivery - 2 units pending",
        invoice_url: "/uploads/invoice-apple-001.pdf",
        received_by_id: 2,
        received_by_name: "Jane Smith",
        department_id: 2,
        department_name: "IT Department",
        created_at: "2024-01-24T10:15:00Z",
      },
      {
        id: 3,
        item_id: 3,
        item_name: "Wireless Mouse",
        quantity: 20,
        supplier_vendor: "Logitech",
        unit_cost: 29.99,
        total_cost: 599.8,
        received_date: "2024-01-23",
        notes: "Bulk order for office setup",
        received_by_id: 3,
        received_by_name: "Mike Wilson",
        department_id: 1,
        department_name: "Warehouse",
        created_at: "2024-01-23T09:45:00Z",
      },
      {
        id: 4,
        item_id: 4,
        item_name: "Monitor 27 inch",
        quantity: 8,
        supplier_vendor: "Samsung",
        purchase_order_number: "PO-2024-003",
        unit_cost: 299.99,
        total_cost: 2399.92,
        received_date: "2024-01-22",
        notes: "One unit had minor packaging damage",
        received_by_id: 1,
        received_by_name: "John Manager",
        department_id: 2,
        department_name: "IT Department",
        created_at: "2024-01-22T16:20:00Z",
      },
    ]

    let filteredLogs = [...mockIntakeLogs]

    // Apply filters
    if (filters.supplier) {
      filteredLogs = filteredLogs.filter((log) =>
        log.supplier_vendor.toLowerCase().includes(filters.supplier!.toLowerCase()),
      )
    }
    if (filters.department_id) {
      filteredLogs = filteredLogs.filter((log) => log.department_id === filters.department_id)
    }
    if (filters.date_from) {
      filteredLogs = filteredLogs.filter((log) => log.received_date >= filters.date_from!)
    }
    if (filters.date_to) {
      filteredLogs = filteredLogs.filter((log) => log.received_date <= filters.date_to!)
    }

    // Sort by created_at (newest first)
    filteredLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Pagination
    const page = filters.page || 1
    const perPage = filters.per_page || 50
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    return {
      logs: paginatedLogs,
      total: filteredLogs.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(filteredLogs.length / perPage),
    }
  },
  getCategories: async (): Promise<StockCategory[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    return [
      {
        id: 1,
        name: "Electronics",
        description: "Computers, phones, and electronic devices",
        default_par_level: 5,
        aging_threshold_days: 365,
        color: "#3b82f6",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: 2,
        name: "Office Supplies",
        description: "Pens, paper, and general office materials",
        default_par_level: 20,
        aging_threshold_days: 180,
        color: "#10b981",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: 3,
        name: "Furniture",
        description: "Desks, chairs, and office furniture",
        default_par_level: 2,
        aging_threshold_days: 730,
        color: "#f59e0b",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ]
  },

  createCategory: async (data: CreateCategoryRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (Math.random() < 0.1) {
      throw new ApiError(400, "Category name already exists")
    }

    return {
      success: true,
      message: "Category created successfully",
      category_id: Math.floor(Math.random() * 1000),
    }
  },

  updateCategory: async (data: UpdateCategoryRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (Math.random() < 0.1) {
      throw new ApiError(400, "Category name already exists")
    }

    return {
      success: true,
      message: "Category updated successfully",
    }
  },

  deleteCategory: async (categoryId: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (Math.random() < 0.1) {
      throw new ApiError(400, "Cannot delete category with existing items")
    }

    return {
      success: true,
      message: "Category deleted successfully",
    }
  },
  getPendingUsers: async (): Promise<AccountApprovalsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockPendingUsers: PendingUser[] = [
      {
        id: 101,
        username: "new_manager",
        email: "new.manager@company.com",
        full_name: "Alice Johnson",
        department_id: 2,
        department_name: "IT Department",
        requested_roles: ["stock_manager"],
        status: "pending",
        created_at: "2024-01-25T10:30:00Z",
      },
      {
        id: 102,
        username: "admin_candidate",
        email: "admin.candidate@company.com",
        full_name: "Bob Wilson",
        department_id: 4,
        department_name: "Administration",
        requested_roles: ["admin"],
        status: "pending",
        created_at: "2024-01-24T14:15:00Z",
      },
      {
        id: 103,
        username: "warehouse_lead",
        email: "warehouse.lead@company.com",
        full_name: "Carol Davis",
        department_id: 1,
        department_name: "Warehouse",
        requested_roles: ["stock_manager", "staff"],
        status: "pending",
        created_at: "2024-01-23T09:45:00Z",
      },
    ]

    return {
      pending_users: mockPendingUsers,
      total: mockPendingUsers.length,
    }
  },

  approveUser: async (data: ApprovalRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (Math.random() < 0.1) {
      throw new ApiError(400, "Failed to process approval request")
    }

    return {
      success: true,
      message: data.action === "approve" ? "User approved successfully" : "User rejected successfully",
    }
  },

  updateUserRoles: async (data: UserRoleUpdate) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (Math.random() < 0.1) {
      throw new ApiError(400, "Failed to update user roles")
    }

    return {
      success: true,
      message: "User roles updated successfully",
    }
  },

  updateUserStatus: async (data: UserStatusUpdate) => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (Math.random() < 0.1) {
      throw new ApiError(400, "Failed to update user status")
    }

    return {
      success: true,
      message: "User status updated successfully",
    }
  },
}
