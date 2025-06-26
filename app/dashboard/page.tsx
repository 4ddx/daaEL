"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import EnhancedGoogleMap from "@/components/EnhancedGoogleMap"
import PathfindingMap from "@/components/PathfindingMap"
import { TrafficControls } from "@/components/TrafficControls"
import { IncidentSimulator } from "@/components/IncidentSimulator"
import { MetricsPanel } from "@/components/MetricsPanel"
import { NavigationPanel } from "@/components/NavigationPanel"
import type { AStarResult } from "@/lib/astar"
import { MapPin, Zap, BarChart3, Navigation, AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/button"
import { Badge } from "@/components/badge"
import Link from "next/link"

export default function DashboardPage() {
  const [pathResult, setPathResult] = useState<AStarResult | null>(null)
  const [activeTab, setActiveTab] = useState("google-maps")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">UrbanPulse Dashboard</h1>
            <p className="text-gray-600">Advanced mapping and traffic intelligence platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">Real-time data • AI-powered routing • Global coverage</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="google-maps" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Google Maps Features</span>
            </TabsTrigger>
            <TabsTrigger value="ai-pathfinding" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>AI Pathfinding</span>
            </TabsTrigger>
          </TabsList>

          {/* Google Maps Tab */}
          <TabsContent value="google-maps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>Complete Google Maps Experience</span>
                </CardTitle>
                <p className="text-gray-600">
                  Full-featured Google Maps with search, directions, street view, layers, and place details
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[700px]">
                  <EnhancedGoogleMap />
                </div>
              </CardContent>
            </Card>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-lg font-bold">Places Search</div>
                  <div className="text-sm text-gray-600">Find any location worldwide</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Navigation className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-lg font-bold">Turn-by-Turn</div>
                  <div className="text-sm text-gray-600">Detailed navigation</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-lg font-bold">Live Traffic</div>
                  <div className="text-sm text-gray-600">Real-time conditions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-lg font-bold">Street View</div>
                  <div className="text-sm text-gray-600">360° imagery</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Pathfinding Tab */}
          <TabsContent value="ai-pathfinding" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Controls */}
              <div className="lg:col-span-1 space-y-6">
                <NavigationPanel />
                <TrafficControls />
              </div>

              {/* Main Map Area */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <span>AI-Powered Pathfinding</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[600px]">
                      <PathfindingMap onPathFound={setPathResult} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - Analytics */}
              <div className="lg:col-span-1 space-y-6">
                <MetricsPanel />
                <IncidentSimulator />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">A*</div>
                  <div className="text-sm text-gray-600">Algorithm</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">50+</div>
                  <div className="text-sm text-gray-600">Cities</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">Real-time</div>
                  <div className="text-sm text-gray-600">Updates</div>
                </CardContent>
              </Card>
              {pathResult && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{pathResult.totalDistance.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">km Distance</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Pathfinding Section */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Navigation className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Pathfinding</h3>
                  <p className="text-sm text-gray-600">Intelligent route optimization</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/pathfinding">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Pathfinder
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">A*</div>
                  <div className="text-xs text-gray-600">Heuristic Search</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Dijkstra</div>
                  <div className="text-xs text-gray-600">Optimal Paths</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">Bellman-Ford</div>
                  <div className="text-xs text-gray-600">Robust Algorithm</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Bangalore Network</span>
                  <Badge variant="secondary">25+ Locations</Badge>
                </div>
                <div className="text-xs text-gray-600">
                  Real-time pathfinding across major Bangalore locations including MG Road, Koramangala, Whitefield, and
                  Electronic City.
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">System Ready</span>
                </div>
                <span className="text-gray-500">Last updated: Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
