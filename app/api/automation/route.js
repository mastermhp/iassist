const automationConfig = {
  isActive: true,
  schedules: [],
  lastRun: null,
  stats: {
    totalPosts: 0,
    successfulPosts: 0,
    failedPosts: 0,
    lastPostTime: null,
  },
}

const recentPosts = []
const automationLogs = []
const MAX_LOGS = 100

function addLog(level, message, data = null) {
  const log = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    level, // 'info', 'success', 'error', 'warning'
    message,
    data,
  }
  automationLogs.unshift(log)
  if (automationLogs.length > MAX_LOGS) {
    automationLogs.pop()
  }
  console.log(`[v0] ${level.toUpperCase()}: ${message}`, data || "")
}

export async function GET() {
  if (automationConfig.schedules.length === 0) {
    automationConfig.schedules = [
      {
        id: "schedule1",
        times: ["09:00", "17:14"], // 9:00 AM and 5:14 PM
        platforms: ["facebook"],
        topic: "AI development and seeking co-founders for tech innovations",
        tone: "professional",
        enabled: true,
      },
    ]
    addLog("info", "Auto-loaded default automation schedules")
  }

  return Response.json({
    isActive: automationConfig.isActive,
    schedules: automationConfig.schedules,
    lastRun: automationConfig.lastRun,
    stats: automationConfig.stats,
    recentPosts: recentPosts.slice(-10), // Last 10 posts
    logs: automationLogs.slice(0, 50), // Last 50 logs
  })
}

export async function POST(request) {
  try {
    const { action, config } = await request.json()

    if (action === "start") {
      automationConfig.isActive = true
      addLog("success", "Automation started successfully")
      return Response.json({
        success: true,
        message: "Automation started successfully",
        config: automationConfig,
      })
    }

    if (action === "stop") {
      automationConfig.isActive = false
      addLog("info", "Automation stopped by user")
      return Response.json({
        success: true,
        message: "Automation stopped successfully",
      })
    }

    if (action === "quick-test") {
      addLog("info", "Quick test initiated by user")

      const testSchedule = {
        id: "test",
        platforms: ["facebook"],
        topic: "AI development and seeking co-founders for tech innovations",
        tone: "professional",
        enabled: true,
      }

      try {
        const result = await generateAndScheduleContent(testSchedule)

        automationConfig.stats.totalPosts++
        automationConfig.stats.successfulPosts++
        automationConfig.stats.lastPostTime = new Date().toISOString()

        recentPosts.unshift({
          id: Date.now(),
          content: result.content,
          platform: testSchedule.platforms[0],
          time: new Date().toISOString(),
          status: "published",
          engagement: "Test post - just published",
          isTest: true,
        })

        addLog("success", "Quick test completed successfully", {
          platform: testSchedule.platforms[0],
          contentLength: result.content.length,
        })

        return Response.json({
          success: true,
          message: "Quick test completed successfully",
          result,
          stats: automationConfig.stats,
        })
      } catch (error) {
        addLog("error", "Quick test failed", { error: error.message })
        return Response.json({ error: error.message }, { status: 500 })
      }
    }

    if (action === "manual-trigger") {
      const { scheduleId } = config
      addLog("info", `Manual trigger initiated for schedule ${scheduleId}`)

      const schedule = automationConfig.schedules.find((s) => s.id === scheduleId)
      if (!schedule) {
        addLog("error", `Schedule ${scheduleId} not found`)
        return Response.json({ error: "Schedule not found" }, { status: 404 })
      }

      try {
        const result = await generateAndScheduleContent(schedule)

        automationConfig.stats.totalPosts++
        automationConfig.stats.successfulPosts++
        automationConfig.stats.lastPostTime = new Date().toISOString()

        recentPosts.unshift({
          id: Date.now(),
          content: result.content,
          platform: schedule.platforms[0],
          time: new Date().toISOString(),
          status: "published",
          engagement: "Manual trigger - just published",
          isManual: true,
        })

        addLog("success", `🎉 AUTOMATED POST PUBLISHED! Post ${scheduleId} executed successfully`, {
          platform: schedule.platforms[0],
          contentPreview: result.content.substring(0, 100) + "...",
          scheduledTime: schedule.scheduledTime,
          actualTime: new Date().toISOString(),
        })

        return Response.json({
          success: true,
          message: "Manual trigger completed successfully",
          result,
          stats: automationConfig.stats,
        })
      } catch (error) {
        addLog("error", `Manual trigger failed for schedule ${scheduleId}`, { error: error.message })
        return Response.json({ error: error.message }, { status: 500 })
      }
    }

    if (action === "update-schedules") {
      automationConfig.schedules = config.schedules
      addLog("info", "Automation schedules updated", {
        scheduleCount: config.schedules.length,
        enabledCount: config.schedules.filter((s) => s.enabled).length,
      })
      return Response.json({
        success: true,
        message: "Schedules updated successfully",
        config: automationConfig,
      })
    }

    if (action === "run-automation") {
      if (!automationConfig.isActive) {
        addLog("warning", "Automation run attempted but automation is not active")
        return Response.json({ error: "Automation is not active" }, { status: 400 })
      }

      const now = new Date()
      const results = []

      addLog("info", "Automation cycle started", { timestamp: now.toISOString() })

      try {
        const schedulerResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/scheduler`)
        const schedulerData = await schedulerResponse.json()
        const scheduledPosts = schedulerData.scheduledPosts || []

        addLog("info", `Found ${scheduledPosts.length} scheduled posts to check`)

        for (const post of scheduledPosts) {
          if (post.status !== "scheduled") {
            continue
          }

          try {
            const shouldRun = checkScheduledPostTime(post, now)
            addLog("info", `Post ${post.id} time check`, {
              shouldRun,
              scheduledTime: post.scheduledTime,
              currentTime: now.toISOString(),
            })

            if (shouldRun) {
              addLog("info", `Executing scheduled post ${post.id}`, {
                platforms: post.platforms,
                content: post.content ? post.content.substring(0, 50) + "..." : "AI-generated content",
              })

              const result = await executeScheduledPost(post)
              results.push({
                postId: post.id,
                success: true,
                result,
              })

              automationConfig.stats.totalPosts++
              automationConfig.stats.successfulPosts++
              automationConfig.stats.lastPostTime = now.toISOString()

              recentPosts.unshift({
                id: Date.now(),
                content: result.content,
                platform: post.platforms[0],
                time: now.toISOString(),
                status: "published",
                engagement: "Scheduled post - just published",
                scheduledPostId: post.id,
              })

              addLog("success", `🎉 AUTOMATED POST PUBLISHED! Post ${post.id} executed successfully`, {
                platform: post.platforms[0],
                contentPreview: result.content.substring(0, 100) + "...",
                scheduledTime: post.scheduledTime,
                actualTime: now.toISOString(),
              })

              await markPostAsPublished(post.id)
            }
          } catch (error) {
            addLog("error", `Scheduled post ${post.id} execution failed`, { error: error.message })
            results.push({
              postId: post.id,
              success: false,
              error: error.message,
            })
            automationConfig.stats.failedPosts++
          }
        }

        for (const schedule of automationConfig.schedules) {
          if (!schedule.enabled) continue

          try {
            const shouldRun = checkScheduleTime(schedule, now)
            if (shouldRun) {
              addLog("info", `Executing hardcoded schedule ${schedule.id}`, {
                platforms: schedule.platforms,
                topic: schedule.topic,
              })

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
                content: result.content,
                platform: schedule.platforms[0],
                time: now.toISOString(),
                status: "published",
                engagement: "Automated schedule - just published",
                scheduleId: schedule.id,
              })

              addLog("success", `🚀 AUTOMATED POST PUBLISHED! Schedule ${schedule.id} executed successfully`, {
                platform: schedule.platforms[0],
                topic: schedule.topic,
                contentPreview: result.content.substring(0, 100) + "...",
              })
            }
          } catch (error) {
            addLog("error", `Schedule ${schedule.id} execution failed`, { error: error.message })
            results.push({
              scheduleId: schedule.id,
              success: false,
              error: error.message,
            })
            automationConfig.stats.failedPosts++
          }
        }
      } catch (error) {
        addLog("error", "Failed to fetch scheduled posts", { error: error.message })
        return Response.json({ error: "Failed to fetch scheduled posts" }, { status: 500 })
      }

      automationConfig.lastRun = now.toISOString()

      const successfulExecutions = results.filter((r) => r.success).length

      if (successfulExecutions > 0) {
        addLog("success", `✅ Automation cycle completed successfully! Published ${successfulExecutions} posts`, {
          totalProcessed: results.length,
          successfulExecutions,
          failedExecutions: results.length - successfulExecutions,
        })
      } else {
        addLog("info", "Automation cycle completed - no posts were due for publishing", {
          processedPosts: results.length,
        })
      }

      return Response.json({
        success: true,
        message: `Automation run completed. Processed ${results.length} items, published ${successfulExecutions} posts.`,
        results,
        lastRun: automationConfig.lastRun,
        stats: automationConfig.stats,
      })
    }

    return Response.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    addLog("error", "Automation API error", { error: error.message })
    return Response.json({ error: error.message }, { status: 500 })
  }
}

function checkScheduledPostTime(post, currentTime) {
  const now = new Date(currentTime)
  const scheduledTime = new Date(post.scheduledTime)

  // Check if current time is within 5 minutes of scheduled time
  const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime())
  const fiveMinutesInMs = 5 * 60 * 1000

  const shouldRun = timeDiff <= fiveMinutesInMs && now >= scheduledTime

  console.log(`[v0] Scheduled post time check for ${post.id}:`, {
    scheduledTime: scheduledTime.toISOString(),
    currentTime: now.toISOString(),
    timeDiffMinutes: Math.round(timeDiff / 60000),
    shouldRun,
  })

  return shouldRun
}

async function executeScheduledPost(post) {
  addLog("info", `Executing scheduled post ${post.id}`)

  let content = post.content

  // If no content but has topic, generate content
  if (!content && post.topic) {
    addLog("info", "Generating content for scheduled post", { topic: post.topic })

    const contentResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/generate-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform: post.platforms[0],
        topic: post.topic,
        tone: post.tone || "engaging",
        includeHashtags: true,
        contentType: "post",
        generateImage: true,
      }),
    })

    if (!contentResponse.ok) {
      throw new Error("Failed to generate content for scheduled post")
    }

    const contentData = await contentResponse.json()
    content = contentData.content
    addLog("success", "Content generated for scheduled post")
  }

  // Post to all platforms
  const postResults = {}

  for (const platform of post.platforms) {
    try {
      addLog("info", `Posting scheduled content to ${platform}`)

      let requestBody
      const headers = {}

      if (platform === "facebook") {
        const formData = new FormData()
        formData.append("content", content)
        if (post.imageUrl) {
          formData.append("imageUrl", post.imageUrl)
        }
        requestBody = formData
      } else {
        headers["Content-Type"] = "application/json"
        requestBody = JSON.stringify({
          content: content,
          imageUrl: post.imageUrl || null,
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
        addLog("success", `Successfully posted scheduled content to ${platform}`, { postId: data.id })
      } else {
        addLog("error", `Failed to post scheduled content to ${platform}`, { error: data.error })
      }
    } catch (error) {
      addLog("error", `Error posting scheduled content to ${platform}`, { error: error.message })
      postResults[platform] = { success: false, error: error.message }
    }
  }

  return {
    content: content,
    imageUrl: post.imageUrl,
    postResults,
    timestamp: new Date().toISOString(),
    originalPost: post,
  }
}

async function markPostAsPublished(postId) {
  try {
    const updateResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/scheduler`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: postId,
        status: "published",
        publishedAt: new Date().toISOString(),
      }),
    })

    if (updateResponse.ok) {
      addLog("success", `✅ Post ${postId} marked as published in scheduler`)
    } else {
      addLog("warning", `Failed to update post ${postId} status in scheduler`)
    }
  } catch (error) {
    addLog("error", `Failed to mark post ${postId} as published`, { error: error.message })
  }
}

function checkScheduleTime(schedule, currentTime) {
  const now = new Date(currentTime)
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  return schedule.times.some((time) => {
    const [hour, minute] = time.split(":").map(Number)
    const scheduleTimeInMinutes = hour * 60 + minute
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    const timeDiff = Math.abs(currentTimeInMinutes - scheduleTimeInMinutes)

    console.log(`[v0] Time check for schedule ${schedule.id}:`, {
      scheduledTime: time,
      currentTime: `${currentHour}:${currentMinute.toString().padStart(2, "0")}`,
      timeDiff,
      shouldRun: timeDiff <= 10, // Within 10 minutes for better reliability
    })

    return timeDiff <= 10 // Within 10 minutes for better reliability
  })
}

async function generateAndScheduleContent(schedule) {
  addLog("info", `Starting content generation for schedule ${schedule.id}`)

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

  addLog("info", "Generating content", { topic: finalTopic, tone: schedule.tone })

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
  addLog("success", "Content generated successfully", {
    contentLength: contentData.content.length,
    hasImage: !!contentData.generatedImageUrl,
  })

  // Post immediately to all platforms
  const postResults = {}

  for (const platform of schedule.platforms) {
    try {
      addLog("info", `Posting to ${platform}`)

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
        addLog("success", `Successfully posted to ${platform}`, { postId: data.id })
      } else {
        addLog("error", `Failed to post to ${platform}`, { error: data.error })
      }
    } catch (error) {
      addLog("error", `Error posting to ${platform}`, { error: error.message })
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
