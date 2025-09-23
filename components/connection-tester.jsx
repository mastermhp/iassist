"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Facebook, 
  Bot,
  Wifi,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ConnectionTester() {
  const [testResults, setTestResults] = useState({})
  const [isTestingAll, setIsTestingAll] = useState(false)

  const { toast } = useToast()

  const connections = [
    {
      id: 'gemini',
      name: 'Google Gemini AI',
      icon: Bot,
      color: 'text-blue-500',
      description: 'AI content generation service'
    },
    {
      id: 'facebook',
      name: 'Facebook Pages API',
      icon: Facebook,
      color: 'text-blue-600',
      description: 'Facebook posting and page management'
    }
  ]

  const testConnection = async (connectionId) => {
    setTestResults(prev => ({ ...prev, [connectionId]: 'testing' }))

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform: connectionId })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTestResults(prev => ({ ...prev, [connectionId]: { success: true, data: data.data } }))
        toast({
          title: "Connection Successful",
          description: `${connections.find(c => c.id === connectionId)?.name} is working properly`,
        })
      } else {
        setTestResults(prev => ({ ...prev, [connectionId]: { success: false, error: data.error } }))
        toast({
          title: "Connection Failed",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [connectionId]: { success: false, error: error.message } }))
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const testAllConnections = async () => {
    setIsTestingAll(true)
    
    for (const connection of connections) {
      await testConnection(connection.id)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsTestingAll(false)
  }

  const getStatusIcon = (connectionId) => {
    const result = testResults[connectionId]
    
    if (result === 'testing') {
      return <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
    } else if (result?.success) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (result?.success === false) {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
    
    return <Wifi className="w-5 h-5 text-muted-foreground" />
  }

  const getStatusBadge = (connectionId) => {
    const result = testResults[connectionId]
    
    if (result === 'testing') {
      return <Badge variant="secondary">Testing...</Badge>
    } else if (result?.success) {
      return <Badge variant="default" className="bg-green-500">Connected</Badge>
    } else if (result?.success === false) {
      return <Badge variant="destructive">Failed</Badge>
    }
    
    return <Badge variant="outline">Not Tested</Badge>
  }

  return (
    <Card className="glass-effect neon-border animate-float">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-glow">
          <TestTube className="w-5 h-5 text-primary animate-pulse-neon" />
          <span>Connection Tester</span>
        </CardTitle>
        <CardDescription>Test your API connections and service integrations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test All Button */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Test all your configured services at once
          </p>
          <Button 
            onClick={testAllConnections}
            disabled={isTestingAll}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            {isTestingAll ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing All...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Test All Connections
              </>
            )}
          </Button>
        </div>

        {/* Individual Connection Tests */}
        <div className="space-y-4">
          {connections.map((connection) => {
            const result = testResults[connection.id]
            
            return (
              <div key={connection.id} className="p-4 rounded-lg bg-muted/20 neon-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <connection.icon className={`w-6 h-6 ${connection.color}`} />
                    <div>
                      <h4 className="font-medium text-white">{connection.name}</h4>
                      <p className="text-xs text-muted-foreground">{connection.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(connection.id)}
                    {getStatusBadge(connection.id)}
                  </div>
                </div>

                {/* Test Results */}
                {result && result !== 'testing' && (
                  <div className="mt-3">
                    {result.success ? (
                      <Alert className="border-green-500/20 bg-green-500/10">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-400">
                          <strong>Connection successful!</strong>
                          {result.data && (
                            <div className="mt-2 text-xs">
                              {connection.id === 'facebook' && (
                                <>
                                  <div>Page: {result.data.pageName}</div>
                                  <div>Page ID: {result.data.pageId}</div>
                                </>
                              )}
                              {connection.id === 'gemini' && (
                                <>
                                  <div>Model: {result.data.model}</div>
                                  <div>Response: {result.data.response}</div>
                                </>
                              )}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Connection failed:</strong> {result.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Individual Test Button */}
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(connection.id)}
                    disabled={result === 'testing'}
                    className="neon-border bg-transparent"
                  >
                    {result === 'testing' ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-3 h-3 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Environment Variables Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Required Environment Variables:</strong>
            <ul className="mt-2 text-xs space-y-1">
              <li>• GEMINI_API_KEY - Your Google Gemini AI API key</li>
              <li>• FB_PAGE_ID - Your Facebook Page ID</li>
              <li>• FB_ACCESS_TOKEN - Your Facebook Page Access Token</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
