"use client"

import { useState, useEffect } from "react"
import { stockApi } from "@/lib/api"
import type { User } from "@/types/stock"

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  password: string
  full_name: string
  department_id: number
  roles: string[]
}

interface AuthResponse {
  success: boolean
  message: string
  user?: User
  token?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("access_token")
        localStorage.removeItem("user_data")
      }
    }

    setLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true)

    try {
      const response = await stockApi.login(credentials)
      localStorage.setItem("access_token", response.token)
      localStorage.setItem("user_data", JSON.stringify(response.user))
      setUser(response.user)

      return {
        success: true,
        message: "Login successful",
        user: response.user,
        token: response.token,
      }
    } catch (error) {
      return {
        success: false,
        message: "Login failed. Please try again.",
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if requesting elevated roles (admin or stock_manager)
      const elevatedRoles = ["admin", "stock_manager"]
      const hasElevatedRoles = data.roles.some((role) => elevatedRoles.includes(role))

      if (hasElevatedRoles) {
        // Create pending account for approval
        return {
          success: true,
          message:
            "Registration submitted for approval. An administrator will review your request and notify you via email.",
        }
      } else {
        // Auto-approve staff accounts
        const newUser: User = {
          id: Date.now(),
          username: data.username,
          email: data.email,
          roles: data.roles,
          department_id: data.department_id,
          full_name: data.full_name,
        }

        const token = `mock_token_${newUser.id}_${Date.now()}`
        localStorage.setItem("access_token", token)
        localStorage.setItem("user_data", JSON.stringify(newUser))
        setUser(newUser)

        return {
          success: true,
          message: "Registration successful",
          user: newUser,
          token,
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Registration failed. Please try again.",
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_data")
    setUser(null)
    window.location.href = "/"
  }

  const hasRole = (role: string) => user?.roles?.includes(role) || false

  const hasAnyRole = (roles: string[]) => roles.some((role) => hasRole(role))

  const getPrimaryRole = () => {
    if (!user?.roles?.length) return null

    // Priority order for determining primary role
    const rolePriority = ["admin", "stock_manager", "staff", "viewer"]

    for (const role of rolePriority) {
      if (user.roles.includes(role)) {
        return role
      }
    }

    return user.roles[0] // Fallback to first role
  }

  const isAuthenticated = !!user

  return {
    user,
    loading,
    hasRole,
    hasAnyRole,
    getPrimaryRole,
    login,
    register,
    logout,
    isAuthenticated,
  }
}
