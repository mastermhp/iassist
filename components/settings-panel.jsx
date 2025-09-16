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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Key,
  Bot,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Save,
  Eye,
  EyeOff,
  TestTube,
  CheckCircle,
  XCircle,
  Palette,
  Clock,
  Globe,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    // API Keys
    geminiApiKey: "",
    facebookPageId: "",
    facebookAccessToken: "",
    instagramAccountId: "",
    twitterApiKey: "",
    twitterApiSecret: "",
    twitterAccessToken: "",
    twitterAccessTokenSecret: "",
    linkedinPersonId: "",
    linkedinAccessToken: "",

    // AI Settings
    defaultTone: "engaging",
    defaultContentType: "post",
    includeHashtagsByDefault: true,
    maxPostLength: 280,

    // Automation Settings
    automationEnabled: false,
    postingFrequency: "daily",
    postingTimes: ["09:00", "15:00", "19:00"],
    defaultPlatforms: ["facebook", "instagram"],

    // Appearance
    theme: "dark",
    animations: true,
    notifications: true,

    // Content Preferences
    contentTopics: ["AI", "Technology", "Business", "Innovation"],
    avoidKeywords: ["politics", "controversial"],
    brandVoice: "professional yet approachable",
  })

  const [showApiKeys, setShowApiKeys] = useState({})
  const [testResults, setTestResults] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("ai-social-settings")
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) })
    }
  }, [])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage (in production, this would be saved to a database)
      localStorage.setItem("ai-social-settings", JSON.stringify(settings))

      toast({
        title: "Settings Saved",
        description: "Your configuration has been saved successfully",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const testApiConnection = async (platform) => {
    setTestResults({ ...testResults, [platform]: "testing" })

    try {
      // Mock API test - in production, this would make actual API calls
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const success = Math.random() > 0.3 // 70% success rate for demo
      setTestResults({ ...testResults, [platform]: success ? "success" : "error" })

      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success
          ? `${platform} API connection is working`
          : `Failed to connect to ${platform} API. Check your credentials.`,
        variant: success ? "default" : "destructive",
      })
    } catch (error) {
      setTestResults({ ...testResults, [platform]: "error" })
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const toggleApiKeyVisibility = (key) => {
    setShowApiKeys({ ...showApiKeys, [key]: !showApiKeys[key] })
  }

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

  const frequencies = [
    { value: "hourly", label: "Every Hour" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "custom", label: "Custom Schedule" },
  ]

  return (
    <div className="space-y-6">
      <Card className="glass-effect neon-border animate-float">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-glow">
            <Settings className="w-5 h-5 text-primary animate-pulse-neon" />
            <span>Settings & Configuration</span>
          </CardTitle>
          <CardDescription>Configure your AI social media automation system</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 glass-effect neon-border">
          <TabsTrigger value="api-keys" className="flex items-center space-x-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="ai-settings" className="flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Settings</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Automation</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api-keys">
          <div className="space-y-6">
            {/* Gemini AI API */}
            <Card className="glass-effect neon-border animate-float">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <span>Google Gemini AI</span>
                  <Badge variant="outline">Free</Badge>
                </CardTitle>
                <CardDescription>Required for AI content generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gemini-key">API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="gemini-key"
                      type={showApiKeys.gemini ? "text" : "password"}
                      placeholder="Enter your Gemini API key"
                      value={settings.geminiApiKey}
                      onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                      className="neon-border bg-transparent"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleApiKeyVisibility("gemini")}
                      className="neon-border bg-transparent"
                    >
                      {showApiKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => testApiConnection("gemini")}
                      className="neon-border bg-transparent"
                    >
                      {testResults.gemini === "testing" ? (
                        <TestTube className="w-4 h-4 animate-spin" />
                      ) : testResults.gemini === "success" ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : testResults.gemini === "error" ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <TestTube className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your free API key from{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Media APIs */}
            {platforms.map((platform) => (
              <Card key={platform.id} className="glass-effect neon-border animate-float">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <platform.icon className={`w-5 h-5 ${platform.color}`} />
                    <span>{platform.name}</span>
                  </CardTitle>
                  <CardDescription>Configure {platform.name} API credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {platform.id === "facebook" && (
                    <>
                      <div className="space-y-2">
                        <Label>Page ID</Label>
                        <Input
                          placeholder="Your Facebook Page ID"
                          value={settings.facebookPageId}
                          onChange={(e) => setSettings({ ...settings, facebookPageId: e.target.value })}
                          className="neon-border bg-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Access Token</Label>
                        <div className="flex space-x-2">
                          <Input
                            type={showApiKeys.facebook ? "text" : "password"}
                            placeholder="Page Access Token"
                            value={settings.facebookAccessToken}
                            onChange={(e) => setSettings({ ...settings, facebookAccessToken: e.target.value })}
                            className="neon-border bg-transparent"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleApiKeyVisibility("facebook")}
                            className="neon-border bg-transparent"
                          >
                            {showApiKeys.facebook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {platform.id === "instagram" && (
                    <div className="space-y-2">
                      <Label>Business Account ID</Label>
                      <Input
                        placeholder="Instagram Business Account ID"
                        value={settings.instagramAccountId}
                        onChange={(e) => setSettings({ ...settings, instagramAccountId: e.target.value })}
                        className="neon-border bg-transparent"
                      />
                    </div>
                  )}

                  {platform.id === "twitter" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <Input
                            type={showApiKeys.twitterKey ? "text" : "password"}
                            placeholder="Twitter API Key"
                            value={settings.twitterApiKey}
                            onChange={(e) => setSettings({ ...settings, twitterApiKey: e.target.value })}
                            className="neon-border bg-transparent"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>API Secret</Label>
                          <Input
                            type={showApiKeys.twitterSecret ? "text" : "password"}
                            placeholder="Twitter API Secret"
                            value={settings.twitterApiSecret}
                            onChange={(e) => setSettings({ ...settings, twitterApiSecret: e.target.value })}
                            className="neon-border bg-transparent"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {platform.id === "linkedin" && (
                    <>
                      <div className="space-y-2">
                        <Label>Person ID</Label>
                        <Input
                          placeholder="LinkedIn Person ID"
                          value={settings.linkedinPersonId}
                          onChange={(e) => setSettings({ ...settings, linkedinPersonId: e.target.value })}
                          className="neon-border bg-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Access Token</Label>
                        <Input
                          type={showApiKeys.linkedin ? "text" : "password"}
                          placeholder="LinkedIn Access Token"
                          value={settings.linkedinAccessToken}
                          onChange={(e) => setSettings({ ...settings, linkedinAccessToken: e.target.value })}
                          className="neon-border bg-transparent"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => testApiConnection(platform.id)}
                    className="w-full neon-border bg-transparent"
                  >
                    {testResults[platform.id] === "testing" ? (
                      <TestTube className="w-4 h-4 mr-2 animate-spin" />
                    ) : testResults[platform.id] === "success" ? (
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    ) : testResults[platform.id] === "error" ? (
                      <XCircle className="w-4 h-4 mr-2 text-red-500" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Settings Tab */}
        <TabsContent value="ai-settings">
          <Card className="glass-effect neon-border animate-float">
            <CardHeader>
              <CardTitle>AI Content Generation Settings</CardTitle>
              <CardDescription>Configure how AI generates your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Tone</Label>
                  <Select
                    value={settings.defaultTone}
                    onValueChange={(value) => setSettings({ ...settings, defaultTone: value })}
                  >
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

                <div className="space-y-2">
                  <Label>Max Post Length</Label>
                  <Input
                    type="number"
                    value={settings.maxPostLength}
                    onChange={(e) => setSettings({ ...settings, maxPostLength: Number.parseInt(e.target.value) })}
                    className="neon-border bg-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.includeHashtagsByDefault}
                  onCheckedChange={(checked) => setSettings({ ...settings, includeHashtagsByDefault: checked })}
                />
                <Label>Include hashtags by default</Label>
              </div>

              <div className="space-y-2">
                <Label>Brand Voice</Label>
                <Textarea
                  placeholder="Describe your brand voice and personality..."
                  value={settings.brandVoice}
                  onChange={(e) => setSettings({ ...settings, brandVoice: e.target.value })}
                  className="neon-border bg-transparent"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation">
          <Card className="glass-effect neon-border animate-float">
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Configure automatic posting behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.automationEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, automationEnabled: checked })}
                />
                <Label>Enable automation</Label>
              </div>

              <div className="space-y-2">
                <Label>Posting Frequency</Label>
                <Select
                  value={settings.postingFrequency}
                  onValueChange={(value) => setSettings({ ...settings, postingFrequency: value })}
                >
                  <SelectTrigger className="neon-border bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        settings.defaultPlatforms.includes(platform.id)
                          ? "border-primary bg-primary/10 animate-glow"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        const newPlatforms = settings.defaultPlatforms.includes(platform.id)
                          ? settings.defaultPlatforms.filter((p) => p !== platform.id)
                          : [...settings.defaultPlatforms, platform.id]
                        setSettings({ ...settings, defaultPlatforms: newPlatforms })
                      }}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <platform.icon className={`w-5 h-5 ${platform.color}`} />
                        <span className="text-xs">{platform.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="glass-effect neon-border animate-float">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.animations}
                  onCheckedChange={(checked) => setSettings({ ...settings, animations: checked })}
                />
                <Label>Enable animations</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                />
                <Label>Enable notifications</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <Card className="glass-effect neon-border animate-float">
            <CardHeader>
              <CardTitle>Content Preferences</CardTitle>
              <CardDescription>Configure content generation preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Preferred Topics</Label>
                <Input
                  placeholder="AI, Technology, Business (comma-separated)"
                  value={settings.contentTopics.join(", ")}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contentTopics: e.target.value.split(",").map((topic) => topic.trim()),
                    })
                  }
                  className="neon-border bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label>Keywords to Avoid</Label>
                <Input
                  placeholder="politics, controversial (comma-separated)"
                  value={settings.avoidKeywords.join(", ")}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      avoidKeywords: e.target.value.split(",").map((keyword) => keyword.trim()),
                    })
                  }
                  className="neon-border bg-transparent"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <Card className="glass-effect neon-border animate-float">
        <CardContent className="pt-6">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 animate-glow"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save All Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
