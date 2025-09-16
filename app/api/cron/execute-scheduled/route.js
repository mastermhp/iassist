// Cron job endpoint to execute scheduled posts and run automation
export async function GET() {
  try {
    console.log("[v0] Cron job started at:", new Date().toISOString())

    const automationResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/automation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "run-automation",
      }),
    })

    let automationResults = []
    if (automationResponse.ok) {
      const automationData = await automationResponse.json()
      automationResults = automationData.results || []
      console.log("[v0] Automation run completed:", automationResults.length, "schedules processed")
    }

    // Get all scheduled posts
    const schedulerResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/scheduler`)
    const { scheduledPosts } = await schedulerResponse.json()

    const now = new Date()
    const postsToExecute = scheduledPosts.filter((post) => {
      const scheduledTime = new Date(post.scheduledTime)
      return scheduledTime <= now && post.status === "scheduled"
    })

    console.log("[v0] Found", postsToExecute.length, "posts to execute")

    const results = []

    for (const post of postsToExecute) {
      try {
        console.log("[v0] Executing post:", post.id)

        // Execute post on each platform
        for (const platform of post.platforms) {
          try {
            let requestBody
            const headers = {}

            if (platform === "facebook") {
              const formData = new FormData()
              formData.append("content", post.content)
              if (post.imageUrl && !post.imageUrl.includes("placeholder.svg")) {
                formData.append("imageUrl", post.imageUrl)
              }
              requestBody = formData
            } else {
              headers["Content-Type"] = "application/json"
              requestBody = JSON.stringify({
                content: post.content,
                imageUrl: post.imageUrl || null,
              })
            }

            const response = await fetch(
              `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/social/${platform}`,
              {
                method: "POST",
                headers,
                body: requestBody,
              },
            )

            const data = await response.json()
            results.push({
              postId: post.id,
              platform,
              success: response.ok,
              data: response.ok ? data : { error: data.error },
            })

            console.log(`[v0] ${platform} post result:`, response.ok ? "success" : data.error)
          } catch (platformError) {
            console.log(`[v0] ${platform} post error:`, platformError.message)
            results.push({
              postId: post.id,
              platform,
              success: false,
              error: platformError.message,
            })
          }
        }

        post.status = "executed"
        post.executedAt = new Date().toISOString()
      } catch (error) {
        console.log("[v0] Post execution error:", error.message)
        results.push({
          postId: post.id,
          success: false,
          error: error.message,
        })
      }
    }

    console.log("[v0] Cron job completed at:", new Date().toISOString())

    return Response.json({
      success: true,
      executedPosts: postsToExecute.length,
      automationResults: automationResults.length,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron execution error:", error)
    return Response.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  // Allow manual triggering of cron job for testing
  return GET()
}
