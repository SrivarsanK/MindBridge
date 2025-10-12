"use client"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Users, 
  Settings, 
  Menu,
  X,
  Sparkles,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Your wellness home"
  },
  {
    name: "Peer Search",
    href: "/peer-search",
    icon: Users,
    description: "Find peer connections"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Privacy & preferences"
  },
]

export default function NavigationSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const toggleSidebar = () => setIsOpen(!isOpen)

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  // Define pages where sidebar should be visible
  const allowedPages = ['/dashboard', '/peer-search', '/settings']
  
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
          "fixed top-0 left-0 z-40 h-screen w-72 bg-card/95 backdrop-blur-md border-r shadow-2xl transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:sticky lg:z-0 lg:h-[100vh]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">MindBridge</h2>
                <p className="text-xs text-muted-foreground">Mental Wellness</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    "hover:bg-primary/10 hover:translate-x-1",
                    isActive
                      ? "bg-primary/15 border-2 border-primary/30 shadow-md"
                      : "border-2 border-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/5 text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
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
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t flex-shrink-0">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">Your Privacy</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All data is encrypted and anonymous
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
