"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { UserCheck, UserX, Clock, Mail, Building, Shield, Search, Edit, UserPlus } from "lucide-react"
import type { PendingUser, User, ApprovalRequest, UserRoleUpdate, UserStatusUpdate } from "@/types/stock"

// Mock API functions
const fetchPendingUsers = async (): Promise<PendingUser[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return [
    {
      id: 1,
      username: "jane_smith",
      email: "jane.smith@company.com",
      full_name: "Jane Smith",
      department_id: 1,
      department_name: "IT Department",
      requested_roles: ["stock_manager"],
      status: "pending",
      created_at: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      username: "mike_admin",
      email: "mike.johnson@company.com",
      full_name: "Mike Johnson",
      department_id: 2,
      department_name: "Administration",
      requested_roles: ["admin"],
      status: "pending",
      created_at: "2024-01-14T14:20:00Z",
    },
    {
      id: 3,
      username: "sarah_manager",
      email: "sarah.wilson@company.com",
      full_name: "Sarah Wilson",
      department_id: 3,
      department_name: "Sales Department",
      requested_roles: ["stock_manager", "admin"],
      status: "pending",
      created_at: "2024-01-13T09:15:00Z",
    },
  ]
}

const fetchAllUsers = async (): Promise<User[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800))

  return [
    {
      id: 1,
      username: "admin",
      email: "admin@company.com",
      full_name: "System Administrator",
      roles: ["admin"],
      department_id: 1,
    },
    {
      id: 2,
      username: "manager",
      email: "manager@company.com",
      full_name: "Stock Manager",
      roles: ["stock_manager"],
      department_id: 1,
    },
    {
      id: 3,
      username: "staff",
      email: "staff@company.com",
      full_name: "Staff Member",
      roles: ["staff"],
      department_id: 2,
    },
    {
      id: 4,
      username: "john_manager",
      email: "john@company.com",
      full_name: "John Doe",
      roles: ["stock_manager", "staff"],
      department_id: 1,
    },
  ]
}

const approveUser = async (request: ApprovalRequest): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  if (Math.random() > 0.9) {
    throw new Error("Failed to process approval")
  }
}

const updateUserRoles = async (update: UserRoleUpdate): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  if (Math.random() > 0.9) {
    throw new Error("Failed to update user roles")
  }
}

const updateUserStatus = async (update: UserStatusUpdate): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  if (Math.random() > 0.9) {
    throw new Error("Failed to update user status")
  }
}

export default function AccountApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [userManagementDialog, setUserManagementDialog] = useState(false)
  const [selectedExistingUser, setSelectedExistingUser] = useState<User | null>(null)
  const [editingRoles, setEditingRoles] = useState<string[]>([])
  const [editingStatus, setEditingStatus] = useState<string>("")
  const [statusReason, setStatusReason] = useState("")

  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pending, users] = await Promise.all([fetchPendingUsers(), fetchAllUsers()])
      setPendingUsers(pending)
      setAllUsers(users)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (userId: number, action: "approve" | "reject") => {
    try {
      await approveUser({
        user_id: userId,
        action,
        rejection_reason: action === "reject" ? rejectionReason : undefined,
      })

      setPendingUsers((prev) => prev.filter((u) => u.id !== userId))

      toast({
        title: "Success",
        description: `User ${action === "approve" ? "approved" : "rejected"} successfully`,
      })

      setApprovalDialog(false)
      setSelectedUser(null)
      setRejectionReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      })
    }
  }

  const handleUserRoleUpdate = async () => {
    if (!selectedExistingUser) return

    try {
      await updateUserRoles({
        user_id: selectedExistingUser.id,
        roles: editingRoles,
        reason: statusReason,
      })

      setAllUsers((prev) => prev.map((u) => (u.id === selectedExistingUser.id ? { ...u, roles: editingRoles } : u)))

      toast({
        title: "Success",
        description: "User roles updated successfully",
      })

      setUserManagementDialog(false)
      setSelectedExistingUser(null)
      setEditingRoles([])
      setStatusReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user roles",
        variant: "destructive",
      })
    }
  }

  const handleUserStatusUpdate = async (status: string) => {
    if (!selectedExistingUser) return

    try {
      await updateUserStatus({
        user_id: selectedExistingUser.id,
        status: status as "active" | "inactive" | "suspended",
        reason: statusReason,
      })

      toast({
        title: "Success",
        description: `User ${status} successfully`,
      })

      setUserManagementDialog(false)
      setSelectedExistingUser(null)
      setStatusReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const openApprovalDialog = (user: PendingUser) => {
    setSelectedUser(user)
    setApprovalDialog(true)
  }

  const openUserManagement = (user: User) => {
    setSelectedExistingUser(user)
    setEditingRoles([...user.roles])
    setEditingStatus("active")
    setUserManagementDialog(true)
  }

  const filteredPendingUsers = pendingUsers.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredAllUsers = allUsers.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "stock_manager":
        return "bg-blue-100 text-blue-800"
      case "staff":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading account approvals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Approvals</h1>
          <p className="text-muted-foreground">Review and manage user account requests and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals
            {filteredPendingUsers.length > 0 && <Badge variant="secondary">{filteredPendingUsers.length}</Badge>}
          </CardTitle>
          <CardDescription>Users waiting for account approval with elevated permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPendingUsers.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No pending approvals</h3>
              <p className="text-muted-foreground">All account requests have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPendingUsers.map((pendingUser) => (
                <div key={pendingUser.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{pendingUser.full_name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {pendingUser.username}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {pendingUser.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {pendingUser.department_name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Requested roles:</span>
                        <div className="flex gap-1">
                          {pendingUser.requested_roles.map((role) => (
                            <Badge key={role} className={getRoleBadgeColor(role)}>
                              {role.replace("_", " ").toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requested {new Date(pendingUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openApprovalDialog(pendingUser)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            User Management
            <Badge variant="secondary">{filteredAllUsers.length}</Badge>
          </CardTitle>
          <CardDescription>Manage existing user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAllUsers.map((existingUser) => (
              <div key={existingUser.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{existingUser.full_name || existingUser.username}</h3>
                      <Badge variant="outline" className="text-xs">
                        {existingUser.username}
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {existingUser.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Current roles:</span>
                      <div className="flex gap-1">
                        {existingUser.roles.map((role) => (
                          <Badge key={role} className={getRoleBadgeColor(role)}>
                            {role.replace("_", " ").toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openUserManagement(existingUser)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Account Request</DialogTitle>
            <DialogDescription>Review and approve or reject this account request</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User Details</Label>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <p>
                    <strong>Name:</strong> {selectedUser.full_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Username:</strong> {selectedUser.username}
                  </p>
                  <p>
                    <strong>Department:</strong> {selectedUser.department_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <strong>Requested Roles:</strong>
                    {selectedUser.requested_roles.map((role) => (
                      <Badge key={role} className={getRoleBadgeColor(role)}>
                        {role.replace("_", " ").toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => selectedUser && handleApproval(selectedUser.id, "reject")}
              className="text-red-600 hover:text-red-700"
            >
              <UserX className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => selectedUser && handleApproval(selectedUser.id, "approve")}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Management Dialog */}
      <Dialog open={userManagementDialog} onOpenChange={setUserManagementDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>Update user roles and status</DialogDescription>
          </DialogHeader>
          {selectedExistingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User: {selectedExistingUser.full_name || selectedExistingUser.username}</Label>
              </div>

              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="space-y-2">
                  {["admin", "stock_manager", "staff"].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={editingRoles.includes(role)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditingRoles([...editingRoles, role])
                          } else {
                            setEditingRoles(editingRoles.filter((r) => r !== role))
                          }
                        }}
                      />
                      <Label htmlFor={role} className="text-sm">
                        {role.replace("_", " ").toUpperCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-reason">Reason for Changes</Label>
                <Textarea
                  id="status-reason"
                  placeholder="Explain the reason for these changes..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleUserStatusUpdate("suspended")}
              className="text-orange-600 hover:text-orange-700"
            >
              Suspend
            </Button>
            <Button
              variant="outline"
              onClick={() => handleUserStatusUpdate("inactive")}
              className="text-red-600 hover:text-red-700"
            >
              Deactivate
            </Button>
            <Button onClick={handleUserRoleUpdate}>Update Roles</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
