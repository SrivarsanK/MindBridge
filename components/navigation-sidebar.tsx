"use client"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Users, 
  UserCircle,
  Settings, 
  Menu,
  X,
  Shield,
  Wind
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/components/locale-provider"

export default function NavigationSidebar() {
  const { t } = useLocale()
  
  const navigationItems = [
    {
      name: t("dashboard"),
      href: "/dashboard",
      icon: Home,
      description: t("nav_dashboard_desc")
    },
    {
      name: "Breathing Exercises",
      href: "/breathing",
      icon: Wind,
      description: "Science-backed techniques for calm"
    },
    {
      name: t("peer_search"),
      href: "/peer-search",
      icon: Users,
      description: t("nav_peer_search_desc")
    },
    {
      name: t("professional_support"),
      href: "/professional-support",
      icon: UserCircle,
      description: t("nav_professional_support_desc")
    },
    {
      name: t("settings"),
      href: "/settings",
      icon: Settings,
      description: t("nav_settings_desc")
    },
  ]
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const toggleSidebar = () => setIsOpen(!isOpen)
  const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  // Define pages where sidebar should be visible
  const allowedPages = ['/dashboard', '/breathing', '/peer-search', '/professional-support', '/settings']
  
  // Check if current page should show sidebar
  const shouldShowSidebar = allowedPages.some(page => pathname?.startsWith(page))

  // Don't render sidebar on unauthorized pages
  if (!shouldShowSidebar) {
    return null
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 h-12 w-12 rounded-2xl border-2 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all lg:hidden"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-card/95 backdrop-blur-md border-r shadow-2xl transition-all duration-300 ease-in-out",
          "lg:translate-x-0 lg:sticky lg:z-0 lg:h-[100vh]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-20 w-72" : "w-72"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
            {/* Desktop Collapse Toggle Button */}
            <div className="hidden lg:block mb-2">
              <button
                onClick={toggleCollapse}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl transition-all duration-200",
                  isCollapsed 
                    ? "px-2 py-2 justify-center" 
                    : "px-4 py-3 hover:translate-x-1 hover:bg-primary/10"
                )}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 bg-primary/5 text-primary hover:bg-primary/10">
                  <Menu className="h-5 w-5" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground/80">Menu</p>
                    <p className="text-xs text-muted-foreground">Collapse sidebar</p>
                  </div>
                )}
              </button>
            </div>

            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl transition-all duration-200",
                    isCollapsed 
                      ? "px-2 py-2 justify-center" 
                      : "px-4 py-3 hover:translate-x-1 hover:bg-primary/10",
                    !isCollapsed && isActive
                      ? "bg-primary/15 border-2 border-primary/30 shadow-md"
                      : !isCollapsed && "border-2 border-transparent"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div
                    className={cn(
                      "rounded-xl flex items-center justify-center transition-all duration-200 shrink-0",
                      isCollapsed 
                        ? "h-12 w-12" 
                        : "h-10 w-10",
                      isActive
                        ? isCollapsed 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-primary text-primary-foreground shadow-lg"
                        : "bg-primary/5 text-primary hover:bg-primary/10"
                    )}
                  >
                    <Icon className={cn(
                      "transition-all",
                      isCollapsed ? "h-6 w-6" : "h-5 w-5"
                    )} />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          isActive ? "text-foreground" : "text-foreground/80"
                        )}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t flex-shrink-0">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium">{t("privacy_first_nav")}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("privacy_desc_nav")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
