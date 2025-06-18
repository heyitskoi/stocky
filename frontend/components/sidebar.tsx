"use client"
import {
  Package,
  Users,
  FileText,
  RotateCcw,
  UserCheck,
  Settings,
  Home,
  ChevronDown,
  LogOut,
  User,
  ArrowRight,
  PackagePlus,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import type { NavItem } from "@/types/stock"

// Define navigation items with role requirements
const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and quick actions",
    requiredRoles: ["stock_manager", "admin"],
  },
  {
    title: "Department Stock",
    href: "/department-dashboard",
    icon: Package,
    description: "Manage department inventory",
    requiredRoles: ["stock_manager"],
  },
  {
    title: "Stock Intake",
    href: "/intake",
    icon: PackagePlus,
    description: "Record new stock arrivals",
    requiredRoles: ["stock_manager", "admin"],
  },
  {
    title: "My Equipment",
    href: "/my-equipment",
    icon: UserCheck,
    description: "View your assigned items",
    requiredRoles: ["staff"],
  },
  {
    title: "Assign Items",
    href: "/assign",
    icon: Users,
    description: "Assign stock to users",
    requiredRoles: ["stock_manager"],
  },
  {
    title: "Return Items",
    href: "/return",
    icon: RotateCcw,
    description: "Process equipment returns",
    requiredRoles: ["stock_manager"],
  },
  {
    title: "Transfer Management",
    href: "/transfers",
    icon: ArrowRight,
    description: "Manage inter-department transfers",
    requiredRoles: ["stock_manager", "admin"],
  },
  {
    title: "Audit Logs",
    href: "/audit/logs",
    icon: FileText,
    description: "View system audit trail",
    requiredRoles: ["admin"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration",
    requiredRoles: ["admin"],
  },
  {
    title: "Account Approvals",
    href: "/account-approvals",
    icon: UserCheck,
    description: "Review pending account requests",
    requiredRoles: ["admin"],
  },
]

export function AppSidebar() {
  const { user, hasAnyRole } = useAuth()

  // Filter navigation items based on user roles
  const visibleNavItems = navigationItems.filter((item) => hasAnyRole(item.requiredRoles))

  const handleLogout = () => {
    // In a real app, you'd clear tokens and redirect
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_data")
    window.location.href = "/login"
  }

  return (
    <Sidebar className="border-r border-border/40 w-72">
      <SidebarHeader className="border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight">Stock Manager</h2>
            <p className="text-sm text-muted-foreground">Inventory System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {visibleNavItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className="group relative h-12 px-3 hover:bg-accent/50 transition-all duration-200 rounded-lg mx-2 mb-1"
                    >
                      <a href={item.href} className="flex items-center gap-3">
                        <IconComponent className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium text-sm group-hover:text-foreground transition-colors leading-tight">
                            {item.title}
                          </span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors leading-tight">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-4 my-4" />

        {/* Role Information */}
        {user && Array.isArray(user.roles) && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Roles
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <div className="px-4 py-2">
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {role.replace("_", " ").toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 bg-muted/20 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 px-3 hover:bg-accent/50 transition-all duration-200 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {user?.full_name?.charAt(0) || user?.username?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm truncate">{user?.full_name || user?.username}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] mb-2" align="start">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
