"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  History,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Search,
  Filter,
  TrendingUp,
  Heart,
  MessageCircle,
  Share,
  Eye,
  ArrowLeft,
  Download,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AutomationHistory() {
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPosts: 0,
    successfulPosts: 0,
    failedPosts: 0,
    totalEngagement: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadPostHistory()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchTerm, platformFilter, statusFilter, dateFilter])

  const loadPostHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/automation")
      if (response.ok) {
        const data = await response.json()

        // Generate some sample historical data if none exists
        const samplePosts = data.recentPosts.length > 0 ? data.recentPosts : generateSampleHistory()

        setPosts(samplePosts)
        calculateStats(samplePosts)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load post history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateSampleHistory = () => {
    const platforms = ["Facebook", "Instagram", "Twitter", "LinkedIn"]
    const statuses = ["published", "failed", "scheduled"]
    const sampleTopics = [
      "AI development expertise and latest projects",
      "MERN stack development innovations",
      "Game development with Unreal Engine",
      "Seeking co-founders for tech projects",
      "Web development insights",
      "Technology trends and AI innovations",
    ]

    return Array.from({ length: 25 }, (_, i) => {
      const platform = platforms[Math.floor(Math.random() * platforms.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const topic = sampleTopics[Math.floor(Math.random() * sampleTopics.length)]
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 30))

      return {
        id: Date.now() + i,
        platform,
        content: `🚀 ${topic}. Building innovative solutions with cutting-edge technology. Looking for passionate developers to join our mission! #AI #Tech #Innovation #${platform.toLowerCase()}`,
        status,
        time: date.toISOString(),
        engagement: {
          likes: Math.floor(Math.random() * 100) + 10,
          comments: Math.floor(Math.random() * 20) + 2,
          shares: Math.floor(Math.random() * 15) + 1,
          views: Math.floor(Math.random() * 500) + 50,
        },
        topic,
        isAutomated: Math.random() > 0.3,
        imageUrl: Math.random() > 0.5 ? "/tech-innovation-abstract.png" : null,
      }
    })
  }

  const calculateStats = (postsData) => {
    const total = postsData.length
    const successful = postsData.filter((p) => p.status === "published").length
    const failed = postsData.filter((p) => p.status === "failed").length
    const totalEngagement = postsData.reduce((sum, post) => {
      if (post.engagement) {
        return sum + post.engagement.likes + post.engagement.comments + post.engagement.shares
      }
      return sum
    }, 0)

    setStats({
      totalPosts: total,
      successfulPosts: successful,
      failedPosts: failed,
      totalEngagement,
    })
  }

  const filterPosts = () => {
    let filtered = [...posts]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.topic.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Platform filter
    if (platformFilter !== "all") {
      filtered = filtered.filter((post) => post.platform.toLowerCase() === platformFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((post) => post.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      if (dateFilter !== "all") {
        filtered = filtered.filter((post) => new Date(post.time) >= filterDate)
      }
    }

    setFilteredPosts(filtered)
  }

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="w-4 h-4" />
      case "instagram":
        return <Instagram className="w-4 h-4" />
      case "twitter":
        return <Twitter className="w-4 h-4" />
      case "linkedin":
        return <Linkedin className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      case "scheduled":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  const exportHistory = () => {
    const csvContent = [
      ["Date", "Platform", "Status", "Content", "Likes", "Comments", "Shares", "Views"].join(","),
      ...filteredPosts.map((post) =>
        [
          new Date(post.time).toLocaleDateString(),
          post.platform,
          post.status,
          `"${post.content.replace(/"/g, '""')}"`,
          post.engagement?.likes || 0,
          post.engagement?.comments || 0,
          post.engagement?.shares || 0,
          post.engagement?.views || 0,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `automation-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Post history has been exported to CSV",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.history.back()} className="neon-border">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-white">Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-glow">Automation History</h1>
              <p className="text-muted-foreground">Complete record of all automated posts and their performance</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={loadPostHistory}
              disabled={isLoading}
              className="neon-border bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              <span className="text-white">Refresh</span>
            </Button>
            <Button variant="outline" onClick={exportHistory} className="neon-border bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              <span className="text-white">Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect neon-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold text-glow">{stats.totalPosts}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect neon-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-glow">
                    {stats.totalPosts > 0 ? Math.round((stats.successfulPosts / stats.totalPosts) * 100) : 0}%
                  </p>
                </div>
                <Heart className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect neon-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed Posts</p>
                  <p className="text-2xl font-bold text-glow">{stats.failedPosts}</p>
                </div>
                <Eye className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect neon-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Engagement</p>
                  <p className="text-2xl font-bold text-glow">{stats.totalEngagement}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-effect neon-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-glow">
              <Filter className="w-5 h-5 text-primary" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 neon-border bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white">Platform</label>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="neon-border bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="neon-border bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="neon-border bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <Card className="glass-effect neon-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-glow">
              <History className="w-5 h-5 text-primary" />
              <span>Post History ({filteredPosts.length})</span>
            </CardTitle>
            <CardDescription>Detailed view of all automated posts and their performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading post history...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No posts found matching your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-lg bg-muted/20 neon-border hover:animate-glow transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                          {getPlatformIcon(post.platform)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white">{post.platform}</span>
                            <Badge className={`${getStatusColor(post.status)} border`}>{post.status}</Badge>
                            {post.isAutomated && (
                              <Badge variant="outline" className="text-blue-400 border-blue-400">
                                Automated
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(post.time).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                    </div>

                    {post.engagement && (
                      <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{post.engagement.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.engagement.comments}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Share className="w-3 h-3" />
                          <span>{post.engagement.shares}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.engagement.views}</span>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
