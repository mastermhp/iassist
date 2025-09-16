// Instagram Graph API integration (requires Business account)
export async function POST(request) {
  try {
    const { content, imageUrl, instagramAccountId, accessToken } = await request.json()

    if (!instagramAccountId || !accessToken) {
      return Response.json(
        { error: "Instagram Business Account ID and Access Token are required. Please configure them in settings." },
        { status: 400 },
      )
    }

    if (!imageUrl) {
      return Response.json({ error: "Instagram posts require an image" }, { status: 400 })
    }

    // Step 1: Create media container
    const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${instagramAccountId}/media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: content,
        access_token: accessToken,
      }),
    })

    const containerData = await containerResponse.json()

    if (!containerResponse.ok) {
      throw new Error(containerData.error?.message || "Failed to create Instagram media container")
    }

    // Step 2: Publish the media
    const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: accessToken,
      }),
    })

    const publishData = await publishResponse.json()

    if (!publishResponse.ok) {
      throw new Error(publishData.error?.message || "Failed to publish Instagram post")
    }

    return Response.json({
      success: true,
      postId: publishData.id,
      platform: "instagram",
      postedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Instagram posting error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
