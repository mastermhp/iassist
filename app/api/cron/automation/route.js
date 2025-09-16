export async function GET() {
  try {
    console.log("[v0] Automation cron job started at:", new Date().toISOString())

    // Run automation to generate and post content automatically
    const automationResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/automation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "run-automation",
      }),
    })

    if (!automationResponse.ok) {
      throw new Error("Failed to run automation")
    }

    const automationData = await automationResponse.json()

    console.log("[v0] Automation cron job completed at:", new Date().toISOString())
    console.log("[v0] Processed", automationData.results?.length || 0, "automation schedules")

    return Response.json({
      success: true,
      message: "Automation cron job completed successfully",
      results: automationData.results || [],
      lastRun: automationData.lastRun,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Automation cron error:", error)
    return Response.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Allow manual triggering for testing
export async function POST() {
  return GET()
}
