import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const COMPANY_PROFILE = `
I'm a professional web developer and AI specialist with expertise in:

🚀 TECHNICAL SKILLS:
- MERN Stack (MongoDB, Express, React, Node.js)
- Next.js, TypeScript, and modern web frameworks
- AI Development using Gemini AI and ChatGPT APIs
- Flutter for cross-platform mobile development
- Game development with Unreal Engine
- Cloud platforms: Vercel, AWS, Google Cloud
- Database management and API development

💼 PROFESSIONAL EXPERIENCE:
- Working on international and national level projects
- Building AI-powered web applications and mobile apps
- Developing innovative solutions for businesses
- Creating automated systems and intelligent workflows

🎮 CURRENT PROJECTS:
- Developing games under my own game studio
- Building comprehensive IT solutions
- Creating AI-based automation tools
- Working on social media automation platforms

🤝 SEEKING COLLABORATION:
- Looking for professional co-founders and teammates
- Building something extraordinary in the IT sector
- Open to partnerships for innovative tech projects
- Interested in creating revolutionary solutions
`

export async function POST(request) {
  try {
    const { platform, topic, tone, includeHashtags, contentType, generateImage } = await request.json()

    console.log("[v0] Content generation request:", {
      platform,
      topic,
      tone,
      includeHashtags,
      contentType,
      generateImage,
    })

    if (!process.env.GEMINI_API_KEY) {
      console.log("[v0] ERROR: GEMINI_API_KEY not found in environment variables")
      return Response.json(
        { error: "Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables." },
        { status: 500 },
      )
    }

    console.log("[v0] GEMINI_API_KEY found, length:", process.env.GEMINI_API_KEY.length)

    let model
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })
      console.log("[v0] Using model: gemini-2.5-pro")
    } catch (modelError) {
      console.log("[v0] Failed to load gemini-2.5-pro, trying gemini-2.5-flash")
      try {
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
        console.log("[v0] Using fallback model: gemini-2.5-flash")
      } catch (fallbackError) {
        console.log("[v0] Failed to load gemini-2.5-flash, trying gemini-2.5-flash-lite")
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })
        console.log("[v0] Using fallback model: gemini-2.5-flash-lite")
      }
    }

    const prompt = `
    You are creating social media content for a professional web developer and AI specialist. Here's the company profile:
    
    ${COMPANY_PROFILE}
    
    Create ONE engaging ${platform} post with these specifications:
    Platform: ${platform}
    Topic: ${topic || "AI development, web development, or seeking co-founders"}
    Tone: ${tone || "professional yet engaging"}
    Content Type: ${contentType || "post"}
    Include Hashtags: ${includeHashtags ? "Yes" : "No"}

    IMPORTANT FORMATTING REQUIREMENTS:
    - Generate ONLY ONE complete post, not multiple options
    - Use proper emojis throughout the content (🚀 🧠 💻 🎮 ⚡ 🌟 ✨ 🔥 💡 🎯)
    - Structure the post with proper line breaks and spacing
    - Make it engaging and professional
    - Include a clear call-to-action
    - Use relevant tech emojis for visual appeal

    Content themes to focus on:
    - AI development expertise and projects 🧠
    - MERN stack and Next.js development 💻
    - Game development with Unreal Engine 🎮
    - Looking for co-founders and teammates 🤝
    - IT sector innovations and ideas 💡
    - Professional achievements and capabilities ⚡
    - Technology trends and insights 🔥

    Platform-specific guidelines:
    - Instagram: Visual-focused, use plenty of emojis, engaging captions about tech achievements
    - Facebook: Storytelling about projects, seeking collaborations, professional journey with emojis
    - Twitter: Tech insights, quick tips, networking for co-founders with relevant emojis
    - LinkedIn: Professional achievements, seeking partnerships, industry expertise with subtle emojis

    Requirements:
    - Make it authentic and reflect the developer's expertise
    - Include call-to-action for collaboration or networking
    - Use relevant tech emojis throughout the post
    - Keep within platform character limits
    - Make it shareable and professional
    - Focus on building connections and showcasing expertise
    - Format with proper line breaks and structure
    ${includeHashtags ? "- Include 5-8 relevant hashtags like #WebDeveloper #AI #NextJS #MERN #GameDev #CoFounder #TechInnovation" : ""}
    
    Generate ONLY the final post content with proper formatting and emojis. Do not include "Option 1", "Option 2", or any additional explanations.
    `

    console.log("[v0] Generating content with prompt length:", prompt.length)

    let result, response, content
    try {
      result = await model.generateContent(prompt)
      console.log("[v0] Content generation completed")

      response = await result.response
      console.log("[v0] Response received")

      content = response.text()
      console.log("[v0] Content extracted, length:", content.length)
    } catch (genError) {
      console.log("[v0] Content generation failed:", genError.message)
      console.log("[v0] Full error:", genError)
      throw new Error(`Content generation failed: ${genError.message}`)
    }

    content = content
      .replace(/\*Option \d+.*?\*:/gi, "") // Remove option headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
      .replace(/^\s*Image:.*$/gm, "") // Remove image descriptions
      .replace(/^\s*Caption:.*$/gm, "") // Remove caption labels
      .replace(/\n{3,}/g, "\n\n") // Clean up excessive line breaks
      .trim()

    console.log("[v0] Content cleaned and formatted, final length:", content.length)

    const imagePrompt = null
    let generatedImageUrl = null

    if (generateImage || contentType === "image-post" || platform === "instagram") {
      console.log("[v0] Skipping complex image generation, using placeholder")
      const encodedPrompt = encodeURIComponent("Professional web developer AI specialist modern tech workspace")
      generatedImageUrl = `/placeholder.svg?height=400&width=600&query=${encodedPrompt}`
    }

    console.log("[v0] Content generation successful")

    return Response.json({
      content: content.trim(),
      imagePrompt: imagePrompt?.trim(),
      generatedImageUrl,
      platform,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error generating content:", error)
    console.error("[v0] Full error details:", error.stack)
    return Response.json({ error: `Failed to generate content: ${error.message}` }, { status: 500 })
  }
}
