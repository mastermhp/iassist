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
      throw new Error(data.error?.message || `Facebook API error: ${response.status} ${response.statusText}`)
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
