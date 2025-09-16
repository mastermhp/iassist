async function validateAndRefreshToken(accessToken, pageId) {
  try {
    // First, check if the token is valid
    const validateResponse = await fetch(`https://graph.facebook.com/v23.0/me?access_token=${accessToken}`)

    if (validateResponse.ok) {
      return { valid: true, token: accessToken }
    }

    // If token is invalid, try to get a long-lived token
    console.log("[v0] Access token expired, attempting to refresh...")

    // Note: This requires a long-lived user access token or app access token
    // For production, you'd implement proper OAuth flow with refresh tokens
    return {
      valid: false,
      error: "Access token expired. Please update your FB_ACCESS_TOKEN with a new long-lived token.",
    }
  } catch (error) {
    return {
      valid: false,
      error: `Token validation failed: ${error.message}`,
    }
  }
}

export async function POST(request) {
  try {
    let content, imageUrl

    const contentType = request.headers.get("content-type")

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData
      const formData = await request.formData()
      content = formData.get("content")
      imageUrl = formData.get("imageUrl")
    } else {
      // Handle JSON
      const body = await request.json()
      content = body.content
      imageUrl = body.imageUrl
    }

    const pageId = process.env.FB_PAGE_ID
    const accessToken = process.env.FB_ACCESS_TOKEN

    console.log("[v0] Facebook posting attempt:", {
      pageId: pageId ? `✓ (${pageId})` : "✗",
      accessToken: accessToken ? `✓ (${accessToken.substring(0, 10)}...)` : "✗",
      content: content ? `✓ (${content.length} chars)` : "✗",
      imageUrl: imageUrl ? "✓" : "✗",
    })

    if (!pageId || !accessToken) {
      return Response.json(
        {
          error:
            "Facebook Page ID and Access Token are required. Please add FB_PAGE_ID and FB_ACCESS_TOKEN to your environment variables.",
        },
        { status: 400 },
      )
    }

    if (!content || content.trim() === "") {
      return Response.json(
        {
          error: "Content is required for Facebook posts",
        },
        { status: 400 },
      )
    }

    const tokenValidation = await validateAndRefreshToken(accessToken, pageId)
    if (!tokenValidation.valid) {
      console.log("[v0] Token validation failed:", tokenValidation.error)
      return Response.json(
        {
          error: tokenValidation.error,
          details:
            "Your Facebook access token has expired. Please generate a new long-lived token from Facebook Developer Console.",
          tokenExpired: true,
        },
        { status: 401 },
      )
    }

    const postFormData = new FormData()
    postFormData.append("message", content)
    postFormData.append("access_token", accessToken)

    let endpoint = `https://graph.facebook.com/v23.0/${pageId}/feed`

    // If image is provided, post as photo
    if (imageUrl && !imageUrl.includes("placeholder.svg")) {
      endpoint = `https://graph.facebook.com/v23.0/${pageId}/photos`
      postFormData.delete("message")
      postFormData.append("caption", content)
      postFormData.append("url", imageUrl)
    }

    console.log("[v0] Posting to Facebook endpoint:", endpoint)

    const response = await fetch(endpoint, {
      method: "POST",
      body: postFormData,
    })

    const data = await response.json()

    console.log("[v0] Facebook API response:", data)

    if (!response.ok) {
      console.log("[v0] Facebook API error details:", {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
      })

      let errorMessage = data.error?.message || `Facebook API error: ${response.status} ${response.statusText}`
      let isTokenError = false
      let isPermissionError = false

      if (
        data.error?.code === 200 ||
        errorMessage.includes("pages_read_engagement") ||
        errorMessage.includes("pages_manage_posts")
      ) {
        errorMessage =
          "Facebook access token lacks required permissions. You need 'pages_read_engagement' and 'pages_manage_posts' permissions."
        isPermissionError = true
      } else if (
        data.error?.code === 190 ||
        errorMessage.includes("access token") ||
        errorMessage.includes("Session has expired")
      ) {
        errorMessage =
          "Facebook access token has expired. Please update your FB_ACCESS_TOKEN environment variable with a new long-lived token."
        isTokenError = true
      }

      return Response.json(
        {
          error: errorMessage,
          details: isPermissionError
            ? "Generate a new Page Access Token with required permissions at: https://developers.facebook.com/tools/explorer/"
            : isTokenError
              ? "Generate a new token at: https://developers.facebook.com/tools/explorer/"
              : "Check your Facebook API configuration",
          tokenExpired: isTokenError,
          permissionError: isPermissionError,
        },
        { status: isPermissionError ? 403 : isTokenError ? 401 : 500 },
      )
    }

    return Response.json({
      success: true,
      postId: data.id,
      platform: "facebook",
      postedAt: new Date().toISOString(),
      message: "Successfully posted to Facebook!",
    })
  } catch (error) {
    console.error("Facebook posting error:", error)
    return Response.json(
      {
        error: error.message,
        details: "Check your FB_PAGE_ID and FB_ACCESS_TOKEN environment variables",
      },
      { status: 500 },
    )
  }
}
