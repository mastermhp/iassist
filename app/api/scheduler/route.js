// Scheduler API for managing automated posts
let scheduledPosts = [] // In production, this would be stored in a database

export async function GET() {
  return Response.json({
    scheduledPosts: scheduledPosts.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime)),
  })
}

export async function POST(request) {
  try {
    const { content, imageUrl, platforms, scheduledTime, recurring, topic, tone } = await request.json()

    const newPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      imageUrl: imageUrl || null,
      platforms,
      scheduledTime,
      recurring: recurring || null,
      topic: topic || null,
      tone: tone || null,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    }

    scheduledPosts.push(newPost)

    return Response.json({
      success: true,
      post: newPost,
    })
  } catch (error) {
    console.error("Scheduler error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("id")

    if (!postId) {
      return Response.json({ error: "Post ID is required" }, { status: 400 })
    }

    scheduledPosts = scheduledPosts.filter((post) => post.id !== postId)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Delete scheduler error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
