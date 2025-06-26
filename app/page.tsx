import Link from "next/link"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { MapPin, Zap, BarChart3, Shield, Github, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">UrbanPulse</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Real-Time Smart City
          <span className="text-blue-600 block">Traffic Intelligence</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Visualize traffic flow, optimize routes with A* pathfinding, and simulate real-time incidents in an
          interactive smart city dashboard powered by advanced algorithms.
        </p>
        <div className="flex justify-center space-x-4">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Start Simulating
              <Zap className="h-5 w-5 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">View Demo</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Powerful Features for Smart Cities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Live Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time traffic flow simulation with WebSocket updates and dynamic incident modeling
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Optimized Routing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                A* pathfinding algorithm finds the most efficient routes considering real-time traffic conditions
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Smart Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simulate accidents, road closures, and congestion to test routing resilience
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive metrics and performance analysis for traffic flow optimization
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your City?</h2>
          <p className="text-xl mb-8 opacity-90">Experience the future of urban traffic management with UrbanPulse</p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dashboard">
              Launch Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="opacity-70">© 2024 UrbanPulse. Built with Next.js, TypeScript, and modern web technologies.</p>
        </div>
      </footer>
    </div>
  )
}
