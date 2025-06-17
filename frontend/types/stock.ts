import type React from "react"
export interface StockItem {
  id: number
  name: string
  quantity: number
  par_level: number
  age_in_days: number
  below_par: boolean
  department_id: number
  assigned_to?: string
  status: "available" | "assigned" | "faulty" | "deleted"
  created_at: string
  updated_at: string
}

export interface Department {
  id: number
  name: string
  tenant_id: number
}

export interface User {
  id: number
  username: string
  email: string
  roles: string[] // Changed to array of roles
  department_id?: number
  full_name?: string
}

export interface AssignStockRequest {
  stock_item_id: number
  assignee_user_id: number
  reason?: string
}

export interface MarkFaultyRequest {
  item_id: number
  reason: string
}

export interface MyEquipmentItem {
  id: number
  name: string
  department: string
  assigned_at: string
  is_faulty: boolean
  serial_number?: string
  category?: string
}

export interface UserOption {
  id: number
  username: string
  email: string
  full_name?: string
  roles: string[]
  department_name?: string
}

export interface AuditLog {
  id: number
  timestamp: string
  action: "assign" | "return" | "delete" | "mark_faulty" | "transfer" | "add_stock" | "update_par_level"
  reason?: string
  stock_item_id: number
  stock_item_name?: string
  user_id?: number
  user_name?: string
  department_id?: number
  department_name?: string
  performed_by_id: number
  performed_by_name: string
  details?: Record<string, any>
}

export interface AuditLogsResponse {
  logs: AuditLog[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface AuditLogsFilters {
  item_id?: number
  user_id?: number
  department_id?: number
  action?: string
  page?: number
  per_page?: number
}

export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  requiredRoles: string[]
}

export interface TransferStockRequest {
  stock_item_id: number
  from_department_id: number
  to_department_id: number
  quantity: number
  reason?: string
  notes?: string
}

export interface TransferStockResponse {
  success: boolean
  message: string
  transfer_id: number
}

export interface StockTransfer {
  id: number
  stock_item_id: number
  stock_item_name: string
  from_department_id: number
  from_department_name: string
  to_department_id: number
  to_department_name: string
  quantity: number
  reason?: string
  notes?: string
  status: "pending" | "approved" | "rejected" | "completed"
  initiated_by_id: number
  initiated_by_name: string
  approved_by_id?: number
  approved_by_name?: string
  created_at: string
  completed_at?: string
}

export interface TransferFilters {
  status?: string
  from_department_id?: number
  to_department_id?: number
  item_id?: number
  page?: number
  per_page?: number
}

export interface TransfersResponse {
  transfers: StockTransfer[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface StockIntakeRequest {
  item_name: string
  barcode?: string
  quantity: number
  supplier_vendor: string
  purchase_order_number?: string
  unit_cost: number
  total_cost: number
  received_date: string
  notes?: string
  invoice_file?: File
  category?: string
  department_id: number
}

export interface StockIntakeResponse {
  success: boolean
  message: string
  intake_id: number
  item_id: number
  is_new_item: boolean
}

export interface StockIntakeLog {
  id: number
  item_id: number
  item_name: string
  quantity: number
  supplier_vendor: string
  purchase_order_number?: string
  unit_cost: number
  total_cost: number
  received_date: string
  notes?: string
  invoice_url?: string
  received_by_id: number
  received_by_name: string
  department_id: number
  department_name: string
  created_at: string
}

export interface BarcodeItem {
  barcode: string
  name: string
  category?: string
  supplier?: string
  unit_cost?: number
}

export interface IntakeFilters {
  supplier?: string
  department_id?: number
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
}

export interface IntakeLogsResponse {
  logs: StockIntakeLog[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface StockCategory {
  id: number
  name: string
  description?: string
  default_par_level: number
  aging_threshold_days: number
  color?: string
  created_at: string
  updated_at: string
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  default_par_level: number
  aging_threshold_days: number
  color?: string
}

export interface UpdateCategoryRequest {
  id: number
  name: string
  description?: string
  default_par_level: number
  aging_threshold_days: number
  color?: string
}

export interface PendingUser {
  id: number
  username: string
  email: string
  full_name: string
  department_id: number
  department_name: string
  requested_roles: string[]
  status: "pending" | "approved" | "rejected"
  created_at: string
  reviewed_by_id?: number
  reviewed_by_name?: string
  reviewed_at?: string
  rejection_reason?: string
}

export interface ApprovalRequest {
  user_id: number
  action: "approve" | "reject"
  rejection_reason?: string
}

export interface UserRoleUpdate {
  user_id: number
  roles: string[]
  reason?: string
}

export interface UserStatusUpdate {
  user_id: number
  status: "active" | "inactive" | "suspended"
  reason?: string
}

export interface AccountApprovalsResponse {
  pending_users: PendingUser[]
  total: number
}
