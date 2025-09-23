import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Image prompt is required" }, { status: 400 })
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log("[v0] Cloudinary not configured, using placeholder")
      const enhancedPrompt = encodeURIComponent(prompt.substring(0, 100))
      const imageUrl = `/placeholder.svg?height=1024&width=1024&query=${enhancedPrompt}`

      return Response.json({
        imageUrl,
        prompt,
        generatedAt: new Date().toISOString(),
        source: "placeholder",
        note: "Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables for image storage",
      })
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
          const filename = `ai-generated-${timestamp}`

          console.log("[v0] Uploading image to Cloudinary...")

          // Upload to Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  resource_type: "image",
                  public_id: filename,
                  folder: "ai-social-media", // Organize images in a folder
                  format: "png",
                  transformation: [
                    { quality: "auto", fetch_format: "auto" }, // Optimize for web
                  ],
                },
                (error, result) => {
                  if (error) {
                    console.log("[v0] Cloudinary upload error:", error)
                    reject(error)
                  } else {
                    console.log("[v0] Cloudinary upload success:", result.secure_url)
                    resolve(result)
                  }
                },
              )
              .end(buffer)
          })

          const imageUrl = uploadResult.secure_url

          console.log("[v0] Successfully generated and uploaded image to Cloudinary:", imageUrl)

          return Response.json({
            imageUrl,
            prompt,
            generatedAt: new Date().toISOString(),
            source: "huggingface",
            model: "stable-diffusion-3-medium",
            cloudinaryPublicId: uploadResult.public_id,
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
