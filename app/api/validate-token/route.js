export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")
    const token = searchParams.get("token")

    if (!platform || !token) {
      return Response.json({ error: "Platform and token are required" }, { status: 400 })
    }

    let validationUrl = ""
    let isValid = false
    let userInfo = null

    switch (platform) {
      case "facebook":
        validationUrl = `https://graph.facebook.com/v23.0/me?access_token=${token}`
        break
      case "instagram":
        validationUrl = `https://graph.facebook.com/v23.0/me?access_token=${token}`
        break
      default:
        return Response.json({ error: "Unsupported platform" }, { status: 400 })
    }

    const response = await fetch(validationUrl)
    const data = await response.json()

    if (response.ok && data.id) {
      isValid = true
      userInfo = {
        id: data.id,
        name: data.name || "Unknown",
      }
    }

    return Response.json({
      valid: isValid,
      platform,
      userInfo,
      error: isValid ? null : data.error?.message || "Token validation failed",
    })
  } catch (error) {
    return Response.json(
      {
        valid: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
