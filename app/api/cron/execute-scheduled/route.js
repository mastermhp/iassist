export async function GET() {
  try {
    console.log("[v0] Scheduled execution cron job started at:", new Date().toISOString())

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
    } else {
      console.log("[v0] Automation run failed:", await automationResponse.text())
    }

    // Get all scheduled posts
    const schedulerResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/scheduler`)

    if (!schedulerResponse.ok) {
      console.log("[v0] Failed to fetch scheduled posts")
      return Response.json({
        success: false,
        error: "Failed to fetch scheduled posts",
        automationResults: automationResults.length,
        timestamp: new Date().toISOString(),
      })
    }

    const { scheduledPosts } = await schedulerResponse.json()

    const now = new Date()
    const postsToExecute = scheduledPosts.filter((post) => {
      const scheduledTime = new Date(post.scheduledTime)
      const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime()) / (1000 * 60) // minutes

      console.log(`[v0] Post ${post.id} time check:`, {
        scheduledTime: scheduledTime.toISOString(),
        currentTime: now.toISOString(),
        timeDiff: timeDiff.toFixed(2) + " minutes",
        status: post.status,
        shouldExecute: scheduledTime <= now && post.status === "scheduled" && timeDiff <= 5,
      })

      return scheduledTime <= now && post.status === "scheduled" && timeDiff <= 5 // Within 5 minutes
    })

    console.log(
      "[v0] Found",
      postsToExecute.length,
      "posts to execute out of",
      scheduledPosts.length,
      "total scheduled posts",
    )

    const results = []

    for (const post of postsToExecute) {
      try {
        console.log("[v0] Executing scheduled post:", post.id, "for platforms:", post.platforms)

        // Execute post on each platform
        for (const platform of post.platforms) {
          try {
            console.log(`[v0] Posting to ${platform} for scheduled post ${post.id}`)

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

            console.log(`[v0] ${platform} scheduled post result:`, response.ok ? "success" : data.error)
          } catch (platformError) {
            console.log(`[v0] ${platform} scheduled post error:`, platformError.message)
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
        console.log(`[v0] Marked post ${post.id} as executed`)
      } catch (error) {
        console.log("[v0] Scheduled post execution error:", error.message)
        results.push({
          postId: post.id,
          success: false,
          error: error.message,
        })
      }
    }

    console.log("[v0] Scheduled execution cron job completed at:", new Date().toISOString())
    console.log("[v0] Summary:", {
      executedPosts: postsToExecute.length,
      automationSchedules: automationResults.length,
      totalResults: results.length,
      successfulPosts: results.filter((r) => r.success).length,
    })

    return Response.json({
      success: true,
      executedPosts: postsToExecute.length,
      automationResults: automationResults.length,
      results,
      summary: {
        totalScheduledPosts: scheduledPosts.length,
        executedPosts: postsToExecute.length,
        successfulPosts: results.filter((r) => r.success).length,
        failedPosts: results.filter((r) => !r.success).length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Scheduled execution cron error:", error)
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
  console.log("[v0] Manual trigger of scheduled execution")
  return GET()
}
