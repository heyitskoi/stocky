"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, User, AlertCircle, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { stockApi } from "@/lib/api"
import { useUsers } from "@/hooks/useUsers"
import { useStock } from "@/hooks/useStock"

interface AssignItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  departmentId?: number // Optional department filter
}

export function AssignItemDialog({ open, onOpenChange, onSuccess, departmentId }: AssignItemDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userSelectOpen, setUserSelectOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [itemSelectOpen, setItemSelectOpen] = useState(false)

  const { users, loading: usersLoading, error: usersError } = useUsers()
  const { stock, loading: stockLoading, error: stockError } = useStock(departmentId)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedItemId(null)
      setSelectedUserId(null)
      setReason("")
      setError(null)
      setItemSelectOpen(false)
      setUserSelectOpen(false)
    }
  }, [open])

  const selectedUser = users.find((user) => user.id === selectedUserId)
  const selectedItem = stock.find((item) => item.id === selectedItemId)
  const availableStock = stock.filter((item) => item.status === "available" && item.quantity > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedItemId || !selectedUserId) {
      setError("Please select both a stock item and a user")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await stockApi.assignStock({
        stock_item_id: selectedItemId,
        assignee_user_id: selectedUserId,
        reason: reason.trim() || undefined,
      })

      // Show success message
      if (typeof window !== "undefined") {
        alert(
          `Success: ${selectedItem?.name} has been assigned to ${selectedUser?.full_name || selectedUser?.username}`,
        )
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign stock item"
      setError(errorMessage)

      if (typeof window !== "undefined") {
        alert(`Error: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = selectedItemId !== null && selectedUserId !== null && !loading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Stock Item</DialogTitle>
          <DialogDescription>
            Assign "{selectedItem?.name}" to a user. This action will be logged and tracked.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stock Item Selection */}
          <div className="space-y-2">
            <Label htmlFor="item-select">Select Stock Item *</Label>

            {stockError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load stock items: {stockError}</AlertDescription>
              </Alert>
            ) : stockLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <Popover open={itemSelectOpen} onOpenChange={setItemSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={itemSelectOpen}
                    className="w-full justify-between"
                    type="button"
                  >
                    {selectedItem ? (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>{selectedItem.name}</span>
                        <Badge variant={selectedItem.below_par ? "destructive" : "secondary"} className="text-xs">
                          Qty: {selectedItem.quantity}
                        </Badge>
                      </div>
                    ) : (
                      "Select stock item..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search stock items..." />
                    <CommandList>
                      <CommandEmpty>No stock items found.</CommandEmpty>
                      <CommandGroup>
                        {availableStock.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={`${item.name} ${item.id}`}
                            onSelect={() => {
                              setSelectedItemId(item.id)
                              setItemSelectOpen(false)
                              setError(null)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", selectedItemId === item.id ? "opacity-100" : "opacity-0")}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.name}</span>
                                <Badge variant={item.below_par ? "destructive" : "secondary"} className="text-xs">
                                  Qty: {item.quantity}
                                </Badge>
                                {item.below_par && (
                                  <Badge variant="outline" className="text-xs text-orange-600">
                                    Below Par
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Par Level: {item.par_level} • Age: {item.age_in_days} days
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user-select">Assign to User *</Label>

            {usersError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load users: {usersError}</AlertDescription>
              </Alert>
            ) : usersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userSelectOpen}
                    className="w-full justify-between"
                    type="button"
                  >
                    {selectedUser ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{selectedUser.full_name || selectedUser.username}</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedUser.role}
                        </Badge>
                      </div>
                    ) : (
                      "Select user..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {users.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.username} ${user.full_name} ${user.email}`}
                            onSelect={() => {
                              setSelectedUserId(user.id)
                              setUserSelectOpen(false)
                              setError(null) // Clear error when user selects
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", selectedUserId === user.id ? "opacity-100" : "opacity-0")}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{user.full_name || user.username}</span>
                                <Badge variant="outline" className="text-xs">
                                  {user.role}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                                {user.department_name && ` • ${user.department_name}`}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            {selectedUser && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedUser.full_name || selectedUser.username} ({selectedUser.email})
                {selectedUser.department_name && ` from ${selectedUser.department_name}`}
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Assignment (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Replacement for damaged equipment, new employee setup, temporary assignment..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">{reason.length}/500 characters</div>
          </div>

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
            <Button type="submit" disabled={!isFormValid} className="min-w-[100px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
