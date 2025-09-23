"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  RefreshCw,
  Plus,
  TrendingUp,
  Target,
  Calendar,
  Lightbulb,
  BookOpen,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TopicGenerator() {
  const [topics, setTopics] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState([])
  const [generationSettings, setGenerationSettings] = useState({
    contentType: "business",
    userInterests: ["AI", "Technology", "Business"],
    brandVoice: "professional",
    pageId: "",
    accessToken: "",
  })
  const [savedTopics, setSavedTopics] = useState([])
  const [topicHistory, setTopicHistory] = useState([])

  const { toast } = useToast()

  useEffect(() => {
    // Load saved topics and settings from localStorage
    const saved = localStorage.getItem("ai-social-saved-topics")
    if (saved) {
      setSavedTopics(JSON.parse(saved))
    }

    const history = localStorage.getItem("ai-social-topic-history")
    if (history) {
      setTopicHistory(JSON.parse(history))
    }

    const settings = localStorage.getItem("ai-social-settings")
    if (settings) {
      const parsed = JSON.parse(settings)
      setGenerationSettings((prev) => ({
        ...prev,
        pageId: parsed.facebookPageId || "",
        accessToken: parsed.facebookAccessToken || "",
        brandVoice: parsed.brandVoice || "professional",
      }))
    }
  }, [])

  const generateTopics = async () => {
    setIsGenerating(true)
    try {
      console.log("[v0] Generating topics with settings:", generationSettings)

      const response = await fetch("/api/generate-topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generationSettings),
      })

      if (response.ok) {
        const data = await response.json()
        setTopics(data.topics)

        // Add to history
        const historyEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          settings: generationSettings,
          topicsCount: data.topics.length,
          pageAnalysis: data.pageAnalysis,
        }

        const newHistory = [historyEntry, ...topicHistory.slice(0, 9)] // Keep last 10
        setTopicHistory(newHistory)
        localStorage.setItem("ai-social-topic-history", JSON.stringify(newHistory))

        toast({
          title: "Topics Generated!",
          description: `Generated ${data.topics.length} personalized topic suggestions`,
        })
      } else {
        throw new Error("Failed to generate topics")
      }
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

  const saveTopic = (topic) => {
    const savedTopic = {
      ...topic,
      id: Date.now(),
      savedAt: new Date().toISOString(),
      used: false,
    }

    const newSaved = [savedTopic, ...savedTopics]
    setSavedTopics(newSaved)
    localStorage.setItem("ai-social-saved-topics", JSON.stringify(newSaved))

    toast({
      title: "Topic Saved",
      description: "Added to your saved topics collection",
    })
  }

  const toggleTopicSelection = (topicIndex) => {
    setSelectedTopics((prev) =>
      prev.includes(topicIndex) ? prev.filter((i) => i !== topicIndex) : [...prev, topicIndex],
    )
  }

  const createScheduleFromTopics = () => {
    const selected = selectedTopics.map((index) => topics[index])
    // This would integrate with the scheduling system
    toast({
      title: "Schedules Created",
      description: `Created ${selected.length} automation schedules from selected topics`,
    })
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "personalized":
        return Target
      case "trending":
        return TrendingUp
      case "seasonal":
        return Calendar
      default:
        return Lightbulb
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "personalized":
        return "text-blue-500"
      case "trending":
        return "text-green-500"
      case "seasonal":
        return "text-purple-500"
      default:
        return "text-yellow-500"
    }
  }

  const getRelevanceColor = (relevance) => {
    if (relevance >= 0.8) return "text-green-500"
    if (relevance >= 0.6) return "text-yellow-500"
    return "text-gray-500"
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect neon-border animate-float">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-glow">
            <Sparkles className="w-6 h-6 text-primary animate-pulse-neon" />
            <span>AI Topic Generator</span>
          </CardTitle>
          <CardDescription>
            Generate personalized content topics based on your page, audience, and trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select
                value={generationSettings.contentType}
                onValueChange={(value) => setGenerationSettings((prev) => ({ ...prev, contentType: value }))}
              >
                <SelectTrigger className="neon-border bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Your Interests</Label>
              <Input
                placeholder="AI, Technology, Business"
                value={generationSettings.userInterests.join(", ")}
                onChange={(e) =>
                  setGenerationSettings((prev) => ({
                    ...prev,
                    userInterests: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                className="neon-border bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label>Brand Voice</Label>
              <Select
                value={generationSettings.brandVoice}
                onValueChange={(value) => setGenerationSettings((prev) => ({ ...prev, brandVoice: value }))}
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

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              {generationSettings.pageId ? (
                <span className="text-green-400">✓ Connected to Facebook page for personalized suggestions</span>
              ) : (
                <span>Connect your Facebook page in settings for better personalization</span>
              )}
            </div>
            <Button
              onClick={generateTopics}
              disabled={isGenerating}
              className="bg-gradient-to-r from-primary to-secondary animate-glow"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? "Generating..." : "Generate Topics"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="generated" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 glass-effect neon-border">
          <TabsTrigger value="generated">Generated Topics</TabsTrigger>
          <TabsTrigger value="saved">Saved Topics</TabsTrigger>
          <TabsTrigger value="history">Generation History</TabsTrigger>
        </TabsList>

        <TabsContent value="generated">
          {topics.length > 0 && (
            <Card className="glass-effect neon-border animate-float mb-4">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedTopics.length} of {topics.length} topics selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTopics(topics.map((_, i) => i))}
                      className="neon-border bg-transparent"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTopics([])}
                      className="neon-border bg-transparent"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={createScheduleFromTopics}
                      disabled={selectedTopics.length === 0}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Schedules ({selectedTopics.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic, index) => {
              const CategoryIcon = getCategoryIcon(topic.category)
              const isSelected = selectedTopics.includes(index)

              return (
                <Card
                  key={index}
                  className={`glass-effect neon-border animate-float cursor-pointer transition-all ${
                    isSelected ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/20"
                  }`}
                  onClick={() => toggleTopicSelection(index)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className={`w-4 h-4 ${getCategoryColor(topic.category)}`} />
                        <Badge variant="outline" className="text-xs">
                          {topic.category}
                        </Badge>
                        {topic.relevance && (
                          <div className="flex items-center space-x-1">
                            <Star className={`w-3 h-3 ${getRelevanceColor(topic.relevance)}`} />
                            <span className="text-xs text-muted-foreground">{Math.round(topic.relevance * 100)}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            saveTopic(topic)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-base">{topic.topic}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-2">{topic.description}</p>
                    {topic.suggestedTone && (
                      <Badge variant="secondary" className="text-xs">
                        {topic.suggestedTone} tone
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {topics.length === 0 && (
            <Card className="glass-effect neon-border animate-float">
              <CardContent className="text-center py-12">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Topics Generated Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Generate Topics" to get personalized content suggestions based on your preferences
                </p>
                <Button onClick={generateTopics} className="neon-border">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Your First Topics
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedTopics.map((topic) => (
              <Card key={topic.id} className="glass-effect neon-border animate-float">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <Badge variant={topic.used ? "default" : "outline"} className="text-xs">
                        {topic.used ? "Used" : "Saved"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(topic.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base">{topic.topic}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {savedTopics.length === 0 && (
            <Card className="glass-effect neon-border animate-float">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Saved Topics</h3>
                <p className="text-muted-foreground">
                  Save interesting topics from the generated suggestions to use later
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            {topicHistory.map((entry) => (
              <Card key={entry.id} className="glass-effect neon-border animate-float">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{entry.topicsCount} topics generated</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Content Type:</span>
                      <p className="font-medium capitalize">{entry.settings.contentType}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Interests:</span>
                      <p className="font-medium">{entry.settings.userInterests.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Brand Voice:</span>
                      <p className="font-medium capitalize">{entry.settings.brandVoice}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Page Analysis:</span>
                      <p className="font-medium">{entry.pageAnalysis ? "✓ Connected" : "Not connected"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {topicHistory.length === 0 && (
            <Card className="glass-effect neon-border animate-float">
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Generation History</h3>
                <p className="text-muted-foreground">Your topic generation history will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
