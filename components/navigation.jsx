"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Bot, Send, Calendar, Settings, BarChart3, Sparkles, Zap } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/generate", label: "Generate", icon: Bot },
    { href: "/publish", label: "Publish", icon: Send },
    { href: "/schedule", label: "Schedule", icon: Calendar },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 glass-effect">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center animate-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-glow">AI Social</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    pathname === item.href ? "animate-glow" : "hover:animate-pulse-neon"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Status Badge */}
          <Badge variant="default" className="animate-pulse-neon">
            <Zap className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>
    </nav>
  )
}
