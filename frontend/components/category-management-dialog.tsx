"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Package, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { StockCategory } from "@/types/stock"

interface CategoryFormData {
  name: string
  description: string
  default_par_level: number
  aging_threshold_days: number
  color: string
}

const defaultFormData: CategoryFormData = {
  name: "",
  description: "",
  default_par_level: 10,
  aging_threshold_days: 365,
  color: "#3b82f6",
}

const colorOptions = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Yellow" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#84cc16", label: "Lime" },
  { value: "#f97316", label: "Orange" },
]

interface CategoryFormProps {
  category?: StockCategory
  onSubmit: (data: CategoryFormData) => Promise<void>
  onCancel: () => void
  loading: boolean
}

function CategoryForm({ category, onSubmit, onCancel, loading }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>(
    category
      ? {
          name: category.name,
          description: category.description || "",
          default_par_level: category.default_par_level,
          aging_threshold_days: category.aging_threshold_days,
          color: category.color || "#3b82f6",
        }
      : defaultFormData,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleChange = (field: keyof CategoryFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category-name">Category Name *</Label>
        <Input
          id="category-name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="e.g., Electronics, Office Supplies"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-description">Description</Label>
        <Textarea
          id="category-description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Brief description of this category"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="default-par-level">Default Par Level *</Label>
          <Input
            id="default-par-level"
            type="number"
            min="1"
            value={formData.default_par_level}
            onChange={(e) => handleChange("default_par_level", Number.parseInt(e.target.value) || 1)}
            required
          />
          <p className="text-xs text-muted-foreground">Minimum stock level for items in this category</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="aging-threshold">Aging Threshold (days) *</Label>
          <Input
            id="aging-threshold"
            type="number"
            min="1"
            value={formData.aging_threshold_days}
            onChange={(e) => handleChange("aging_threshold_days", Number.parseInt(e.target.value) || 1)}
            required
          />
          <p className="text-xs text-muted-foreground">Days before items are considered aging</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category Color</Label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => handleChange("color", color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                formData.color === color.value ? "border-gray-900 scale-110" : "border-gray-300"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : category ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  )
}

interface CategoryManagementDialogProps {
  trigger?: React.ReactNode
}

export function CategoryManagementDialog({ trigger }: CategoryManagementDialogProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<StockCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [editingCategory, setEditingCategory] = useState<StockCategory | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  // Mock categories data
  const mockCategories: StockCategory[] = [
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

  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open])

  const loadCategories = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setCategories(mockCategories)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (data: CategoryFormData) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newCategory: StockCategory = {
        id: Math.max(...categories.map((c) => c.id)) + 1,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setCategories((prev) => [...prev, newCategory])
      setShowForm(false)

      toast({
        title: "Success",
        description: "Category created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, ...data, updated_at: new Date().toISOString() } : cat,
        ),
      )

      setEditingCategory(null)
      setShowForm(false)

      toast({
        title: "Success",
        description: "Category updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))

      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = (category: StockCategory) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Package className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Stock Categories</DialogTitle>
          <DialogDescription>
            Create, edit, and delete stock categories. Categories help organize your inventory and set default
            parameters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {showForm ? (
            <Card>
              <CardHeader>
                <CardTitle>{editingCategory ? "Edit Category" : "Create New Category"}</CardTitle>
                <CardDescription>
                  {editingCategory ? "Update the category details below" : "Fill in the details for the new category"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryForm
                  category={editingCategory || undefined}
                  onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  onCancel={handleCancelForm}
                  loading={loading}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Existing Categories</h3>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>

              <div className="space-y-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            {category.description && (
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex gap-2">
                            <Badge variant="secondary">Par Level: {category.default_par_level}</Badge>
                            <Badge variant="outline">Aging: {category.aging_threshold_days} days</Badge>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                              disabled={loading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {categories.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No categories found. Create your first category to get started.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
