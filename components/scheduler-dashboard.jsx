"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Play,
  Pause,
  Bot,
  Zap,
  RefreshCw,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SchedulerDashboard() {
  const [scheduledPosts, setScheduledPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAutomationActive, setIsAutomationActive] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [formData, setFormData] = useState({
    content: "",
    imageUrl: "",
    platforms: [],
    scheduledTime: "",
    recurring: false,
    topic: "",
    tone: "engaging",
  })

  const { toast } = useToast()

  const platforms = [
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-500" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500" },
    { id: "twitter", name: "Twitter", icon: Twitter, color: "text-sky-500" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  ]

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "engaging", label: "Engaging" },
    { value: "humorous", label: "Humorous" },
    { value: "inspirational", label: "Inspirational" },
  ]

  useEffect(() => {
    fetchScheduledPosts()
  }, [])

  const fetchScheduledPosts = async () => {
    try {
      const response = await fetch("/api/scheduler")
      const data = await response.json()
      setScheduledPosts(data.scheduledPosts || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch scheduled posts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSchedulePost = async () => {
    if (!formData.content.trim() && !formData.topic.trim()) {
      toast({
        title: "Content or Topic Required",
        description: "Please provide either content or a topic for AI generation",
        variant: "destructive",
      })
      return
    }

    if (formData.platforms.length === 0) {
      toast({
        title: "Platform Required",
        description: "Please select at least one platform",
        variant: "destructive",
      })
      return
    }

    if (!formData.scheduledTime) {
      toast({
        title: "Schedule Time Required",
        description: "Please select a time to schedule the post",
        variant: "destructive",
      })
      return
    }

    try {
      let content = formData.content

      // If no content provided but topic is, generate content with AI
      if (!content.trim() && formData.topic.trim()) {
        const generateResponse = await fetch("/api/generate-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform: formData.platforms[0],
            topic: formData.topic,
            tone: formData.tone,
            includeHashtags: true,
            contentType: "post",
          }),
        })

        if (!generateResponse.ok) {
          throw new Error("Failed to generate content")
        }

        const generateData = await generateResponse.json()
        content = generateData.content
      }

      const response = await fetch("/api/scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          content,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to schedule post")
      }

      toast({
        title: "Post Scheduled!",
        description: "Your post has been scheduled successfully",
      })

      setFormData({
        content: "",
        imageUrl: "",
        platforms: [],
        scheduledTime: "",
        recurring: false,
        topic: "",
        tone: "engaging",
      })
      setShowScheduleForm(false)
      fetchScheduledPosts()
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`/api/scheduler?id=${postId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      toast({
        title: "Post Deleted",
        description: "Scheduled post has been removed",
      })

      fetchScheduledPosts()
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const toggleAutomation = async () => {
    try {
      const response = await fetch("/api/automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: isAutomationActive ? "stop" : "start",
          config: {
            platforms: ["facebook", "instagram", "twitter"],
            topic: "AI and technology",
            tone: "engaging",
            frequency: "daily",
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle automation")
      }

      setIsAutomationActive(!isAutomationActive)
      toast({
        title: isAutomationActive ? "Automation Stopped" : "Automation Started",
        description: isAutomationActive ? "Automatic posting has been disabled" : "Automatic posting is now active",
      })
    } catch (error) {
      toast({
        title: "Automation Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handlePlatformToggle = (platformId) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Automation Control */}
      <Card className="glass-effect neon-border animate-float">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-glow">
              <Bot className="w-5 h-5 text-primary animate-pulse-neon" />
              <span>Automation Control</span>
            </div>
            <Badge variant={isAutomationActive ? "default" : "secondary"} className="animate-pulse-neon">
              <Zap className="w-3 h-3 mr-1" />
              {isAutomationActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
          <CardDescription>Automatically generate and post content on schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {isAutomationActive
                  ? "AI is automatically generating and posting content"
                  : "Automation is currently disabled"}
              </p>
            </div>
            <Button
              onClick={toggleAutomation}
              variant={isAutomationActive ? "destructive" : "default"}
              className="neon-border"
            >
              {isAutomationActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isAutomationActive ? "Stop" : "Start"} Automation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule New Post */}
      <Card className="glass-effect neon-border animate-float" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-glow">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Schedule New Post</span>
            </div>
            <Button onClick={() => setShowScheduleForm(!showScheduleForm)} variant="outline" className="neon-border">
              <Plus className="w-4 h-4 mr-2" />
              {showScheduleForm ? "Cancel" : "New Post"}
            </Button>
          </CardTitle>
        </CardHeader>

        {showScheduleForm && (
          <CardContent className="space-y-6">
            {/* Content or Topic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content">Post Content (Optional)</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your post content or leave blank for AI generation..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="neon-border bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">AI Topic (Optional)</Label>
                <Input
                  id="topic"
                  placeholder="e.g., AI technology, business tips..."
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="neon-border bg-transparent"
                />
                <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                  <SelectTrigger className="neon-border bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((tone) => (
                      <SelectItem key={tone.value} value={tone.value}>
                        {tone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="neon-border bg-transparent"
              />
            </div>

            {/* Platform Selection */}
            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.platforms.includes(platform.id)
                        ? "border-primary bg-primary/10 animate-glow"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handlePlatformToggle(platform.id)}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <platform.icon className={`w-5 h-5 ${platform.color}`} />
                      <span className="text-xs">{platform.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Schedule Time</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="neon-border bg-transparent"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="recurring"
                  checked={formData.recurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, recurring: checked })}
                />
                <Label htmlFor="recurring">Recurring Post</Label>
              </div>
            </div>

            <Button
              onClick={handleSchedulePost}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 animate-glow"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Post
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Scheduled Posts List */}
      <Card className="glass-effect neon-border animate-float" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-glow">
              <Clock className="w-5 h-5 text-primary" />
              <span>Scheduled Posts</span>
            </div>
            <Button onClick={fetchScheduledPosts} variant="outline" size="sm" className="neon-border bg-transparent">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled posts yet</p>
              <p className="text-sm">Create your first scheduled post above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-lg bg-muted/20 neon-border hover:animate-glow transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={post.status === "scheduled" ? "default" : "secondary"}>{post.status}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(post.scheduledTime).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-sm mb-3 line-clamp-2">{post.content}</p>

                      <div className="flex items-center space-x-2">
                        {post.platforms.map((platformId) => {
                          const platform = platforms.find((p) => p.id === platformId)
                          return (
                            <div key={platformId} className="flex items-center space-x-1">
                              <platform.icon className={`w-4 h-4 ${platform.color}`} />
                              <span className="text-xs">{platform.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleDeletePost(post.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
