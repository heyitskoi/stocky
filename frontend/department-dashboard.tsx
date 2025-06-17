"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { AssignItemDialog } from "@/components/assign-item-dialog"

interface DepartmentDashboardProps {
  departmentId: string
}

export function DepartmentDashboard({ departmentId }: DepartmentDashboardProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  const refetch = () => {
    // In a real application, this would trigger a data refetch
    console.log("Refetching data...")
  }

  const handleAssignItem = () => {
    setAssignDialogOpen(true)
  }

  return (
    <div>
      <h1>Department Dashboard</h1>
      <p>Department ID: {departmentId}</p>

      <Button onClick={handleAssignItem}>Assign Item</Button>

      <AssignItemDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onSuccess={refetch}
        departmentId={departmentId}
      />
    </div>
  )
}
