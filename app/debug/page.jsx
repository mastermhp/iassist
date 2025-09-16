"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Play, AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

export default function DebugPage() {
  const [automationData, setAutomationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAutomationData = async () => {
    try {
      const response = await fetch("/api/automation")
      const data = await response.json()
      setAutomationData(data)
    } catch (error) {
      console.error("Failed to fetch automation data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const triggerCronJob = async () => {
    try {
      setRefreshing(true)
      console.log("[v0] Manually triggering cron job...")

      const response = await fetch("/api/cron/automation", {
        method: "POST",
      })

      const result = await response.json()
      console.log("[v0] Cron job result:", result)

      // Refresh data after triggering
      setTimeout(fetchAutomationData, 2000)
    } catch (error) {
      console.error("[v0] Failed to trigger cron job:", error)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAutomationData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAutomationData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getLogIcon = (level) => {
    switch (level) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getLogColor = (level) => {
    switch (level) {
      case "success":
        return "text-green-600 bg-green-50"
      case "error":
        return "text-red-600 bg-red-50"
      case "warning":
        return "text-yellow-600 bg-yellow-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading debug data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Debug Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring of your automation system</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAutomationData} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={triggerCronJob} disabled={refreshing}>
            <Play className="h-4 w-4 mr-2" />
            Test Cron Job
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Automation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={automationData?.isActive ? "default" : "secondary"}>
              {automationData?.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automationData?.stats?.totalPosts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {automationData?.stats?.totalPosts > 0
                ? Math.round((automationData.stats.successfulPosts / automationData.stats.totalPosts) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {automationData?.lastRun ? new Date(automationData.lastRun).toLocaleString() : "Never"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Schedules */}
      <Card>
        <CardHeader>
          <CardTitle>Active Schedules</CardTitle>
          <CardDescription>Current automation schedules and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {automationData?.schedules?.length > 0 ? (
            <div className="space-y-4">
              {automationData.schedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={schedule.enabled ? "default" : "secondary"}>Schedule {schedule.id}</Badge>
                      <span className="text-sm text-muted-foreground">{schedule.times.join(", ")}</span>
                    </div>
                    <Badge variant="outline">{schedule.platforms.join(", ")}</Badge>
                  </div>
                  <p className="text-sm">{schedule.topic}</p>
                  <p className="text-xs text-muted-foreground mt-1">Tone: {schedule.tone}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No schedules configured</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
          <CardDescription>Latest posts generated by automation</CardDescription>
        </CardHeader>
        <CardContent>
          {automationData?.recentPosts?.length > 0 ? (
            <div className="space-y-4">
              {automationData.recentPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{post.platform}</Badge>
                    <div className="flex items-center gap-2">
                      {post.isTest && <Badge variant="secondary">Test</Badge>}
                      {post.isManual && <Badge variant="secondary">Manual</Badge>}
                      <span className="text-xs text-muted-foreground">{new Date(post.time).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{post.content.substring(0, 200)}...</p>
                  <Badge variant={post.status === "published" ? "default" : "destructive"}>{post.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent posts</p>
          )}
        </CardContent>
      </Card>

      {/* Live Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Live Automation Logs</CardTitle>
          <CardDescription>Real-time logs from the automation system</CardDescription>
        </CardHeader>
        <CardContent>
          {automationData?.logs?.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {automationData.logs.map((log) => (
                <div key={log.id} className={`p-3 rounded-lg ${getLogColor(log.level)}`}>
                  <div className="flex items-start gap-2">
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{log.message}</p>
                        <span className="text-xs opacity-75">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {log.data && (
                        <pre className="text-xs mt-1 opacity-75 overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No logs available</p>
          )}
        </CardContent>
      </Card>

      {/* Current Time Check */}
      <Card>
        <CardHeader>
          <CardTitle>Time Debug Info</CardTitle>
          <CardDescription>Current time and schedule matching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Current Time:</strong> {new Date().toLocaleString()}
            </p>
            <p>
              <strong>Current Hour:Minute:</strong> {new Date().getHours()}:
              {new Date().getMinutes().toString().padStart(2, "0")}
            </p>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h4 className="font-medium">Schedule Time Matches:</h4>
              {automationData?.schedules?.map((schedule) => (
                <div key={schedule.id} className="text-sm">
                  <strong>Schedule {schedule.id}:</strong> {schedule.times.join(", ")}
                  {schedule.enabled ? " (Enabled)" : " (Disabled)"}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
