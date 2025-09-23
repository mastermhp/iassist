"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  Sparkles,
  Copy,
  Share,
  RefreshCw,
  ImageIcon,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AIContentGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [formData, setFormData] = useState({
    platform: "instagram",
    topic: "",
    tone: "engaging",
    contentType: "post",
    includeHashtags: true,
  })
  const { toast } = useToast()

  const platforms = [
    { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
    { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-500" },
    { value: "twitter", label: "Twitter", icon: Twitter, color: "text-sky-500" },
    { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  ]

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "engaging", label: "Engaging" },
    { value: "humorous", label: "Humorous" },
    { value: "inspirational", label: "Inspirational" },
  ]

  const contentTypes = [
    { value: "post", label: "Text Post" },
    { value: "image-post", label: "Image Post" },
    { value: "story", label: "Story" },
    { value: "announcement", label: "Announcement" },
  ]

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your post",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          generateImage: formData.contentType === "image-post" || formData.platform === "instagram",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content")
      }

      setGeneratedContent(data)
      toast({
        title: "Content Generated!",
        description: "Your AI-powered content is ready",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const selectedPlatform = platforms.find((p) => p.value === formData.platform)

  return (
    <div className="space-y-6">
      {/* Content Generation Form */}
      <Card className="glass-effect neon-border animate-float">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-glow">
            <Bot className="w-5 h-5 text-primary animate-pulse-neon" />
            <span>AI Content Generator</span>
          </CardTitle>
          <CardDescription>Create engaging social media content with advanced AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <Button
                  key={platform.value}
                  variant={formData.platform === platform.value ? "default" : "outline"}
                  className={`h-16 flex-col space-y-2 neon-border ${
                    formData.platform === platform.value ? "animate-glow" : ""
                  }`}
                  onClick={() => setFormData({ ...formData, platform: platform.value })}
                >
                  <platform.icon className={`w-5 h-5 ${platform.color}`} />
                  <span className="text-xs">{platform.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic/Theme</Label>
              <Input
                id="topic"
                placeholder="e.g., AI technology, business growth, product launch..."
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="neon-border bg-transparent"
              />
            </div>

            {/* Tone Selection */}
            <div className="space-y-2">
              <Label>Tone</Label>
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

            {/* Content Type */}
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select
                value={formData.contentType}
                onValueChange={(value) => setFormData({ ...formData, contentType: value })}
              >
                <SelectTrigger className="neon-border bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Include Hashtags */}
            <div className="flex items-center space-x-2">
              <Switch
                id="hashtags"
                checked={formData.includeHashtags}
                onCheckedChange={(checked) => setFormData({ ...formData, includeHashtags: checked })}
              />
              <Label htmlFor="hashtags">Include Hashtags</Label>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.topic.trim()}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 animate-glow"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content Display */}
      {generatedContent && (
        <Card className="glass-effect neon-border animate-float animate-glow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <selectedPlatform.icon className={`w-5 h-5 ${selectedPlatform.color}`} />
                <span>Generated Content</span>
              </div>
              <Badge variant="secondary" className="animate-pulse-neon">
                {selectedPlatform.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content Text */}
            <div className="space-y-2">
              <Label>Post Content</Label>
              <Textarea
                value={generatedContent.content}
                readOnly
                className="min-h-[120px] neon-border bg-muted/20 text-foreground"
              />
            </div>

            {/* Generated Image Preview (if available) */}
            {generatedContent.generatedImageUrl && (
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Generated Image</span>
                </Label>
                <div className="relative">
                  <img
                    src={generatedContent.generatedImageUrl || "/placeholder.svg"}
                    alt="Generated content image"
                    className="w-full h-80 object-cover rounded-lg neon-border"
                    onError={(e) => {
                      console.log("[v0] Image failed to load:", generatedContent.generatedImageUrl)
                      e.target.src = "/ry asks for an image based on the text image-not-found.png"
                    }}
                    onLoad={() => {
                      console.log("[v0] Image loaded successfully:", generatedContent.generatedImageUrl)
                    }}
                  />
                </div>
              </div>
            )}

            {/* Image Prompt (if available) */}
            {generatedContent.imagePrompt && (
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>AI Image Prompt</span>
                </Label>
                <Textarea
                  value={generatedContent.imagePrompt}
                  readOnly
                  className="min-h-[80px] neon-border bg-muted/20 text-foreground"
                />
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(generatedContent.content)}
                className="neon-border"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Content
              </Button>

              {generatedContent.imagePrompt && (
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(generatedContent.imagePrompt)}
                  className="neon-border"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Copy Image Prompt
                </Button>
              )}

              {generatedContent.generatedImageUrl && (
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(generatedContent.generatedImageUrl)}
                  className="neon-border"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Copy Image URL
                </Button>
              )}

              <Button variant="outline" onClick={handleGenerate} className="neon-border bg-transparent">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>

              <Button
                className="bg-gradient-to-r from-primary to-secondary"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    // Store the generated content in sessionStorage for cross-page access
                    sessionStorage.setItem(
                      "generatedContent",
                      JSON.stringify({
                        content: generatedContent.content,
                        imageUrl: generatedContent.generatedImageUrl || "",
                      }),
                    )

                    // Navigate to publish page
                    window.location.href = "/publish"
                  }
                }}
              >
                <Share className="w-4 h-4 mr-2" />
                Publish Now
              </Button>
            </div>

            {/* Generation Info */}
            <div className="text-xs text-muted-foreground">
              Generated on {new Date(generatedContent.generatedAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
