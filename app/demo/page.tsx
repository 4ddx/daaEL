import Link from "next/link"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { ArrowLeft, Play } from "lucide-react"
export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 test-class">UrbanPulse Demo</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the power of real-time traffic simulation and intelligent routing. This demo showcases the key
            features of our smart city platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Map</CardTitle>
              <CardDescription>Explore our traffic visualization with real-time updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                Click on nodes to set origin and destination, watch as the A* algorithm finds the optimal route
                considering current traffic conditions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Incident Simulation</CardTitle>
              <CardDescription>Create traffic incidents and see their impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-red-50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-red-600 text-2xl">⚠️</span>
                  </div>
                  <p className="text-sm text-red-600">Incident Active</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Simulate accidents, construction, and road closures to test how the routing algorithm adapts to changing
                conditions.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/dashboard">Launch Full Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
