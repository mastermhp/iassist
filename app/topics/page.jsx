import TopicGenerator from "@/components/topic-generator"

export default function TopicsPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full blur-sm animate-pulse-neon" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <header className="border-b border-border/50 glass-effect">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-3xl font-bold text-glow">Topic Generator</h1>
            <p className="text-muted-foreground">AI-powered content topic suggestions for your social media</p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <TopicGenerator />
        </main>
      </div>
    </div>
  )
}
