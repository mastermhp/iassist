import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Image prompt is required" }, { status: 400 })
    }

    const HF_API_KEY = process.env.HUGGING_FACE_API_KEY

    if (HF_API_KEY) {
      try {
        console.log("[v0] Attempting to generate image with Hugging Face API using stable-diffusion-3-medium")

        const response = await fetch(
          "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3-medium-diffusers",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${HF_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: prompt,
            }),
          },
        )

        console.log("[v0] Hugging Face API response status:", response.status)

        if (response.ok) {
          const imageBlob = await response.blob()

          const arrayBuffer = await imageBlob.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          // Generate unique filename
          const timestamp = Date.now()
          const filename = `generated-image-${timestamp}.png`
          const filepath = join(process.cwd(), "public", filename)

          // Save image to public directory
          await writeFile(filepath, buffer)

          // For development, use localhost URL that works in the UI
          // For production, use the proper domain
          let imageUrl
          if (process.env.NODE_ENV === "production") {
            const domain =
              process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : "https://eyexai.vercel.app"
            imageUrl = `${domain}/${filename}`
          } else {
            // For development, use relative path that works in the UI
            imageUrl = `/${filename}`
          }

          console.log("[v0] Successfully generated and saved image:", imageUrl)

          return Response.json({
            imageUrl,
            prompt,
            generatedAt: new Date().toISOString(),
            source: "huggingface",
            model: "stable-diffusion-3-medium",
          })
        } else {
          const errorText = await response.text()
          console.log("[v0] Hugging Face API failed:", response.status, errorText)

          // Check if it's a model loading error
          if (response.status === 503) {
            console.log("[v0] Model is loading, this may take a few minutes")
            return Response.json(
              {
                error: "Model is currently loading. Please try again in a few minutes.",
                status: "loading",
                model: "stable-diffusion-3-medium",
              },
              { status: 503 },
            )
          }
        }
      } catch (hfError) {
        console.log("[v0] Hugging Face API error:", hfError.message)
      }
    } else {
      console.log("[v0] HUGGING_FACE_API_KEY not found in environment variables")
    }

    // Fallback to enhanced placeholder with better visual representation
    const enhancedPrompt = encodeURIComponent(prompt.substring(0, 100))
    const imageUrl = `/placeholder.svg?height=1024&width=1024&query=${enhancedPrompt}`

    console.log("[v0] Using placeholder image generation")

    return Response.json({
      imageUrl,
      prompt,
      generatedAt: new Date().toISOString(),
      source: "placeholder",
      note: "Add HUGGING_FACE_API_KEY environment variable for AI image generation",
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return Response.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
