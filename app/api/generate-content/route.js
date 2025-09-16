import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { platform, topic, tone, includeHashtags, contentType, generateImage } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables." },
        { status: 500 },
      )
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Create dynamic prompt based on parameters
    const prompt = `
    You are an expert social media content creator and AI assistant. Generate engaging ${platform} content with the following specifications:

    Platform: ${platform}
    Topic: ${topic || "general business/tech content"}
    Tone: ${tone || "professional yet engaging"}
    Content Type: ${contentType || "post"}
    Include Hashtags: ${includeHashtags ? "Yes" : "No"}

    Platform-specific guidelines:
    - Instagram: Visual-focused, use emojis, 1-3 sentences max, engaging captions
    - Facebook: Longer form content, storytelling, community engagement
    - Twitter: Concise, witty, trending topics, under 280 characters
    - LinkedIn: Professional, industry insights, thought leadership

    Requirements:
    - Make it authentic and human-like
    - Include a call-to-action when appropriate
    - Use relevant emojis for Instagram and Facebook
    - Keep within platform character limits
    - Make it shareable and engaging
    ${includeHashtags ? "- Include 3-5 relevant hashtags at the end" : ""}
    
    Generate only the post content, no additional explanation.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    let imagePrompt = null
    let generatedImageUrl = null

    if (generateImage || contentType === "image-post" || platform === "Instagram") {
      const imagePromptResult = await model.generateContent(`
        Based on this social media post: "${content}"
        
        Generate a detailed image prompt for AI image generation that would complement this post perfectly. 
        The image should be:
        - Professional and eye-catching
        - Relevant to the content
        - Suitable for ${platform}
        - High quality and engaging
        
        Return only the image prompt, no additional text.
      `)
      const imageResponse = await imagePromptResult.response
      imagePrompt = imageResponse.text()

      try {
        const imageModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" })

        console.log("[v0] Generating image with prompt:", imagePrompt)

        const imageResult = await imageModel.generateContent([
          {
            text: `Generate a high-quality, professional social media image: ${imagePrompt}. Make it visually striking and suitable for ${platform}.`,
          },
        ])

        const imageResponse = await imageResult.response

        if (imageResponse.candidates && imageResponse.candidates[0]) {
          const candidate = imageResponse.candidates[0]
          if (candidate.content && candidate.content.parts) {
            // Look for image data in the response
            const imagePart = candidate.content.parts.find((part) => part.inlineData)
            if (imagePart && imagePart.inlineData) {
              // Convert base64 image to data URL
              generatedImageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
              console.log("[v0] Image generated successfully")
            }
          }
        }

        // Fallback to placeholder if no image was generated
        if (!generatedImageUrl) {
          console.log("[v0] No image data in response, using placeholder")
          generatedImageUrl = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(imagePrompt)}`
        }
      } catch (imageError) {
        console.log("[v0] Image generation failed, using placeholder:", imageError.message)
        generatedImageUrl = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(imagePrompt)}`
      }
    }

    return Response.json({
      content: content.trim(),
      imagePrompt: imagePrompt?.trim(),
      generatedImageUrl,
      platform,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating content:", error)
    return Response.json(
      { error: "Failed to generate content. Please check your API key and try again." },
      { status: 500 },
    )
  }
}
