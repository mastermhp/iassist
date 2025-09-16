"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  ImageIcon,
  Calendar,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SocialMediaPoster({ initialContent = "", initialImageUrl = "" }) {
  const [content, setContent] = useState(initialContent)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [isPosting, setIsPosting] = useState(false)
  const [postResults, setPostResults] = useState({})
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    facebook: true,
    instagram: false,
    twitter: false,
    linkedin: false,
  })
  const [schedulePost, setSchedulePost] = useState(false)
  const [scheduledTime, setScheduledTime] = useState("")

  const { toast } = useToast()

  const platforms = [
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-500",
      requiresImage: false,
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "text-pink-500",
      requiresImage: true,
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: Twitter,
      color: "text-sky-500",
      requiresImage: false,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      color: "text-blue-700",
      requiresImage: false,
    },
  ]

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platformId]: !prev[platformId],
    }))
  }

  useEffect(() => {
    const handleOpenPublisher = (event) => {
      setContent(event.detail.content || "")
      setImageUrl(event.detail.imageUrl || "")
    }

    window.addEventListener("openPublisher", handleOpenPublisher)
    return () => window.removeEventListener("openPublisher", handleOpenPublisher)
  }, [])

  const postToSocialMedia = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to post",
        variant: "destructive",
      })
      return
    }

    const selectedPlatformsList = Object.entries(selectedPlatforms)
      .filter(([_, selected]) => selected)
      .map(([platform, _]) => platform)

    if (selectedPlatformsList.length === 0) {
      toast({
        title: "No Platforms Selected",
        description: "Please select at least one platform to post to",
        variant: "destructive",
      })
      return
    }

    setIsPosting(true)
    setPostResults({})

    try {
      const results = {}

      for (const platform of selectedPlatformsList) {
        try {
          console.log(`[v0] Posting to ${platform}...`)

          let requestBody
          const headers = {}

          if (platform === "facebook") {
            // Use FormData for Facebook API
            const formData = new FormData()
            formData.append("content", content)
            if (imageUrl && !imageUrl.includes("placeholder.svg")) {
              formData.append("imageUrl", imageUrl)
            }
            requestBody = formData
          } else {
            // Use JSON for other platforms
            headers["Content-Type"] = "application/json"
            requestBody = JSON.stringify({
              content,
              imageUrl: imageUrl || null,
            })
          }

          const response = await fetch(`/api/social/${platform}`, {
            method: "POST",
            headers,
            body: requestBody,
          })

          const data = await response.json()

          if (response.ok) {
            results[platform] = { success: true, data }
            console.log(`[v0] ${platform} post successful:`, data)
          } else {
            results[platform] = { success: false, error: data.error }
            console.log(`[v0] ${platform} post failed:`, data.error)
          }
        } catch (error) {
          results[platform] = { success: false, error: error.message }
          console.log(`[v0] ${platform} post error:`, error.message)
        }
      }

      setPostResults(results)

      const successCount = Object.values(results).filter((r) => r.success).length
      const totalCount = Object.keys(results).length

      if (successCount === totalCount) {
        toast({
          title: "Posts Published!",
          description: `Successfully posted to all ${successCount} platforms`,
        })
      } else if (successCount > 0) {
        toast({
          title: "Partial Success",
          description: `Posted to ${successCount} out of ${totalCount} platforms`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Posting Failed",
          description: "Failed to post to any platform. Check your API configuration.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Posting error:", error)
      toast({
        title: "Posting Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Content Input */}
      <Card className="glass-effect neon-border animate-float">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-glow">
            <Send className="w-5 h-5 text-primary animate-pulse-neon" />
            <span>Social Media Publisher</span>
          </CardTitle>
          <CardDescription>Post your content across multiple platforms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Textarea */}
          <div className="space-y-2">
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              placeholder="Enter your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] neon-border bg-transparent"
            />
            <div className="text-xs text-muted-foreground text-right">{content.length} characters</div>
          </div>

          {/* Image URL Input */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span>Image URL (Optional)</span>
            </Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="neon-border bg-transparent"
            />
          </div>

          {/* Platform Selection */}
          <div className="space-y-4">
            <Label>Select Platforms</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedPlatforms[platform.id]
                      ? "border-primary bg-primary/10 animate-glow"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handlePlatformToggle(platform.id)}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <platform.icon className={`w-6 h-6 ${platform.color}`} />
                    <span className="text-sm font-medium text-foreground">{platform.name}</span>
                    {platform.requiresImage && (
                      <Badge variant="outline" className="text-xs">
                        Requires Image
                      </Badge>
                    )}
                    <Switch
                      checked={selectedPlatforms[platform.id]}
                      onCheckedChange={() => handlePlatformToggle(platform.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduling Option */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="schedule" checked={schedulePost} onCheckedChange={setSchedulePost} />
              <Label htmlFor="schedule" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Schedule for later</span>
              </Label>
            </div>

            {schedulePost && (
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="neon-border bg-transparent"
              />
            )}
          </div>

          {/* Post Button */}
          <Button
            onClick={postToSocialMedia}
            disabled={isPosting || !content.trim()}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 animate-glow"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {schedulePost ? "Schedule Post" : "Publish Now"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Post Results */}
      {Object.keys(postResults).length > 0 && (
        <div className="mt-4 space-y-3">
          <Label>Publishing Results</Label>
          {Object.entries(postResults).map(([platform, result]) => {
            const platformInfo = platforms.find((p) => p.id === platform)
            return (
              <div key={platform} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 neon-border">
                <div className="flex items-center space-x-3">
                  <platformInfo.icon className={`w-5 h-5 ${platformInfo.color}`} />
                  <span className="font-medium text-foreground">{platformInfo.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {result.success ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <Badge variant="default">Success</Badge>
                      {result.data?.postId && (
                        <span className="text-xs text-muted-foreground">ID: {result.data.postId}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <Badge variant="destructive">Failed</Badge>
                      <span className="text-xs text-muted-foreground">{result.error}</span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
