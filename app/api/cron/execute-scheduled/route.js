// Cron job endpoint to execute scheduled posts
export async function GET() {
  try {
    // Get all scheduled posts
    const schedulerResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/scheduler`)
    const { scheduledPosts } = await schedulerResponse.json()

    const now = new Date()
    const postsToExecute = scheduledPosts.filter((post) => {
      const scheduledTime = new Date(post.scheduledTime)
      return scheduledTime <= now && post.status === "scheduled"
    })

    const results = []

    for (const post of postsToExecute) {
      try {
        // Execute post on each platform
        for (const platform of post.platforms) {
          const response = await fetch(
            `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/social/${platform}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: post.content,
                imageUrl: post.imageUrl,
                // These would come from environment variables or database
                pageId: process.env.FB_PAGE_ID,
                accessToken: process.env.FB_ACCESS_TOKEN,
                instagramAccountId: process.env.IG_ACCOUNT_ID,
                personId: process.env.LINKEDIN_PERSON_ID,
              }),
            },
          )

          const data = await response.json()
          results.push({
            postId: post.id,
            platform,
            success: response.ok,
            data: response.ok ? data : { error: data.error },
          })
        }

        // Mark post as executed (in production, update database)
        post.status = "executed"
        post.executedAt = new Date().toISOString()
      } catch (error) {
        results.push({
          postId: post.id,
          success: false,
          error: error.message,
        })
      }
    }

    return Response.json({
      success: true,
      executedPosts: postsToExecute.length,
      results,
    })
  } catch (error) {
    console.error("Cron execution error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
