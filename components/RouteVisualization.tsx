"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Progress } from "@/components/progress"
import { useTrafficStore } from "@/lib/store"
import { usePathfinding } from "@/hooks/usePathfinding"
import { Map, Clock, Navigation, Zap, AlertTriangle, CheckCircle } from "lucide-react"

export function RouteVisualization() {
  const { currentRoute, setCurrentRoute } = useTrafficStore()
  const { findAlternativeRoutes } = usePathfinding()

  if (!currentRoute) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Map className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium">No route selected</p>
        <p className="text-xs">Select origin and destination to see route options</p>
      </div>
    )
  }

  const alternatives = findAlternativeRoutes

  const getRouteQuality = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-600 bg-green-50", icon: CheckCircle }
    if (score >= 60) return { label: "Good", color: "text-blue-600 bg-blue-50", icon: Navigation }
    if (score >= 40) return { label: "Fair", color: "text-yellow-600 bg-yellow-50", icon: Clock }
    return { label: "Poor", color: "text-red-600 bg-red-50", icon: AlertTriangle }
  }

  const quality = getRouteQuality(currentRoute.sustainabilityScore)
  const QualityIcon = quality.icon

  return (
    <div className="space-y-4">
      {/* Main Route */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center space-x-2">
              <Map className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800">Recommended Route</span>
            </div>
            <Badge className={`text-xs ${quality.color} border`}>
              <QualityIcon className="h-3 w-3 mr-1" />
              {quality.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Route Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-white rounded border">
              <div className="text-lg font-bold text-blue-600">{currentRoute.totalDistance.toFixed(1)}</div>
              <div className="text-xs text-gray-600">km</div>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="text-lg font-bold text-green-600">{Math.round(currentRoute.totalDuration)}</div>
              <div className="text-xs text-gray-600">min</div>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="text-lg font-bold text-orange-600">{Math.round(currentRoute.trafficDelay)}</div>
              <div className="text-xs text-gray-600">delay</div>
            </div>
          </div>

          {/* Efficiency Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Route Efficiency</span>
              <span className="text-blue-600 font-bold">{Math.round(currentRoute.sustainabilityScore)}%</span>
            </div>
            <Progress value={currentRoute.sustainabilityScore} className="h-2" />
          </div>

          {/* Route Steps Preview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Route Overview</h4>
            <div className="bg-white rounded border p-3 max-h-32 overflow-y-auto">
              <div className="space-y-2 text-xs">
                {currentRoute.steps.slice(0, 3).map((step, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="bg-blue-100 text-blue-600 rounded px-1 min-w-[16px] text-center font-mono">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-gray-700">{step.instruction}</span>
                  </div>
                ))}
                {currentRoute.steps.length > 3 && (
                  <div className="text-center text-gray-500 pt-1">+{currentRoute.steps.length - 3} more steps</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Routes */}
      {alternatives.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Alternative Routes</h4>
          {alternatives.map((route, index) => {
            const altQuality = getRouteQuality(route.sustainabilityScore)
            const AltIcon = altQuality.icon

            return (
              <Card key={route.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Alternative {index + 1}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${altQuality.color}`}>
                      <AltIcon className="h-3 w-3 mr-1" />
                      {altQuality.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                    <div>
                      <div className="font-bold text-gray-700">{route.totalDistance.toFixed(1)} km</div>
                      <div className="text-gray-500">Distance</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-700">{Math.round(route.totalDuration)} min</div>
                      <div className="text-gray-500">Time</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-700">{Math.round(route.trafficDelay)} min</div>
                      <div className="text-gray-500">Delay</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentRoute(route)}
                    className="w-full h-8 text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Use This Route
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
