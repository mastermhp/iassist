"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import {
  BarChart3,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [analyticsData, setAnalyticsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const platforms = [
    { id: "all", name: "All Platforms", icon: BarChart3, color: "text-primary" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-500" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500" },
    { id: "twitter", name: "Twitter", icon: Twitter, color: "text-sky-500" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  ]

  // Mock analytics data
  const mockData = {
    overview: {
      totalPosts: 45,
      totalReach: 12500,
      totalEngagement: 2340,
      avgEngagementRate: 18.7,
    },
    platformStats: {
      facebook: { posts: 15, reach: 4500, engagement: 890 },
      instagram: { posts: 18, reach: 5200, engagement: 1120 },
      twitter: { posts: 8, reach: 1800, engagement: 210 },
      linkedin: { posts: 4, reach: 1000, engagement: 120 },
    },
    chartData: [
      { date: "2024-01-01", posts: 3, reach: 850, engagement: 120 },
      { date: "2024-01-02", posts: 2, reach: 720, engagement: 95 },
      { date: "2024-01-03", posts: 4, reach: 1200, engagement: 180 },
      { date: "2024-01-04", posts: 1, reach: 450, engagement: 65 },
      { date: "2024-01-05", posts: 3, reach: 980, engagement: 145 },
      { date: "2024-01-06", posts: 2, reach: 650, engagement: 88 },
      { date: "2024-01-07", posts: 3, reach: 1100, engagement: 165 },
    ],
    topPosts: [
      {
        id: 1,
        platform: "Instagram",
        content: "🚀 Exciting AI development update! Working on revolutionary automation tools...",
        engagement: 245,
        reach: 1200,
        date: "2024-01-05",
      },
      {
        id: 2,
        platform: "Facebook",
        content: "💻 MERN stack development insights and best practices for modern web apps...",
        engagement: 189,
        reach: 980,
        date: "2024-01-03",
      },
      {
        id: 3,
        platform: "LinkedIn",
        content: "🤝 Seeking passionate co-founders for innovative IT projects...",
        engagement: 156,
        reach: 750,
        date: "2024-01-04",
      },
    ],
  }

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setAnalyticsData(mockData)
      setIsLoading(false)
    }, 1000)
  }, [dateRange, selectedPlatform])

  const chartConfig = {
    posts: {
      label: "Posts",
      color: "hsl(var(--chart-1))",
    },
    reach: {
      label: "Reach",
      color: "hsl(var(--chart-2))",
    },
    engagement: {
      label: "Engagement",
      color: "hsl(var(--chart-3))",
    },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="relative z-10">
          <header className="border-b border-border/50 glass-effect">
            <div className="container mx-auto px-6 py-4">
              <h1 className="text-3xl font-bold text-glow">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Track your social media performance and engagement</p>
            </div>
          </header>
          <main className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-white">Loading analytics...</span>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full blur-sm animate-pulse-neon" />
          </div>
        ))}
      </div>

      <div className="relative z-10">
        <header className="border-b border-border/50 glass-effect">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-glow">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Track your social media performance and engagement</p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32 neon-border bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="neon-border bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="text-white">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-effect neon-border animate-float">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Posts</p>
                    <p className="text-2xl font-bold text-glow">{analyticsData.overview.totalPosts}</p>
                    <p className="text-xs text-green-400">+12% from last period</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary animate-pulse-neon" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect neon-border animate-float" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reach</p>
                    <p className="text-2xl font-bold text-glow">{analyticsData.overview.totalReach.toLocaleString()}</p>
                    <p className="text-xs text-green-400">+24% from last period</p>
                  </div>
                  <Eye className="w-8 h-8 text-secondary animate-pulse-neon" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect neon-border animate-float" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Engagement</p>
                    <p className="text-2xl font-bold text-glow">{analyticsData.overview.totalEngagement.toLocaleString()}</p>
                    <p className="text-xs text-green-400">+18% from last period</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-400 animate-pulse-neon" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect neon-border animate-float" style={{ animationDelay: "0.3s" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <p className="text-2xl font-bold text-glow">{analyticsData.overview.avgEngagementRate}%</p>
                    <p className="text-xs text-green-400">+5.2% from last period</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400 animate-pulse-neon" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Performance */}
          <Card className="glass-effect neon-border animate-float">
            <CardHeader>
              <CardTitle className="text-glow">Platform Performance</CardTitle>
              <CardDescription>Compare performance across different social media platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analyticsData.platformStats).map(([platform, stats]) => {
                  const platformInfo = platforms.find(p => p.id === platform)
                  return (
                    <div key={platform} className="p-4 rounded-lg bg-muted/20 neon-border">
                      <div className="flex items-center space-x-2 mb-3">
                        <platformInfo.icon className={`w-5 h-5 ${platformInfo.color}`} />
                        <span className="font-medium text-white capitalize">{platform}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Posts</span>
                          <span className="text-sm font-medium text-white">{stats.posts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Reach</span>
                          <span className="text-sm font-medium text-white">{stats.reach.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Engagement</span>
                          <span className="text-sm font-medium text-white">{stats.engagement}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="glass-effect neon-border animate-float">
            <CardHeader>
              <CardTitle className="text-glow">Performance Trends</CardTitle>
              <CardDescription>Track your social media metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.5)"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="reach" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Performing Posts */}
          <Card className="glass-effect neon-border animate-float">
            <CardHeader>
              <CardTitle className="text-glow">Top Performing Posts</CardTitle>
              <CardDescription>Your most successful content from the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPosts.map((post, index) => (
                  <div key={post.id} className="p-4 rounded-lg bg-muted/20 neon-border hover:animate-glow transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{post.platform}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm mb-3 line-clamp-2 text-white">{post.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.reach}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.engagement}</span>
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}