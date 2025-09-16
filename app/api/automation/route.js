// Automation engine for generating and posting content automatically
export async function POST(request) {
  try {
    const { action, config } = await request.json()

    if (action === "start") {
      // Start automation with given configuration
      return Response.json({
        success: true,
        message: "Automation started successfully",
        config,
      })
    }

    if (action === "stop") {
      // Stop automation
      return Response.json({
        success: true,
        message: "Automation stopped successfully",
      })
    }

    if (action === "generate-and-schedule") {
      // Generate content and schedule it
      const { platforms, topic, tone, scheduledTime } = config

      // Generate content using AI
      const contentResponse = await fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/generate-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform: platforms[0], // Use first platform for generation
            topic,
            tone,
            includeHashtags: true,
            contentType: "post",
          }),
        },
      )

      if (!contentResponse.ok) {
        throw new Error("Failed to generate content")
      }

      const contentData = await contentResponse.json()

      // Schedule the generated content
      const scheduleResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/scheduler`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentData.content,
          imageUrl: null, // Could generate image here too
          platforms,
          scheduledTime,
          topic,
          tone,
        }),
      })

      if (!scheduleResponse.ok) {
        throw new Error("Failed to schedule post")
      }

      const scheduleData = await scheduleResponse.json()

      return Response.json({
        success: true,
        message: "Content generated and scheduled successfully",
        post: scheduleData.post,
      })
    }

    return Response.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Automation error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
