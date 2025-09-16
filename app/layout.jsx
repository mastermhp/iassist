import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import Navigation from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata = {
  title: "AI Social Media Automation - The Future of Content Creation",
  description: "Automate your social media presence with AI-powered content generation and scheduling",
  generator: "AI Social Media Automation",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Navigation />
        <div className="pt-16">
          <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen bg-background">{children}</div>
          </Suspense>
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
