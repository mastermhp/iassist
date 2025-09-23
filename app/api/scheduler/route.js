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

export async function PUT(request) {
  try {
    const { id, status, publishedAt } = await request.json()

    if (!id) {
      return Response.json({ error: "Post ID is required" }, { status: 400 })
    }

    const postIndex = scheduledPosts.findIndex((post) => post.id === id)

    if (postIndex === -1) {
      return Response.json({ error: "Post not found" }, { status: 404 })
    }

    scheduledPosts[postIndex] = {
      ...scheduledPosts[postIndex],
      status: status || scheduledPosts[postIndex].status,
      publishedAt: publishedAt || scheduledPosts[postIndex].publishedAt,
      updatedAt: new Date().toISOString(),
    }

    return Response.json({
      success: true,
      post: scheduledPosts[postIndex],
    })
  } catch (error) {
    console.error("Update scheduler error:", error)
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
