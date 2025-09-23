export async function POST(request) {
  try {
    const { platform } = await request.json()

    console.log(`[v0] Testing ${platform} connection...`)

    switch (platform) {
      case 'facebook':
        const fbPageId = process.env.FB_PAGE_ID
        const fbToken = process.env.FB_ACCESS_TOKEN || process.env.MARKETING_API_TOKEN

        if (!fbPageId || !fbToken) {
          return Response.json({
            success: false,
            error: 'Facebook credentials not configured'
          }, { status: 400 })
        }

        // Test Facebook API connection
        const fbResponse = await fetch(`https://graph.facebook.com/v23.0/${fbPageId}?fields=name,access_token&access_token=${fbToken}`)
        const fbData = await fbResponse.json()

        if (!fbResponse.ok) {
          return Response.json({
            success: false,
            error: fbData.error?.message || 'Facebook API connection failed'
          }, { status: 400 })
        }

        return Response.json({
          success: true,
          data: {
            pageName: fbData.name,
            pageId: fbPageId,
            tokenValid: true
          }
        })

      case 'gemini':
        const geminiKey = process.env.GEMINI_API_KEY

        if (!geminiKey) {
          return Response.json({
            success: false,
            error: 'Gemini API key not configured'
          }, { status: 400 })
        }

        // Test Gemini API with a simple request
        const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Hello, this is a test. Please respond with "API connection successful".'
              }]
            }]
          })
        })

        const testData = await testResponse.json()

        if (!testResponse.ok) {
          return Response.json({
            success: false,
            error: testData.error?.message || 'Gemini API connection failed'
          }, { status: 400 })
        }

        return Response.json({
          success: true,
          data: {
            model: 'gemini-2.5-flash',
            response: testData.candidates?.[0]?.content?.parts?.[0]?.text || 'Test successful'
          }
        })

      default:
        return Response.json({
          success: false,
          error: 'Unsupported platform'
        }, { status: 400 })
    }

  } catch (error) {
    console.error(`[v0] Connection test error:`, error)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}