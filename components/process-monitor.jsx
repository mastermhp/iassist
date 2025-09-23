"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Zap,
  Bot,
  ImageIcon,
  FileText,
  Send,
  Target,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Eye,
  Play,
  Pause,
} from "lucide-react"

export default function ProcessMonitor() {
  const [processes, setProcesses] = useState([])
  const [systemStats, setSystemStats] = useState({
    totalProcesses: 0,
    activeProcesses: 0,
    completedToday: 0,
    successRate: 0,
    avgProcessingTime: 0,
  })
  const [realTimeLogs, setRealTimeLogs] = useState([])
  const [isMonitoring, setIsMonitoring] = useState(true)

  useEffect(() => {
    // Initialize with sample data
    initializeSampleData()

    // Set up real-time monitoring
    const interval = setInterval(() => {
      if (isMonitoring) {
        updateProcesses()
        addRandomLog()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const initializeSampleData = () => {
    const sampleProcesses = [
      {
        id: 1,
        type: "content_generation",
        name: "Morning Tech Updates",
        status: "running",
        progress: 65,
        startTime: new Date(Date.now() - 2 * 60 * 1000),
        steps: [
          { name: "Topic Analysis", status: "completed", duration: 15 },
          { name: "Content Generation", status: "running", duration: null },
          { name: "Image Generation", status: "pending", duration: null },
          { name: "Post Publishing", status: "pending", duration: null },
        ],
        platform: "Facebook",
        schedule: "Morning Tech Updates",
      },
      {
        id: 2,
        type: "image_generation",
        name: "Instagram Visual Content",
        status: "completed",
        progress: 100,
        startTime: new Date(Date.now() - 10 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 60 * 1000),
        steps: [
          { name: "Prompt Creation", status: "completed", duration: 8 },
          { name: "AI Image Generation", status: "completed", duration: 45 },
          { name: "Image Optimization", status: "completed", duration: 12 },
          { name: "Upload to Platform", status: "completed", duration: 20 },
        ],
        platform: "Instagram",
        schedule: "Evening Engagement",
      },
      {
        id: 3,
        type: "topic_generation",
        name: "Weekly Topic Suggestions",
        status: "pending",
        progress: 0,
        scheduledTime: new Date(Date.now() + 30 * 60 * 1000),
        steps: [
          { name: "Page Analysis", status: "pending", duration: null },
          { name: "Trend Research", status: "pending", duration: null },
          { name: "Topic Ranking", status: "pending", duration: null },
          { name: "Personalization", status: "pending", duration: null },
        ],
        platform: "All Platforms",
        schedule: "Weekly Analysis",
      },
    ]

    setProcesses(sampleProcesses)
    updateSystemStats(sampleProcesses)
  }

  const updateProcesses = () => {
    setProcesses((prev) =>
      prev.map((process) => {
        if (process.status === "running" && process.progress < 100) {
          const newProgress = Math.min(100, process.progress + Math.random() * 15)
          const updatedSteps = process.steps.map((step) => {
            if (step.status === "running" && Math.random() > 0.7) {
              return { ...step, status: "completed", duration: Math.floor(Math.random() * 60) + 10 }
            }
            if (step.status === "pending" && process.progress > 50 && Math.random() > 0.8) {
              return { ...step, status: "running" }
            }
            return step
          })

          if (newProgress >= 100) {
            return {
              ...process,
              status: "completed",
              progress: 100,
              endTime: new Date(),
              steps: updatedSteps.map((step) => ({
                ...step,
                status: step.status === "pending" ? "completed" : step.status,
                duration: step.duration || Math.floor(Math.random() * 30) + 5,
              })),
            }
          }

          return { ...process, progress: newProgress, steps: updatedSteps }
        }
        return process
      }),
    )
  }

  const updateSystemStats = (processData) => {
    const total = processData.length
    const active = processData.filter((p) => p.status === "running").length
    const completed = processData.filter((p) => p.status === "completed").length
    const success = processData.filter((p) => p.status === "completed" && !p.error).length

    setSystemStats({
      totalProcesses: total,
      activeProcesses: active,
      completedToday: completed,
      successRate: total > 0 ? Math.round((success / total) * 100) : 0,
      avgProcessingTime: 127, // seconds
    })
  }

  const addRandomLog = () => {
    const logTypes = [
      { type: "info", message: "Content generation started for Morning Tech Updates", icon: Bot },
      { type: "success", message: "Image successfully generated and optimized", icon: ImageIcon },
      { type: "warning", message: "API rate limit approaching for Facebook", icon: AlertCircle },
      { type: "error", message: "Failed to connect to Instagram API", icon: XCircle },
      { type: "info", message: "Topic analysis completed with 15 suggestions", icon: Target },
      { type: "success", message: "Post published successfully to LinkedIn", icon: Send },
    ]

    if (Math.random() > 0.7) {
      // 30% chance to add a log
      const randomLog = logTypes[Math.floor(Math.random() * logTypes.length)]
      const newLog = {
        id: Date.now(),
        timestamp: new Date(),
        ...randomLog,
      }

      setRealTimeLogs((prev) => [newLog, ...prev.slice(0, 49)]) // Keep last 50 logs
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return CheckCircle
      case "running":
        return Activity
      case "error":
        return XCircle
      case "pending":
        return Clock
      default:
        return AlertCircle
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-500"
      case "running":
        return "text-blue-500"
      case "error":
        return "text-red-500"
      case "pending":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  const getProcessIcon = (type) => {
    switch (type) {
      case "content_generation":
        return FileText
      case "image_generation":
        return ImageIcon
      case "topic_generation":
        return Target
      default:
        return Bot
    }
  }

  const getLogIcon = (type) => {
    switch (type) {
      case "success":
        return CheckCircle
      case "error":
        return XCircle
      case "warning":
        return AlertCircle
      default:
        return Activity
    }
  }

  const getLogColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-500"
      case "error":
        return "text-red-500"
      case "warning":
        return "text-yellow-500"
      default:
        return "text-blue-500"
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return "..."
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="glass-effect neon-border animate-float">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-glow">
                <Activity className="w-6 h-6 text-primary animate-pulse-neon" />
                <span>Process Monitor</span>
                <Badge variant={isMonitoring ? "default" : "secondary"} className="animate-pulse-neon">
                  <Zap className="w-3 h-3 mr-1" />
                  {isMonitoring ? "Live" : "Paused"}
                </Badge>
              </CardTitle>
              <CardDescription>Real-time monitoring of all automation processes and system activities</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="neon-border bg-transparent"
              >
                {isMonitoring ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isMonitoring ? "Pause" : "Resume"} Monitoring
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRealTimeLogs([])
                  initializeSampleData()
                }}
                className="neon-border bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-effect neon-border animate-float">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Processes</p>
                <p className="text-2xl font-bold text-glow">{systemStats.totalProcesses}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect neon-border animate-float">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Now</p>
                <p className="text-2xl font-bold text-glow">{systemStats.activeProcesses}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect neon-border animate-float">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-glow">{systemStats.completedToday}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect neon-border animate-float">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-glow">{systemStats.successRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect neon-border animate-float">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold text-glow">{formatDuration(systemStats.avgProcessingTime)}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="processes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 glass-effect neon-border">
          <TabsTrigger value="processes">Active Processes</TabsTrigger>
          <TabsTrigger value="logs">Real-time Logs</TabsTrigger>
          <TabsTrigger value="analytics">Process Analytics</TabsTrigger>
        </TabsList>

        {/* Active Processes Tab */}
        <TabsContent value="processes" className="space-y-4">
          {processes.map((process) => {
            const StatusIcon = getStatusIcon(process.status)
            const ProcessIcon = getProcessIcon(process.type)

            return (
              <Card key={process.id} className="glass-effect neon-border animate-float">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ProcessIcon className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{process.name}</CardTitle>
                        <CardDescription>
                          {process.platform} • {process.schedule}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={process.status === "completed" ? "default" : "secondary"}>
                        <StatusIcon className={`w-3 h-3 mr-1 ${getStatusColor(process.status)}`} />
                        {process.status}
                      </Badge>
                      {process.status === "running" && (
                        <span className="text-sm text-muted-foreground">
                          {Math.floor((new Date() - process.startTime) / 1000)}s elapsed
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{process.progress}%</span>
                      </div>
                      <Progress value={process.progress} className="h-2" />
                    </div>

                    {/* Process Steps */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Process Steps</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {process.steps.map((step, index) => {
                          const StepIcon = getStatusIcon(step.status)
                          return (
                            <div
                              key={index}
                              className={`p-3 rounded-lg border transition-all ${
                                step.status === "completed"
                                  ? "border-green-500/50 bg-green-500/10"
                                  : step.status === "running"
                                    ? "border-blue-500/50 bg-blue-500/10 animate-pulse"
                                    : "border-border bg-muted/20"
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <StepIcon className={`w-4 h-4 ${getStatusColor(step.status)}`} />
                                <span className="text-sm font-medium">{step.name}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {step.duration
                                  ? formatDuration(step.duration)
                                  : step.status === "running"
                                    ? "In progress..."
                                    : "Waiting..."}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Timing Information */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Started: {process.startTime ? process.startTime.toLocaleTimeString() : "Not started"}</span>
                      {process.endTime && <span>Completed: {process.endTime.toLocaleTimeString()}</span>}
                      {process.scheduledTime && process.status === "pending" && (
                        <span>Scheduled: {process.scheduledTime.toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {processes.length === 0 && (
            <Card className="glass-effect neon-border animate-float">
              <CardContent className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Active Processes</h3>
                <p className="text-muted-foreground">Processes will appear here when automation is running</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Real-time Logs Tab */}
        <TabsContent value="logs">
          <Card className="glass-effect neon-border animate-float">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-primary" />
                <span>Real-time System Logs</span>
                <Badge variant="outline" className="animate-pulse">
                  Live
                </Badge>
              </CardTitle>
              <CardDescription>Live stream of all system activities and process updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {realTimeLogs.map((log) => {
                    const LogIcon = getLogIcon(log.type)
                    return (
                      <div
                        key={log.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 ${
                          log.type === "success"
                            ? "border-green-500 bg-green-500/10"
                            : log.type === "error"
                              ? "border-red-500 bg-red-500/10"
                              : log.type === "warning"
                                ? "border-yellow-500 bg-yellow-500/10"
                                : "border-blue-500 bg-blue-500/10"
                        }`}
                      >
                        <LogIcon className={`w-4 h-4 mt-0.5 ${getLogColor(log.type)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{log.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.timestamp ? log.timestamp.toLocaleTimeString() : "Unknown time"}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  {realTimeLogs.length === 0 && (
                    <div className="text-center py-8">
                      <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No logs yet. System activities will appear here.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-effect neon-border animate-float">
              <CardHeader>
                <CardTitle>Process Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Generation</span>
                    <span className="text-sm font-medium">95% success</span>
                  </div>
                  <Progress value={95} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Image Generation</span>
                    <span className="text-sm font-medium">87% success</span>
                  </div>
                  <Progress value={87} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Topic Generation</span>
                    <span className="text-sm font-medium">98% success</span>
                  </div>
                  <Progress value={98} className="h-2" />

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
                <CardTitle>Average Processing Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { process: "Content Generation", time: "45s", color: "bg-blue-500" },
                    { process: "Image Generation", time: "2m 15s", color: "bg-green-500" },
                    { process: "Topic Analysis", time: "1m 30s", color: "bg-purple-500" },
                    { process: "Post Publishing", time: "20s", color: "bg-orange-500" },
                  ].map((item) => (
                    <div key={item.process} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm flex-1">{item.process}</span>
                      <span className="text-sm font-medium">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
