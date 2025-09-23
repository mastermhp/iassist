"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  Calendar,
  Clock,
  Play,
  Pause,
  TrendingUp,
  Zap,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ImageIcon,
  FileText,
  BarChart3,
  Activity,
  Timer,
  Target,
  Sparkles,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AutoPostDashboard() {
  const [isAutomationActive, setIsAutomationActive] = useState(false)
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      name: "Morning Tech Updates",
      times: ["09:00"],
      platforms: ["facebook", "linkedin"],
      topic: "AI development and seeking co-founders for tech innovations",
      tone: "professional",
      enabled: true,
      nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: "active",
      postsGenerated: 12,
      successRate: 95,
    },
    {
      id: 2,
      name: "Evening Engagement",
      times: ["18:00"],
      platforms: ["instagram", "twitter"],
      topic: "Business insights and entrepreneurship",
      tone: "engaging",
      enabled: true,
      nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: "active",
      postsGenerated: 8,
      successRate: 87,
    },
  ])

  const [automationStats, setAutomationStats] = useState({
    totalPosts: 47,
    successfulPosts: 43,
    failedPosts: 4,
    avgEngagement: 24.5,
    topicsSuggested: 15,
    imagesGenerated: 23,
  })

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "post_generated",
      schedule: "Morning Tech Updates",
      platform: "Facebook",
      content: "Exploring the future of AI in business automation...",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: "success",
      engagement: { likes: 12, comments: 3, shares: 2 },
    },
    {
      id: 2,
      type: "image_generated",
      schedule: "Evening Engagement",
      platform: "Instagram",
      content: "Generated image for entrepreneurship post",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: "success",
    },
    {
      id: 3,
      type: "topic_suggested",
      schedule: "Morning Tech Updates",
      content: "AI-powered customer service solutions",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      status: "pending",
    },
    {
      id: 4,
      type: "post_failed",
      schedule: "Evening Engagement",
      platform: "Twitter",
      content: "API rate limit exceeded",
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      status: "error",
    },
  ])

  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    times: ["09:00"],
    platforms: ["facebook"],
    topic: "",
    tone: "professional",
    enabled: true,
  })

  const { toast } = useToast()

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update next run times
      setSchedules((prev) =>
        prev.map((schedule) => ({
          ...schedule,
          nextRun: new Date(schedule.nextRun.getTime() - 60000), // Subtract 1 minute
        })),
      )
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const toggleAutomation = async () => {
    setIsAutomationActive(!isAutomationActive)
    toast({
      title: isAutomationActive ? "Automation Paused" : "Automation Started",
      description: isAutomationActive
        ? "All scheduled posts have been paused"
        : "AI will now generate and post content automatically",
    })
  }

  const toggleSchedule = (scheduleId) => {
    setSchedules((prev) =>
      prev.map((schedule) => (schedule.id === scheduleId ? { ...schedule, enabled: !schedule.enabled } : schedule)),
    )
  }

  const deleteSchedule = (scheduleId) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== scheduleId))
    toast({
      title: "Schedule Deleted",
      description: "The automation schedule has been removed",
    })
  }

  const addSchedule = () => {
    const schedule = {
      ...newSchedule,
      id: Date.now(),
      nextRun: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      lastRun: null,
      status: "active",
      postsGenerated: 0,
      successRate: 100,
    }
    setSchedules((prev) => [...prev, schedule])
    setNewSchedule({
      name: "",
      times: ["09:00"],
      platforms: ["facebook"],
      topic: "",
      tone: "professional",
      enabled: true,
    })
    setShowScheduleForm(false)
    toast({
      title: "Schedule Added",
      description: "New automation schedule has been created",
    })
  }

  const triggerScheduleNow = async (scheduleId) => {
    const schedule = schedules.find((s) => s.id === scheduleId)
    toast({
      title: "Generating Content",
      description: `Creating post for "${schedule.name}"...`,
    })

    // Simulate content generation
    setTimeout(() => {
      setRecentActivity((prev) => [
        {
          id: Date.now(),
          type: "post_generated",
          schedule: schedule.name,
          platform: schedule.platforms[0],
          content: "AI-generated content about " + schedule.topic,
          timestamp: new Date(),
          status: "success",
        },
        ...prev,
      ])

      toast({
        title: "Content Posted",
        description: "Successfully generated and posted content",
      })
    }, 3000)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-500"
      case "error":
        return "text-red-500"
      case "pending":
        return "text-yellow-500"
      default:
        return "text-blue-500"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return CheckCircle
      case "error":
        return XCircle
      case "pending":
        return AlertCircle
      default:
        return Activity
    }
  }

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "facebook":
        return Facebook
      case "instagram":
        return Instagram
      case "twitter":
        return Twitter
      case "linkedin":
        return Linkedin
      default:
        return Bot
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "post_generated":
        return FileText
      case "image_generated":
        return ImageIcon
      case "topic_suggested":
        return Sparkles
      case "post_failed":
        return XCircle
      default:
        return Activity
    }
  }

  const formatTimeUntil = (date) => {
    const now = new Date()
    const diff = date - now
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (diff < 0) return "Overdue"
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="glass-effect neon-border animate-float">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-glow">
                <Bot className="w-6 h-6 text-primary animate-pulse-neon" />
                <span>Auto-Post Dashboard</span>
                <Badge variant={isAutomationActive ? "default" : "secondary"} className="animate-pulse-neon">
                  <Zap className="w-3 h-3 mr-1" />
                  {isAutomationActive ? "Active" : "Paused"}
                </Badge>
              </CardTitle>
              <CardDescription>Manage your automated content generation and posting schedules</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowScheduleForm(true)}
                className="neon-border bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
              <Button
                onClick={toggleAutomation}
                variant={isAutomationActive ? "destructive" : "default"}
                className="neon-border"
              >
                {isAutomationActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isAutomationActive ? "Pause All" : "Start All"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect neon-border animate-float">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold text-glow">{automationStats.totalPosts}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect neon-border animate-float">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-glow">
                  {Math.round((automationStats.successfulPosts / automationStats.totalPosts) * 100)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect neon-border animate-float">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Engagement</p>
                <p className="text-2xl font-bold text-glow">{automationStats.avgEngagement}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect neon-border animate-float">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Schedules</p>
                <p className="text-2xl font-bold text-glow">{schedules.filter((s) => s.enabled).length}</p>
              </div>
              <Timer className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 glass-effect neon-border">
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="glass-effect neon-border animate-float">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Switch checked={schedule.enabled} onCheckedChange={() => toggleSchedule(schedule.id)} />
                    <div>
                      <CardTitle className="text-lg">{schedule.name}</CardTitle>
                      <CardDescription>
                        {schedule.platforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ")} •
                        {schedule.times.join(", ")} • {schedule.tone}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={schedule.enabled ? "default" : "secondary"}>
                      {schedule.enabled ? "Active" : "Paused"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerScheduleNow(schedule.id)}
                      className="neon-border bg-transparent"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSchedule(schedule)}
                      className="neon-border bg-transparent"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSchedule(schedule.id)}
                      className="neon-border bg-transparent text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Topic</Label>
                    <p className="text-sm text-muted-foreground">{schedule.topic}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Next Run</Label>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm">{formatTimeUntil(schedule.nextRun)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Performance</Label>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm">{schedule.postsGenerated} posts</span>
                      <span className="text-sm text-green-400">{schedule.successRate}% success</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Time until next post</span>
                    <span className="text-sm font-medium">{formatTimeUntil(schedule.nextRun)}</span>
                  </div>
                  <Progress
                    value={Math.max(0, 100 - ((schedule.nextRun - new Date()) / (24 * 60 * 60 * 1000)) * 100)}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {schedules.length === 0 && (
            <Card className="glass-effect neon-border animate-float">
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Schedules Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first automation schedule to start generating content automatically
                </p>
                <Button onClick={() => setShowScheduleForm(true)} className="neon-border">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Schedule
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card className="glass-effect neon-border animate-float">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Live updates from your automation processes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const StatusIcon = getStatusIcon(activity.status)
                  const ActivityIcon = getActivityIcon(activity.type)
                  const PlatformIcon = activity.platform ? getPlatformIcon(activity.platform.toLowerCase()) : null

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 rounded-lg bg-muted/20 neon-border"
                    >
                      <div className="flex-shrink-0">
                        <ActivityIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{activity.schedule}</span>
                          {PlatformIcon && <PlatformIcon className="w-4 h-4" />}
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(activity.status)}`} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{activity.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp.toLocaleTimeString()}
                          </span>
                          {activity.engagement && (
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              <span>{activity.engagement.likes} likes</span>
                              <span>{activity.engagement.comments} comments</span>
                              <span>{activity.engagement.shares} shares</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-effect neon-border animate-float">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Generation</span>
                    <span className="text-sm font-medium">98% success</span>
                  </div>
                  <Progress value={98} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Image Generation</span>
                    <span className="text-sm font-medium">85% success</span>
                  </div>
                  <Progress value={85} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Post Publishing</span>
                    <span className="text-sm font-medium">92% success</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect neon-border animate-float">
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { platform: "Facebook", posts: 18, color: "bg-blue-500" },
                    { platform: "Instagram", posts: 12, color: "bg-pink-500" },
                    { platform: "LinkedIn", posts: 10, color: "bg-blue-700" },
                    { platform: "Twitter", posts: 7, color: "bg-sky-500" },
                  ].map((item) => (
                    <div key={item.platform} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm flex-1">{item.platform}</span>
                      <span className="text-sm font-medium">{item.posts} posts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Schedule Modal */}
      {showScheduleForm && (
        <Card className="glass-effect neon-border animate-float">
          <CardHeader>
            <CardTitle>Create New Schedule</CardTitle>
            <CardDescription>Set up automated content generation and posting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Schedule Name</Label>
                <Input
                  placeholder="e.g., Morning Tech Updates"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  className="neon-border bg-transparent"
                />
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select
                  value={newSchedule.tone}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, tone: value })}
                >
                  <SelectTrigger className="neon-border bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="engaging">Engaging</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Topic</Label>
              <Input
                placeholder="What should this schedule post about?"
                value={newSchedule.topic}
                onChange={(e) => setNewSchedule({ ...newSchedule, topic: e.target.value })}
                className="neon-border bg-transparent"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setShowScheduleForm(false)}
                className="neon-border bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={addSchedule}
                disabled={!newSchedule.name || !newSchedule.topic}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Create Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
