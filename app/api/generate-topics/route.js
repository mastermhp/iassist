export async function POST(request) {
  try {
    const { pageId, accessToken, userInterests, brandVoice, contentType = "general" } = await request.json()

    console.log("[v0] Generating topics for page:", pageId)

    // Base topics for different content types
    const baseTopics = {
      general: [
        "Industry trends and insights",
        "Behind-the-scenes content",
        "Customer success stories",
        "Tips and best practices",
        "Company culture and values",
        "Product updates and features",
        "Educational content",
        "Community engagement",
      ],
      business: [
        "Entrepreneurship journey",
        "Business growth strategies",
        "Leadership insights",
        "Market analysis",
        "Productivity tips",
        "Team building",
        "Innovation in business",
        "Customer relationship management",
      ],
      tech: [
        "AI and machine learning trends",
        "Software development insights",
        "Tech industry news",
        "Coding best practices",
        "Digital transformation",
        "Cybersecurity awareness",
        "Emerging technologies",
        "Tech career advice",
      ],
      creative: [
        "Design inspiration",
        "Creative process insights",
        "Art and creativity tips",
        "Visual storytelling",
        "Brand aesthetics",
        "Creative tools and resources",
        "Artistic techniques",
        "Creative collaboration",
      ],
    }

    // Try to analyze page content if Facebook API is available
    let pageAnalysis = null
    if (pageId && accessToken) {
      try {
        console.log("[v0] Analyzing Facebook page content")

        // Fetch recent posts to understand content patterns
        const postsResponse = await fetch(
          `https://graph.facebook.com/${pageId}/posts?fields=message,created_time,engagement&limit=10&access_token=${accessToken}`,
        )

        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          pageAnalysis = {
            recentPosts: postsData.data?.length || 0,
            avgEngagement:
              postsData.data?.reduce((acc, post) => acc + (post.engagement?.count || 0), 0) /
              (postsData.data?.length || 1),
            contentThemes: extractThemes(postsData.data || []),
          }
          console.log("[v0] Page analysis completed:", pageAnalysis)
        }
      } catch (error) {
        console.log("[v0] Page analysis failed:", error.message)
      }
    }

    // Generate personalized topics based on analysis and user preferences
    const personalizedTopics = generatePersonalizedTopics({
      baseTopics: baseTopics[contentType] || baseTopics.general,
      userInterests: userInterests || [],
      brandVoice: brandVoice || "professional",
      pageAnalysis,
    })

    // Generate trending topics based on current date and season
    const trendingTopics = generateTrendingTopics()

    // Combine and rank topics
    const allTopics = [
      ...personalizedTopics.map((topic) => ({ ...topic, category: "personalized" })),
      ...trendingTopics.map((topic) => ({ ...topic, category: "trending" })),
      ...(baseTopics[contentType]?.slice(0, 5).map((topic) => ({
        topic,
        relevance: 0.7,
        category: "general",
        description: `General ${contentType} content about ${topic.toLowerCase()}`,
      })) || []),
    ]

    // Sort by relevance and limit results
    const rankedTopics = allTopics.sort((a, b) => (b.relevance || 0.5) - (a.relevance || 0.5)).slice(0, 15)

    console.log("[v0] Generated", rankedTopics.length, "topic suggestions")

    return Response.json({
      topics: rankedTopics,
      pageAnalysis,
      generatedAt: new Date().toISOString(),
      totalSuggestions: rankedTopics.length,
    })
  } catch (error) {
    console.error("Error generating topics:", error)
    return Response.json({ error: "Failed to generate topics" }, { status: 500 })
  }
}

function extractThemes(posts) {
  // Simple keyword extraction from post messages
  const keywords = {}

  posts.forEach((post) => {
    if (post.message) {
      const words = post.message
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .filter((word) => !["this", "that", "with", "from", "they", "have", "been", "will"].includes(word))

      words.forEach((word) => {
        keywords[word] = (keywords[word] || 0) + 1
      })
    }
  })

  return Object.entries(keywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, frequency: count }))
}

function generatePersonalizedTopics({ baseTopics, userInterests, brandVoice, pageAnalysis }) {
  const topics = []

  // Generate topics based on user interests
  userInterests.forEach((interest) => {
    topics.push({
      topic: `${interest} insights and trends`,
      relevance: 0.9,
      description: `Share your expertise and insights about ${interest}`,
      suggestedTone: brandVoice,
    })

    topics.push({
      topic: `How ${interest} is changing the industry`,
      relevance: 0.85,
      description: `Discuss the impact of ${interest} on your industry`,
      suggestedTone: "professional",
    })
  })

  // Generate topics based on page analysis
  if (pageAnalysis?.contentThemes) {
    pageAnalysis.contentThemes.slice(0, 3).forEach((theme) => {
      topics.push({
        topic: `Deep dive into ${theme.word}`,
        relevance: 0.8,
        description: `Expand on ${theme.word} based on your previous content`,
        suggestedTone: brandVoice,
      })
    })
  }

  return topics
}

function generateTrendingTopics() {
  const currentDate = new Date()
  const month = currentDate.getMonth()
  const topics = []

  // Seasonal topics
  const seasonalTopics = {
    0: ["New Year resolutions for business", "Planning for the year ahead"], // January
    1: ["Valentine's Day marketing ideas", "Building customer relationships"], // February
    2: ["Spring cleaning your business processes", "Fresh starts and new beginnings"], // March
    3: ["April productivity tips", "Spring growth strategies"], // April
    4: ["May motivation and team building", "Celebrating achievements"], // May
    5: ["Summer business strategies", "Mid-year review and planning"], // June
    6: ["Summer productivity hacks", "Vacation and work-life balance"], // July
    7: ["August automation and efficiency", "Preparing for fall season"], // August
    8: ["Back-to-school business lessons", "September fresh starts"], // September
    9: ["October optimization strategies", "Preparing for year-end"], // October
    10: ["November gratitude and reflection", "Thanksgiving customer appreciation"], // November
    11: ["Year-end review and 2025 planning", "Holiday business strategies"], // December
  }

  const currentTopics = seasonalTopics[month] || []
  currentTopics.forEach((topic) => {
    topics.push({
      topic,
      relevance: 0.75,
      description: `Timely content for ${currentDate.toLocaleString("default", { month: "long" })}`,
      suggestedTone: "engaging",
    })
  })

  // Weekly trending topics
  const weeklyTopics = [
    "Monday motivation and goal setting",
    "Tuesday tips and tutorials",
    "Wednesday wisdom and insights",
    "Thursday thoughts and discussions",
    "Friday features and highlights",
    "Weekend wrap-up and reflection",
  ]

  const dayOfWeek = currentDate.getDay()
  if (weeklyTopics[dayOfWeek]) {
    topics.push({
      topic: weeklyTopics[dayOfWeek],
      relevance: 0.7,
      description: `Perfect for ${currentDate.toLocaleString("default", { weekday: "long" })} posting`,
      suggestedTone: "casual",
    })
  }

  return topics
}
