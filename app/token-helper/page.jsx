"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TokenHelper() {
  const [tokens, setTokens] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
  })
  const [validationResults, setValidationResults] = useState({})
  const [isValidating, setIsValidating] = useState(false)

  const { toast } = useToast()

  const tokenInstructions = {
    facebook: {
      title: "Facebook Page Access Token",
      steps: [
        "Go to Facebook Developer Console",
        "Select your app or create a new one",
        "Go to Tools > Graph API Explorer",
        "Select your Facebook Page from the dropdown (not your personal profile)",
        "Add these permissions: pages_read_engagement, pages_manage_posts",
        "Click 'Generate Access Token' and authorize the permissions",
        "Copy the Page Access Token (not User Access Token)",
        "For long-lived token: Use Access Token Debugger to extend token lifetime",
      ],
      url: "https://developers.facebook.com/tools/explorer/",
      envVar: "FB_ACCESS_TOKEN",
      requiredPermissions: ["pages_read_engagement", "pages_manage_posts"],
      tokenType: "Page Access Token",
    },
    instagram: {
      title: "Instagram Business Account Token",
      steps: [
        "Ensure your Instagram account is connected to a Facebook Page",
        "Use the same Facebook Page Access Token",
        "Get your Instagram Business Account ID from Graph API",
        "Test with Graph API Explorer",
      ],
      url: "https://developers.facebook.com/docs/instagram-api/",
      envVar: "IG_ACCESS_TOKEN",
    },
    linkedin: {
      title: "LinkedIn Access Token",
      steps: [
        "Go to LinkedIn Developer Portal",
        "Create or select your app",
        "Request access to LinkedIn Share API",
        "Generate OAuth 2.0 access token",
        "Copy the access token",
      ],
      url: "https://developer.linkedin.com/",
      envVar: "LINKEDIN_ACCESS_TOKEN",
    },
  }

  const validateToken = async (platform, token) => {
    if (!token.trim()) return

    setIsValidating(true)
    try {
      let validationUrl = ""

      switch (platform) {
        case "facebook":
          validationUrl = `https://graph.facebook.com/v23.0/me?access_token=${token}`
          break
        case "instagram":
          validationUrl = `https://graph.facebook.com/v23.0/me?access_token=${token}`
          break
        case "linkedin":
          // LinkedIn validation would require a different approach
          validationUrl = null
          break
      }

      if (validationUrl) {
        const response = await fetch(`/api/validate-token?platform=${platform}&token=${encodeURIComponent(token)}`)
        const result = await response.json()

        setValidationResults((prev) => ({
          ...prev,
          [platform]: result,
        }))
      }
    } catch (error) {
      setValidationResults((prev) => ({
        ...prev,
        [platform]: { valid: false, error: error.message },
      }))
    } finally {
      setIsValidating(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Environment variable copied to clipboard",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-glow">Token Helper</h1>
        <p className="text-muted-foreground">Generate and validate access tokens for social media platforms</p>
      </div>

      <Alert>
        <RefreshCw className="h-4 w-4" />
        <AlertDescription>
          <strong>Token Expired?</strong> Use this page to generate new access tokens when your social media posting
          fails due to expired credentials.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {Object.entries(tokenInstructions).map(([platform, info]) => (
          <Card key={platform} className="glass-effect neon-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {info.title}
                <Badge variant="outline">{platform}</Badge>
              </CardTitle>
              <CardDescription>Follow these steps to generate a new access token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {info.requiredPermissions && (
                <div className="space-y-2">
                  <Label>Required Permissions:</Label>
                  <div className="flex flex-wrap gap-2">
                    {info.requiredPermissions.map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                  {info.tokenType && (
                    <p className="text-xs text-muted-foreground">
                      Token Type: <strong>{info.tokenType}</strong>
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Steps:</Label>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {info.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => window.open(info.url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Developer Console
              </Button>

              <div className="space-y-2">
                <Label htmlFor={`${platform}-token`}>Paste Your Token:</Label>
                <div className="flex space-x-2">
                  <Input
                    id={`${platform}-token`}
                    placeholder="Paste your access token here..."
                    value={tokens[platform]}
                    onChange={(e) =>
                      setTokens((prev) => ({
                        ...prev,
                        [platform]: e.target.value,
                      }))
                    }
                    className="neon-border bg-transparent"
                  />
                  <Button
                    onClick={() => validateToken(platform, tokens[platform])}
                    disabled={isValidating || !tokens[platform].trim()}
                    size="sm"
                  >
                    {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Validate"}
                  </Button>
                </div>
              </div>

              {validationResults[platform] && (
                <div
                  className={`flex items-center space-x-2 p-2 rounded ${
                    validationResults[platform].valid ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {validationResults[platform].valid ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {validationResults[platform].valid
                      ? "Token is valid!"
                      : `Invalid: ${validationResults[platform].error}`}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label>Environment Variable:</Label>
                <div className="flex items-center space-x-2 p-2 bg-muted/20 rounded neon-border">
                  <code className="flex-1 text-sm">
                    {info.envVar}={tokens[platform] || "your_token_here"}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`${info.envVar}=${tokens[platform]}`)}
                    disabled={!tokens[platform].trim()}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-effect neon-border">
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
          <CardDescription>After generating your tokens, add them to your environment variables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Facebook Permission Error?</strong> Make sure you're using a <strong>Page Access Token</strong>{" "}
                (not User Access Token) with <strong>pages_read_engagement</strong> and{" "}
                <strong>pages_manage_posts</strong> permissions. You must be an admin of the Facebook Page.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Add to your .env.local file:</Label>
              <div className="bg-muted/20 p-4 rounded neon-border">
                <pre className="text-sm">
                  {`FB_PAGE_ID=your_facebook_page_id
FB_ACCESS_TOKEN=your_facebook_page_access_token
IG_ACCOUNT_ID=your_instagram_business_account_id
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
LINKEDIN_PERSON_ID=your_linkedin_person_id`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
