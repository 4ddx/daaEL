"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Progress } from "@/components/progress"
import { Badge } from "@/components/badge"
import { useTrafficStore } from "@/lib/store"
import { BarChart3, TrendingUp, TrendingDown, Activity, Clock, Zap, Gauge, AlertTriangle, Map } from "lucide-react"

export function MetricsPanel() {
  const { edges, incidents, currentRoute, isSimulationRunning, trafficDensity, timeOfDay } = useTrafficStore()

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const totalEdges = edges.length
    const freeFlowEdges = edges.filter((e) => e.trafficLevel === "free").length
    const lightTrafficEdges = edges.filter((e) => e.trafficLevel === "light").length
    const moderateTrafficEdges = edges.filter((e) => e.trafficLevel === "moderate").length
    const heavyTrafficEdges = edges.filter((e) => e.trafficLevel === "heavy").length
    const blockedEdges = edges.filter((e) => e.trafficLevel === "blocked").length

    const averageWeight = edges.reduce((sum, e) => sum + e.currentWeight, 0) / totalEdges || 0
    const networkEfficiency = Math.max(0, 100 - (blockedEdges * 25 + heavyTrafficEdges * 15 + moderateTrafficEdges * 5))
    const incidentImpact = Math.min(100, incidents.length * 20)
    const congestionLevel = ((heavyTrafficEdges + blockedEdges) / totalEdges) * 100

    return {
      totalEdges,
      freeFlowEdges,
      lightTrafficEdges,
      moderateTrafficEdges,
      heavyTrafficEdges,
      blockedEdges,
      averageWeight,
      networkEfficiency,
      incidentImpact,
      congestionLevel,
    }
  }, [edges, incidents])

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return "text-green-600 bg-green-50"
    if (efficiency >= 60) return "text-yellow-600 bg-yellow-50"
    if (efficiency >= 40) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 70) return <TrendingUp className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span>Traffic Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalEdges}</div>
            <div className="text-xs text-blue-700 font-medium">Total Roads</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{incidents.length}</div>
            <div className="text-xs text-red-700 font-medium">Active Incidents</div>
          </div>
        </div>

        {/* Network Efficiency */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Network Efficiency</span>
              {getEfficiencyIcon(metrics.networkEfficiency)}
            </div>
            <Badge className={`text-xs ${getEfficiencyColor(metrics.networkEfficiency)}`}>
              {metrics.networkEfficiency.toFixed(0)}%
            </Badge>
          </div>
          <Progress value={metrics.networkEfficiency} className="h-3" />
          <div className="text-xs text-gray-600">Based on traffic flow and incident impact</div>
        </div>

        {/* Congestion Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Congestion Level</span>
            <Badge
              variant={
                metrics.congestionLevel > 50 ? "destructive" : metrics.congestionLevel > 25 ? "secondary" : "default"
              }
              className="text-xs"
            >
              {metrics.congestionLevel.toFixed(0)}%
            </Badge>
          </div>
          <Progress value={metrics.congestionLevel} className="h-3" />
        </div>

        {/* Traffic Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Traffic Distribution</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Free Flow</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{metrics.freeFlowEdges}</span>
                <Badge variant="outline" className="text-xs">
                  {((metrics.freeFlowEdges / metrics.totalEdges) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-lime-500 rounded"></div>
                <span>Light</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{metrics.lightTrafficEdges}</span>
                <Badge variant="outline" className="text-xs">
                  {((metrics.lightTrafficEdges / metrics.totalEdges) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Moderate</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{metrics.moderateTrafficEdges}</span>
                <Badge variant="outline" className="text-xs">
                  {((metrics.moderateTrafficEdges / metrics.totalEdges) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Heavy</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{metrics.heavyTrafficEdges}</span>
                <Badge variant="outline" className="text-xs">
                  {((metrics.heavyTrafficEdges / metrics.totalEdges) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Blocked</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{metrics.blockedEdges}</span>
                <Badge variant="outline" className="text-xs">
                  {((metrics.blockedEdges / metrics.totalEdges) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Current Route Performance */}
        {currentRoute && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium mb-3 flex items-center text-green-800">
              <Map className="h-4 w-4 mr-2" />
              Active Route Performance
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">{currentRoute.totalDistance.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{Math.round(currentRoute.totalDuration)} min</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Delay:</span>
                  <span className="font-medium">{Math.round(currentRoute.trafficDelay)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Efficiency:</span>
                  <span className="font-medium">{Math.round(currentRoute.sustainabilityScore)}%</span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={currentRoute.sustainabilityScore} className="h-2" />
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">System Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <Activity className={`h-4 w-4 ${isSimulationRunning ? "text-green-500" : "text-gray-400"}`} />
                <span className="text-sm">Simulation</span>
              </div>
              <Badge variant={isSimulationRunning ? "default" : "secondary"}>
                {isSimulationRunning ? "Running" : "Paused"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Time of Day</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {timeOfDay}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <Gauge className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Traffic Density</span>
              </div>
              <Badge variant="outline">{trafficDensity}%</Badge>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center mb-1">
              <Zap className="h-4 w-4 text-purple-600 mr-1" />
            </div>
            <div className="text-lg font-bold text-purple-600">{metrics.averageWeight.toFixed(1)}</div>
            <div className="text-xs text-purple-700 font-medium">Avg Weight</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="h-4 w-4 text-orange-600 mr-1" />
            </div>
            <div className="text-lg font-bold text-orange-600">{metrics.incidentImpact.toFixed(0)}%</div>
            <div className="text-xs text-orange-700 font-medium">Impact Level</div>
          </div>
        </div>

        {/* Real-time Updates */}
        <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <h4 className="text-sm font-medium mb-2 text-indigo-800">Real-time Insights</h4>
          <div className="space-y-1 text-xs text-indigo-700">
            <p>
              • Network efficiency:{" "}
              {metrics.networkEfficiency > 70 ? "Good" : metrics.networkEfficiency > 40 ? "Fair" : "Poor"}
            </p>
            <p>
              • Traffic flow:{" "}
              {metrics.congestionLevel < 25 ? "Smooth" : metrics.congestionLevel < 50 ? "Moderate" : "Congested"}
            </p>
            <p>• Incident impact: {incidents.length === 0 ? "None" : incidents.length < 3 ? "Low" : "High"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
