"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Clock, Play, Pause, Settings, Zap, RefreshCw } from "lucide-react"

export default function AutomationDashboard() {
  const [automationData, setAutomationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    times: ["09:00"],
    platforms: ["facebook"],
    topic: "",
    tone: "professional",
    enabled: true,
  })

  const fetchAutomationData = async () => {
    try {
      const response = await fetch("/api/automation")
      const data = await response.json()
      setAutomationData(data)
    } catch (error) {
      console.error("Failed to fetch automation data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAutomationData()
    const interval = setInterval(fetchAutomationData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const toggleAutomation = async () => {
    setIsUpdating(true)
    try {
      const action = automationData.isActive ? "stop" : "start"
      const response = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        await fetchAutomationData()
      }
    } catch (error) {
      console.error("Failed to toggle automation:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const triggerManualPost = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quick-test",
        }),
      })

      const result = await response.json()
      if (response.ok) {
        alert("Manual post triggered successfully! Check your Facebook page.")
        await fetchAutomationData()
      } else {
        alert(`Failed to trigger post: ${result.error}`)
      }
    } catch (error) {
      console.error("Failed to trigger manual post:", error)
      alert("Failed to trigger manual post")
    } finally {
      setIsUpdating(false)
    }
  }

  const forceAutomationRun = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run-automation",
        }),
      })

      const result = await response.json()
      if (response.ok) {
        alert(`Automation run completed! ${result.message}`)
        await fetchAutomationData()
      } else {
        alert(`Failed to run automation: ${result.error}`)
      }
    } catch (error) {
      console.error("Failed to run automation:", error)
      alert("Failed to run automation")
    } finally {
      setIsUpdating(false)
    }
  }

  const addSchedule = () => {
    const schedules = [
      ...(automationData?.schedules || []),
      {
        id: Date.now().toString(),
        ...newSchedule,
      },
    ]

    updateSchedules(schedules)
    setNewSchedule({
      times: ["09:00"],
      platforms: ["facebook"],
      topic: "",
      tone: "professional",
      enabled: true,
    })
  }

  const updateSchedules = async (schedules) => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-schedules",
          config: { schedules },
        }),
      })

      if (response.ok) {
        await fetchAutomationData()
      }
    } catch (error) {
      console.error("Failed to update schedules:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const removeSchedule = (scheduleId) => {
    const schedules = automationData.schedules.filter((s) => s.id !== scheduleId)
    updateSchedules(schedules)
  }

  const addTime = () => {
    setNewSchedule((prev) => ({
      ...prev,
      times: [...prev.times, "12:00"],
    }))
  }

  const updateTime = (index, time) => {
    setNewSchedule((prev) => ({
      ...prev,
      times: prev.times.map((t, i) => (i === index ? time : t)),
    }))
  }

  const removeTime = (index) => {
    setNewSchedule((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }))
  }

  const togglePlatform = (platform) => {
    setNewSchedule((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading automation dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Social Automation
                <Badge variant={automationData?.isActive ? "default" : "secondary"}>
                  {automationData?.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
              <CardDescription>The Future of Content Creation</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={triggerManualPost} disabled={isUpdating} variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Quick Test
              </Button>
              <Button
                onClick={forceAutomationRun}
                disabled={isUpdating || !automationData?.isActive}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Force Run
              </Button>
              <Button
                onClick={toggleAutomation}
                disabled={isUpdating}
                variant={automationData?.isActive ? "destructive" : "default"}
              >
                {automationData?.isActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Automation
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Automation
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Logs */}
      {automationData?.logs && automationData.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Real-time Automation Logs
            </CardTitle>
            <CardDescription>Live updates of automation activities and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {automationData.logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-start gap-2">
                    {log.level === "success" && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                    {log.level === "error" && <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                    {log.level === "info" && <Clock className="h-4 w-4 text-blue-500 mt-0.5" />}
                    {log.level === "warning" && <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium">{log.message}</p>
                      {log.data && (
                        <pre className="text-xs text-muted-foreground mt-1 bg-background p-2 rounded">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 dark:text-blue-400 font-medium text-sm">💡 Pro Tip:</div>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Use "Quick Test" to immediately generate and post content to see the entire automation process in
                  action. Perfect for testing your setup!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Posts Generated</p>
                <p className="text-2xl font-bold">{automationData?.stats?.totalPosts || 0}</p>
                <p className="text-xs text-green-600">+12%</p>
              </div>
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <div className="h-6 w-6 bg-red-500 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {automationData?.stats?.totalPosts > 0
                    ? Math.round((automationData.stats.successfulPosts / automationData.stats.totalPosts) * 100)
                    : 0}
                  %
                </p>
                <p className="text-xs text-green-600">+2.1%</p>
              </div>
              <div className="h-12 w-12 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
                <div className="h-6 w-6 bg-pink-500 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Schedules</p>
                <p className="text-2xl font-bold">{automationData?.schedules?.filter((s) => s.enabled).length || 0}</p>
                <p className="text-xs text-green-600">+18%</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <div className="h-6 w-6 bg-purple-500 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Post</p>
                <p className="text-2xl font-bold">
                  {automationData?.stats?.lastPostTime
                    ? new Date(automationData.stats.lastPostTime).toLocaleDateString()
                    : "Never"}
                </p>
                <p className="text-xs text-green-600">+24%</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <div className="h-6 w-6 bg-orange-500 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Settings
          </CardTitle>
          <CardDescription>Configure when and how AI generates content automatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Schedules */}
          {automationData?.schedules && automationData.schedules.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Schedules</h3>
              {automationData.schedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Schedule {schedule.id}</h4>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => triggerManualPost()} size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Trigger Now
                      </Button>
                      <Button onClick={() => removeSchedule(schedule.id)} size="sm" variant="destructive">
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Post Times:</span>
                      <p>{schedule.times?.join(", ") || "Not set"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Platforms:</span>
                      <div className="flex gap-1 mt-1">
                        {schedule.platforms?.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Topic:</span>
                      <p className="truncate">{schedule.topic || "AI-generated"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Tone:</span>
                      <p className="capitalize">{schedule.tone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Add New Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add New Schedule</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Post Times</Label>
                {newSchedule.times.map((time, index) => (
                  <div key={index} className="flex gap-2">
                    <Input type="time" value={time} onChange={(e) => updateTime(index, e.target.value)} />
                    {newSchedule.times.length > 1 && (
                      <Button onClick={() => removeTime(index)} size="sm" variant="outline">
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button onClick={addTime} size="sm" variant="outline">
                  + Add Time
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {["facebook", "instagram", "twitter", "linkedin"].map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Switch
                        checked={newSchedule.platforms.includes(platform)}
                        onCheckedChange={() => togglePlatform(platform)}
                      />
                      <Label className="capitalize">{platform}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Topic (Optional)</Label>
                <Textarea
                  placeholder="AI development and seeking co-founders for tech innovations"
                  value={newSchedule.topic}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, topic: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <Select
                  value={newSchedule.tone}
                  onValueChange={(value) => setNewSchedule((prev) => ({ ...prev, tone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="engaging">Engaging</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={addSchedule} disabled={isUpdating}>
              + Add Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
