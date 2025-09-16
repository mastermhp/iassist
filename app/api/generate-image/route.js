// Using free image generation with Hugging Face Inference API
export async function POST(request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Image prompt is required" }, { status: 400 })
    }

    // For now, return a placeholder image URL with the prompt
    // In production, you would integrate with a free image generation service
    const imageUrl = `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(prompt)}`

    return Response.json({
      imageUrl,
      prompt,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return Response.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
