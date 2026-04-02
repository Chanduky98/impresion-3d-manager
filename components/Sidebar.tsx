"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Printer,
  Boxes,
  ShoppingCart,
  Users,
  Settings,
  Wrench,
  Calendar,
  FileText,
  DollarSign,
  LogOut,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/Button"

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Impresoras",
    href: "/printers",
    icon: Printer,
  },
  {
    label: "Piezas",
    href: "/pieces",
    icon: Boxes,
  },
  {
    label: "Costes Piezas",
    href: "/pieces-costing",
    icon: DollarSign,
  },
  {
    label: "Pedidos",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    label: "Clientes",
    href: "/clients",
    icon: Users,
  },
  {
    label: "Materiales",
    href: "/materials",
    icon: FileText,
  },
  {
    label: "Mantenimiento",
    href: "/maintenance",
    icon: Wrench,
  },
  {
    label: "Calendario",
    href: "/calendar",
    icon: Calendar,
  },
  {
    label: "Configuración",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem("auth_user")
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        console.error("Error parsing user:", e)
      }
    }
    setLoading(false)
  }, [])

  async function handleLogout() {
    try {
      const token = localStorage.getItem("auth_token")
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }

      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      router.push("/login")
    }
  }

  return (
    <div className="w-64 min-h-screen bg-card border-r border-border shadow-lg flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">3D Manager</h1>
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </div>

      <nav className="mt-8 space-y-2 px-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User info and logout */}
      <div className="border-t border-border p-4 space-y-3">
        {!loading && user && (
          <div className="bg-muted p-3 rounded-lg text-sm">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              <span className="font-medium text-xs uppercase text-muted-foreground">
                {user.role === "admin" ? "🔐 Admin" : "👤 Usuario"}
              </span>
            </div>
            <p className="text-foreground font-medium truncate">{user.email}</p>
          </div>
        )}

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-center gap-2"
          size="sm"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </Button>
      </div>

      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 3D Printing Manager
        </p>
      </div>
    </div>
  )
}
