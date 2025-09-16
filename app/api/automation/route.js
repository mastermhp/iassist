const automationConfig = {
  isActive: false,
  schedules: [
    {
      id: 1,
      times: ["09:00", "18:00"],
      platforms: ["facebook"],
      topic: "AI development and seeking co-founders for tech innovations",
      tone: "professional",
      enabled: true,
    },
  ],
  lastRun: null,
  stats: {
    totalPosts: 0,
    successfulPosts: 0,
    failedPosts: 0,
    lastPostTime: null,
  },
}

const recentPosts = []

export async function GET() {
  return Response.json({
    isActive: automationConfig.isActive,
    schedules: automationConfig.schedules,
    lastRun: automationConfig.lastRun,
    stats: automationConfig.stats,
    recentPosts: recentPosts.slice(-10), // Last 10 posts
  })
}

export async function POST(request) {
  try {
    const { action, config } = await request.json()

    if (action === "start") {
      automationConfig.isActive = true
      if (config && config.schedules) {
        automationConfig.schedules = config.schedules
      }

      console.log("Automation started with schedules:", automationConfig.schedules)

      return Response.json({
        success: true,
        message: "Automation started successfully",
        config: automationConfig,
      })
    }

    if (action === "stop") {
      automationConfig.isActive = false
      console.log("[v0] Automation stopped")
      return Response.json({
        success: true,
        message: "Automation stopped successfully",
      })
    }

    if (action === "update-schedules") {
      automationConfig.schedules = config.schedules || []
      console.log("[v0] Schedules updated:", automationConfig.schedules)
      return Response.json({
        success: true,
        message: "Automation schedules updated successfully",
        schedules: automationConfig.schedules,
      })
    }

    if (action === "run-automation") {
      if (!automationConfig.isActive) {
        return Response.json({ error: "Automation is not active" }, { status: 400 })
      }

      const now = new Date()
      const results = []

      console.log("[v0] Running automation check at:", now.toISOString())

      for (const schedule of automationConfig.schedules) {
        if (!schedule.enabled) continue

        try {
          const shouldRun = checkScheduleTime(schedule, now)
          console.log("[v0] Schedule", schedule.id, "should run:", shouldRun)

          if (shouldRun) {
            console.log("[v0] Executing schedule:", schedule.id)
            const result = await generateAndScheduleContent(schedule)
            results.push({
              scheduleId: schedule.id,
              success: true,
              result,
            })

            automationConfig.stats.totalPosts++
            automationConfig.stats.successfulPosts++
            automationConfig.stats.lastPostTime = now.toISOString()

            recentPosts.unshift({
              id: Date.now(),
              content: result.content.substring(0, 100) + "...",
              platform: schedule.platforms[0],
              time: now.toISOString(),
              status: "published",
              engagement: "Just posted",
            })
          }
        } catch (error) {
          console.error("[v0] Schedule execution failed:", error)
          results.push({
            scheduleId: schedule.id,
            success: false,
            error: error.message,
          })
          automationConfig.stats.failedPosts++
        }
      }

      automationConfig.lastRun = now.toISOString()

      return Response.json({
        success: true,
        message: `Automation run completed. Processed ${results.length} schedules.`,
        results,
        lastRun: automationConfig.lastRun,
        stats: automationConfig.stats,
      })
    }

    return Response.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Automation error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

function checkScheduleTime(schedule, currentTime) {
  const now = new Date(currentTime)
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  return schedule.times.some((time) => {
    const [hour, minute] = time.split(":").map(Number)
    const timeDiff = Math.abs(currentHour * 60 + currentMinute - (hour * 60 + minute))
    return timeDiff <= 5 // Within 5 minutes
  })
}

async function generateAndScheduleContent(schedule) {
  console.log("[v0] Generating content for schedule:", schedule.id)

  const topics = [
    "AI development expertise and latest projects",
    "MERN stack development and Next.js innovations",
    "Game development with Unreal Engine progress",
    "Seeking co-founders for revolutionary IT projects",
    "Web development insights and professional achievements",
    "Technology trends and AI innovations",
    "Building the future of IT sector with new inventions",
  ]

  const randomTopic = topics[Math.floor(Math.random() * topics.length)]
  const finalTopic = schedule.topic || randomTopic

  // Generate content
  const contentResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/generate-content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: schedule.platforms[0],
      topic: finalTopic,
      tone: schedule.tone,
      includeHashtags: true,
      contentType: "post",
      generateImage: true,
    }),
  })

  if (!contentResponse.ok) {
    throw new Error("Failed to generate content")
  }

  const contentData = await contentResponse.json()
  console.log("[v0] Content generated successfully")

  // Post immediately to all platforms
  const postResults = {}

  for (const platform of schedule.platforms) {
    try {
      console.log("[v0] Posting to", platform)

      let requestBody
      const headers = {}

      if (platform === "facebook") {
        const formData = new FormData()
        formData.append("content", contentData.content)
        if (contentData.generatedImageUrl && !contentData.generatedImageUrl.includes("placeholder.svg")) {
          formData.append("imageUrl", contentData.generatedImageUrl)
        }
        requestBody = formData
      } else {
        headers["Content-Type"] = "application/json"
        requestBody = JSON.stringify({
          content: contentData.content,
          imageUrl: contentData.generatedImageUrl || null,
        })
      }

      const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/social/${platform}`, {
        method: "POST",
        headers,
        body: requestBody,
      })

      const data = await response.json()
      postResults[platform] = response.ok ? { success: true, data } : { success: false, error: data.error }

      if (response.ok) {
        console.log("[v0] Successfully posted to", platform)
      } else {
        console.error("[v0] Failed to post to", platform, ":", data.error)
      }
    } catch (error) {
      console.error("[v0] Error posting to", platform, ":", error.message)
      postResults[platform] = { success: false, error: error.message }
    }
  }

  return {
    content: contentData.content,
    imageUrl: contentData.generatedImageUrl,
    postResults,
    timestamp: new Date().toISOString(),
    topic: finalTopic,
  }
}
