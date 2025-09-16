import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const COMPANY_PROFILE = `
I'm a professional web developer specializing in MERN stack with expertise in Next.js, Node.js, MongoDB, Vercel, and Cloudinary. 
I work on international and national level projects and also have experience in app development through Flutter. 
I'm fully professional in AI development for web and apps using Gemini and ChatGPT to build various AI products. 
I'm mostly engaged in AI-based projects and have started developing my own game using Unreal Engine under my game studio banner. 
I'm building a complete IT sector connected with web apps and games, and I'm actively searching for professional co-founders or teammates to build something big in the IT sector and create extraordinary innovations.
`

export async function POST(request) {
  try {
    const { platform, topic, tone, includeHashtags, contentType, generateImage } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables." },
        { status: 500 },
      )
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `
    You are creating social media content for a professional web developer and AI specialist. Here's the company profile:
    
    ${COMPANY_PROFILE}
    
    Create engaging ${platform} content with these specifications:
    Platform: ${platform}
    Topic: ${topic || "AI development, web development, or seeking co-founders"}
    Tone: ${tone || "professional yet engaging"}
    Content Type: ${contentType || "post"}
    Include Hashtags: ${includeHashtags ? "Yes" : "No"}

    Content themes to focus on:
    - AI development expertise and projects
    - MERN stack and Next.js development
    - Game development with Unreal Engine
    - Looking for co-founders and teammates
    - IT sector innovations and ideas
    - Professional achievements and capabilities
    - Technology trends and insights

    Platform-specific guidelines:
    - Instagram: Visual-focused, use emojis, engaging captions about tech achievements
    - Facebook: Storytelling about projects, seeking collaborations, professional journey
    - Twitter: Tech insights, quick tips, networking for co-founders
    - LinkedIn: Professional achievements, seeking partnerships, industry expertise

    Requirements:
    - Make it authentic and reflect the developer's expertise
    - Include call-to-action for collaboration or networking
    - Use relevant tech emojis for Instagram and Facebook
    - Keep within platform character limits
    - Make it shareable and professional
    - Focus on building connections and showcasing expertise
    ${includeHashtags ? "- Include 5-8 relevant hashtags like #WebDeveloper #AI #NextJS #MERN #GameDev #CoFounder #TechInnovation" : ""}
    
    Generate only the post content, no additional explanation.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    let imagePrompt = null
    let generatedImageUrl = null

    if (generateImage || contentType === "image-post" || platform === "instagram") {
      const imagePromptResult = await model.generateContent(`
        Based on this social media post: "${content}"
        
        Generate a detailed image prompt for AI image generation that represents a professional web developer and AI specialist. 
        The image should be:
        - Professional tech/AI themed (coding, futuristic, modern workspace)
        - High-tech aesthetic with modern design elements
        - Include elements like: code screens, AI symbols, modern workspace, tech gadgets
        - Color scheme: modern blues, teals, purples, or professional gradients
        - Suitable for ${platform} and tech audience
        - Convey innovation, expertise, and professionalism
        - Include visual elements related to web development, AI, or game development
        
        Return only the image prompt, no additional text.
      `)
      const imageResponse = await imagePromptResult.response
      imagePrompt = imageResponse.text()

      try {
        console.log("[v0] Generating tech-themed image with prompt:", imagePrompt)

        const imageModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

        const imageResult = await imageModel.generateContent([
          {
            text: `Generate a high-quality, professional tech/AI themed image: ${imagePrompt}. Make it modern, sleek, and suitable for a professional developer's social media. Include elements like coding interfaces, AI symbols, or modern tech workspace.`,
          },
        ])

        const imageResponse = await imageResult.response

        if (imageResponse.candidates && imageResponse.candidates[0]) {
          const candidate = imageResponse.candidates[0]
          if (candidate.content && candidate.content.parts) {
            const imagePart = candidate.content.parts.find((part) => part.inlineData)
            if (imagePart && imagePart.inlineData) {
              generatedImageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
              console.log("[v0] Tech image generated successfully")
            }
          }
        }

        if (!generatedImageUrl) {
          console.log("[v0] No image data in response, using tech-themed placeholder")
          const encodedPrompt = encodeURIComponent("Professional web developer AI specialist modern tech workspace")
          generatedImageUrl = `/placeholder.svg?height=400&width=600&query=${encodedPrompt}`
        }
      } catch (imageError) {
        console.log("[v0] Image generation failed, using tech placeholder:", imageError.message)
        const encodedPrompt = encodeURIComponent("Professional developer AI technology modern workspace")
        generatedImageUrl = `/placeholder.svg?height=400&width=600&query=${encodedPrompt}`
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
