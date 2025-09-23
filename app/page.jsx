"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { History } from "lucide-react" // Import History icon
import { Bot, Zap, Play, Pause, Plus, Eye, Settings, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const [isAutomationActive, setIsAutomationActive] = useState(false)
  const [floatingElements, setFloatingElements] = useState([])
  const [automationConfig, setAutomationConfig] = useState({
    schedules: [
      {
        id: 1,
        times: ["09:00", "18:00"],
        platforms: ["facebook"],
        topic: "AI development and seeking co-founders for tech innovations",
        tone: "professional",
        enabled: true,
      },
    ],
  })
  const [showAutomationSettings, setShowAutomationSettings] = useState(false)
  const [automationStats, setAutomationStats] = useState({
    totalPosts: 0,
    successfulPosts: 0,
    failedPosts: 0,
    lastPostTime: null,
  })
  const [recentPosts, setRecentPosts] = useState([])
  const [nextPostTime, setNextPostTime] = useState(null)
  const [automationLogs, setAutomationLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)
  const [isQuickTesting, setIsQuickTesting] = useState(false)
  const [testCountdown, setTestCountdown] = useState(null)
  const { toast } = useToast()

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

    loadAutomationStatus()

    const interval = setInterval(loadAutomationStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isAutomationActive && automationConfig.schedules.length > 0) {
      calculateNextPostTime()
    }
  }, [isAutomationActive, automationConfig])

  const calculateNextPostTime = () => {
    const now = new Date()
    let nextTime = null

    for (const schedule of automationConfig.schedules) {
      if (!schedule.enabled) continue

      for (const time of schedule.times) {
        const [hour, minute] = time.split(":").map(Number)
        const scheduledTime = new Date()
        scheduledTime.setHours(hour, minute, 0, 0)

        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1)
        }

        if (!nextTime || scheduledTime < nextTime) {
          nextTime = scheduledTime
        }
      }
    }

    setNextPostTime(nextTime)
  }

  const loadAutomationStatus = async () => {
    try {
      const response = await fetch("/api/automation")
      if (response.ok) {
        const data = await response.json()
        setIsAutomationActive(data.isActive)
        if (data.schedules && data.schedules.length > 0) {
          setAutomationConfig({ schedules: data.schedules })
        }
        if (data.stats) {
          setAutomationStats(data.stats)
        }
        if (data.recentPosts) {
          setRecentPosts(data.recentPosts)
        }
        if (data.logs) {
          setAutomationLogs(data.logs)
        }
      }
    } catch (error) {
      console.log("[v0] Error loading automation status:", error)
    }
  }

  const runQuickTest = async () => {
    if (automationConfig.schedules.length === 0) {
      toast({
        title: "No Schedules",
        description: "Please configure at least one schedule before testing",
        variant: "destructive",
      })
      return
    }

    setIsQuickTesting(true)
    setTestCountdown(120) // 2 minutes

    // Start countdown
    const countdownInterval = setInterval(() => {
      setTestCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          return null
        }
        return prev - 1
      })
    }, 1000)

    try {
      const response = await fetch("/api/automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "quick-test",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Quick Test Successful!",
          description: "Content generated and posted successfully",
        })
        loadAutomationStatus()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }
    } catch (error) {
      toast({
        title: "Quick Test Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsQuickTesting(false)
      clearInterval(countdownInterval)
      setTestCountdown(null)
    }
  }

  const triggerSchedule = async (scheduleId) => {
    try {
      const response = await fetch("/api/automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "manual-trigger",
          config: { scheduleId },
        }),
      })

      if (response.ok) {
        toast({
          title: "Manual Trigger Successful!",
          description: "Content generated and posted successfully",
        })
        loadAutomationStatus()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }
    } catch (error) {
      toast({
        title: "Manual Trigger Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const toggleAutomation = async () => {
    try {
      const action = isAutomationActive ? "stop" : "start"
      const response = await fetch("/api/automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          config: automationConfig,
        }),
      })

      if (response.ok) {
        setIsAutomationActive(!isAutomationActive)
        toast({
          title: isAutomationActive ? "Automation Stopped" : "Automation Started",
          description: isAutomationActive
            ? "Automated content generation has been paused"
            : "AI will now generate and post content automatically",
        })
      } else {
        throw new Error("Failed to toggle automation")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const saveAutomationConfig = async () => {
    try {
      const response = await fetch("/api/automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update-schedules",
          config: automationConfig,
        }),
      })

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Automation configuration has been updated",
        })
        setShowAutomationSettings(false)
      } else {
        throw new Error("Failed to save configuration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const updateSchedule = (scheduleId, field, value) => {
    setAutomationConfig((prev) => ({
      ...prev,
      schedules: prev.schedules.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, [field]: value } : schedule,
      ),
    }))
  }

  const addSchedule = () => {
    const newSchedule = {
      id: Date.now(),
      times: ["09:00"],
      platforms: ["facebook"],
      topic: "AI development and seeking co-founders for tech innovations",
      tone: "professional",
      enabled: true,
    }
    setAutomationConfig((prev) => ({
      ...prev,
      schedules: [...prev.schedules, newSchedule],
    }))
  }

  const removeSchedule = (scheduleId) => {
    setAutomationConfig((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((schedule) => schedule.id !== scheduleId),
    }))
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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

      <div className="relative z-10">
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
                <Button variant="outline" onClick={() => (window.location.href = "/debug")} className="neon-border">
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="text-white">Debug</span>
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/history")} className="neon-border">
                  <History className="w-4 h-4 mr-2" />
                  <span className="text-white">History</span>
                </Button>
                <Button variant="outline" onClick={() => setShowLogs(!showLogs)} className="neon-border">
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="text-white">Logs</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={runQuickTest}
                  disabled={isQuickTesting}
                  className="neon-border bg-transparent"
                >
                  <Play className="w-4 h-4 mr-2" />
                  <span className="text-white">{isQuickTesting ? `Testing... ${testCountdown}s` : "Quick Test"}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAutomationSettings(!showAutomationSettings)}
                  className="neon-border"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="text-white">Settings</span>
                </Button>
                <Button
                  onClick={toggleAutomation}
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

        <main className="container mx-auto px-6 py-8">
          {showLogs && (
            <Card className="mb-8 glass-effect neon-border animate-float">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-glow">
                  <Eye className="w-5 h-5 text-primary" />
                  <span>Real-time Automation Logs</span>
                </CardTitle>
                <CardDescription>Live updates of automation activities and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {automationLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No logs yet. Start automation to see activity.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Use the "Quick Test" button to generate a test post and see logs in action!
                      </p>
                    </div>
                  ) : (
                    automationLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          log.level === "success"
                            ? "border-green-500 bg-green-500/10"
                            : log.level === "error"
                              ? "border-red-500 bg-red-500/10"
                              : log.level === "warning"
                                ? "border-yellow-500 bg-yellow-500/10"
                                : "border-blue-500 bg-blue-500/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{log.message}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {log.data && (
                          <pre className="text-xs text-muted-foreground mt-2 overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 font-medium">💡 Pro Tip:</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use "Quick Test" to immediately generate and post content to see the entire automation process in
                    action. Perfect for testing your setup!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {showAutomationSettings && (
            <Card className="mb-8 glass-effect neon-border animate-float">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-glow">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>Automation Settings</span>
                </CardTitle>
                <CardDescription>Configure when and how AI generates content automatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {automationConfig.schedules.map((schedule, index) => (
                  <div key={schedule.id} className="p-4 rounded-lg bg-muted/20 neon-border space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">Schedule {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerSchedule(schedule.id)}
                          className="text-green-400 border-green-400 hover:bg-green-400/10"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Trigger Now
                        </Button>
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={(checked) => updateSchedule(schedule.id, "enabled", checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSchedule(schedule.id)}
                          className="text-red-400 border-red-400 hover:bg-red-400/10"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Post Times</Label>
                        <div className="space-y-2">
                          {schedule.times.map((time, timeIndex) => (
                            <div key={timeIndex} className="flex items-center space-x-2">
                              <Input
                                type="time"
                                value={time}
                                onChange={(e) => {
                                  const newTimes = [...schedule.times]
                                  newTimes[timeIndex] = e.target.value
                                  updateSchedule(schedule.id, "times", newTimes)
                                }}
                                className="neon-border bg-transparent"
                              />
                              {schedule.times.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newTimes = schedule.times.filter((_, i) => i !== timeIndex)
                                    updateSchedule(schedule.id, "times", newTimes)
                                  }}
                                  className="text-red-400"
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newTimes = [...schedule.times, "12:00"]
                              updateSchedule(schedule.id, "times", newTimes)
                            }}
                            className="w-full neon-border"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Time
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Platforms</Label>
                        <div className="space-y-2">
                          {["facebook", "instagram", "twitter", "linkedin"].map((platform) => (
                            <div key={platform} className="flex items-center space-x-2">
                              <Switch
                                checked={schedule.platforms.includes(platform)}
                                onCheckedChange={(checked) => {
                                  const newPlatforms = checked
                                    ? [...schedule.platforms, platform]
                                    : schedule.platforms.filter((p) => p !== platform)
                                  updateSchedule(schedule.id, "platforms", newPlatforms)
                                }}
                              />
                              <span className="text-sm text-white capitalize">{platform}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Topic</Label>
                        <Input
                          value={schedule.topic}
                          onChange={(e) => updateSchedule(schedule.id, "topic", e.target.value)}
                          placeholder="e.g., AI technology, business tips"
                          className="neon-border bg-transparent"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tone</Label>
                        <Select
                          value={schedule.tone}
                          onValueChange={(value) => updateSchedule(schedule.id, "tone", value)}
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
                  </div>
                ))}

                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" onClick={addSchedule} className="neon-border bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Schedule
                  </Button>
                  <Button onClick={saveAutomationConfig} className="bg-gradient-to-r from-primary to-secondary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auto Post Dashboard */}
          <AutoPostDashboard />

          {/* Process Monitor */}
          <div className="mt-8">
            <ProcessMonitor />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="glass-effect neon-border animate-float">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-glow">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>AI Content Generator</span>
                  </CardTitle>
                  <CardDescription>Generate engaging posts about your expertise automatically</CardDescription>
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
                        onClick={() => (window.location.href = "/generate")}
                      >
                        <platform.icon className="w-6 h-6 text-white" />
                        <span className="text-xs platform-text">{platform.name}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isAutomationActive ? "Next automated post in:" : "Automation paused"}
                      </span>
                      <Badge variant="outline" className="animate-pulse-neon">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="text-white">
                          {isAutomationActive && nextPostTime
                            ? `${Math.ceil((nextPostTime - new Date()) / (1000 * 60))}m`
                            : "Paused"}
                        </span>
                      </Badge>
                    </div>
                    <Progress
                      value={
                        isAutomationActive && nextPostTime
                          ? Math.max(0, 100 - ((nextPostTime - new Date()) / (1000 * 60 * 60)) * 100)
                          : 0
                      }
                      className="h-2"
                    />

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${isAutomationActive ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                          />
                          <span className="text-sm text-white">
                            Automation {isAutomationActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isAutomationActive ? "AI is monitoring schedules" : "No automatic posting"}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${automationConfig.schedules.filter((s) => s.enabled).length > 0 ? "bg-blue-400" : "bg-gray-400"}`}
                          />
                          <span className="text-sm text-white">
                            {automationConfig.schedules.filter((s) => s.enabled).length} Active Schedules
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {automationConfig.schedules.filter((s) => s.enabled).length > 0
                            ? "Ready to post"
                            : "No schedules configured"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 animate-glow"
                    onClick={() => (window.location.href = "/generate")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="text-white">Generate New Post</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

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
        </main>
      </div>
    </div>
  )
}
