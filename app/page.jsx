"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Bot,
  Zap,
  Calendar,
  BarChart3,
  Sparkles,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Play,
  Pause,
  Plus,
  TrendingUp,
  Users,
  Heart,
  Eye,
} from "lucide-react"

export default function Dashboard() {
  const [isAutomationActive, setIsAutomationActive] = useState(true)
  const [floatingElements, setFloatingElements] = useState([])

  useEffect(() => {
    // Create floating 3D elements
    const elements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() * 20 + 10,
    }))
    setFloatingElements(elements)
  }, [])

  const stats = [
    { label: "Posts Generated", value: "1,247", change: "+12%", icon: Bot },
    { label: "Engagement Rate", value: "8.4%", change: "+2.1%", icon: Heart },
    { label: "Followers Growth", value: "+2,847", change: "+18%", icon: Users },
    { label: "Reach", value: "45.2K", change: "+24%", icon: Eye },
  ]

  const recentPosts = [
    {
      platform: "Instagram",
      content: "Just launched our new AI-powered feature! 🚀 The future of automation is here...",
      engagement: "234 likes, 45 comments",
      time: "2 hours ago",
      status: "published",
    },
    {
      platform: "Facebook",
      content: "Behind the scenes: How we built our social media automation tool using cutting-edge AI...",
      engagement: "156 likes, 23 shares",
      time: "4 hours ago",
      status: "published",
    },
    {
      platform: "Twitter",
      content: "The future of content creation is automated, intelligent, and incredibly powerful. Here's why...",
      engagement: "89 retweets, 234 likes",
      time: "6 hours ago",
      status: "scheduled",
    },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating 3D Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute animate-float opacity-20"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              width: `${element.size}px`,
              height: `${element.size}px`,
            }}
          >
            <div className="w-full h-full floating-element rounded-full blur-sm animate-pulse-neon" />
          </div>
        ))}
      </div>

      {/* Matrix Rain Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute matrix-text text-xs animate-matrix-rain"
            style={{
              left: `${i * 5}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {"01010101".split("").map((char, j) => (
              <div key={j} className="mb-2 high-contrast-text">
                {char}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 glass-effect">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center animate-glow">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-glow">AI Social Automation</h1>
                    <p className="text-sm text-muted-foreground">The Future of Content Creation</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Badge variant={isAutomationActive ? "default" : "secondary"} className="animate-pulse-neon">
                  <Zap className="w-3 h-3 mr-1" />
                  <span className="text-white">{isAutomationActive ? "Active" : "Paused"}</span>
                </Badge>
                <Button
                  onClick={() => setIsAutomationActive(!isAutomationActive)}
                  variant={isAutomationActive ? "destructive" : "default"}
                  className="neon-border"
                >
                  {isAutomationActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  <span className="text-white">{isAutomationActive ? "Pause" : "Start"} Automation</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="glass-effect neon-border animate-float hover:animate-glow transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-glow">{stat.value}</p>
                      <p className="text-xs text-green-400">{stat.change}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center animate-pulse-neon">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Content Generator */}
            <div className="lg:col-span-2">
              <Card className="glass-effect neon-border animate-float">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-glow">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>AI Content Generator</span>
                  </CardTitle>
                  <CardDescription>Generate engaging posts with advanced AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "Facebook", icon: Facebook, color: "bg-blue-600" },
                      { name: "Instagram", icon: Instagram, color: "bg-pink-600" },
                      { name: "Twitter", icon: Twitter, color: "bg-sky-500" },
                      { name: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
                    ].map((platform) => (
                      <Button
                        key={platform.name}
                        variant="outline"
                        className="h-20 flex-col space-y-2 neon-border hover:animate-glow bg-transparent"
                      >
                        <platform.icon className="w-6 h-6 text-white" />
                        <span className="text-xs platform-text">{platform.name}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Next post generation in:</span>
                      <Badge variant="outline" className="animate-pulse-neon">
                        <span className="text-white">2h 34m</span>
                      </Badge>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 animate-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="text-white">Generate New Post</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="glass-effect neon-border animate-float" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-glow">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 neon-border">
                      <span className="text-sm text-white">Today</span>
                      <Badge variant="secondary">
                        <span className="text-white">3 posts</span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <span className="text-sm text-white">Tomorrow</span>
                      <Badge variant="outline">
                        <span className="text-white">2 posts</span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <span className="text-sm text-white">This Week</span>
                      <Badge variant="outline">
                        <span className="text-white">14 posts</span>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect neon-border animate-float" style={{ animationDelay: "0.4s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-glow">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Engagement</span>
                      <span className="text-sm font-medium text-green-400">+24%</span>
                    </div>
                    <Progress value={78} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Reach</span>
                      <span className="text-sm font-medium text-green-400">+18%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Posts */}
          <Card className="mt-8 glass-effect neon-border animate-float" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-glow">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Recent Posts</span>
              </CardTitle>
              <CardDescription>Your latest AI-generated content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-lg bg-muted/20 neon-border hover:animate-glow transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      {post.platform === "Instagram" && <Instagram className="w-5 h-5 text-white" />}
                      {post.platform === "Facebook" && <Facebook className="w-5 h-5 text-white" />}
                      {post.platform === "Twitter" && <Twitter className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-white">{post.platform}</span>
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>
                          <span className="text-white">{post.status}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">{post.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{post.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{post.engagement}</span>
                        </span>
                      </div>
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
