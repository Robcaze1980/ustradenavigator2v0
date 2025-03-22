import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart3, Globe2, LineChart, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-background pt-16 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-background"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
              US Trade Navigator
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Your comprehensive platform for global trade intelligence. Access real-time trade data,
              market insights, and HS code analytics to make informed decisions.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Globe2 className="h-8 w-8" />}
              title="Global Trade Data"
              description="Access comprehensive trade statistics and trends from markets worldwide."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="HS Code Analytics"
              description="Deep dive into specific HS codes with detailed volume and pricing analysis."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Market Insights"
              description="Stay ahead with real-time market trends and predictive analytics."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform your trade strategy?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of businesses making data-driven decisions with US Trade Navigator.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          {icon}
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
    </Card>
  )
}