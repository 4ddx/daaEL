"use client"

import { useMemo } from "react"
import { AStar } from "@/lib/pathfinding"
import { useTrafficStore } from "@/lib/store"
import type { Route, RouteStep } from "@/types/navigation"

export function usePathfinding() {
  const { graph, selectedOrigin, selectedDestination, routePreferences, edges } = useTrafficStore()

  const pathfinder = useMemo(() => new AStar(graph), [graph])

  const findRoute = useMemo(() => {
    if (!selectedOrigin || !selectedDestination) return null

    // Apply route preferences to modify edge weights
    const modifiedGraph = { ...graph }
    const modifiedEdges = new Map(graph.edges)

    // Modify edge weights based on preferences
    for (const [edgeId, edge] of graph.edges) {
      let weight = edge.currentWeight

      // Apply traffic avoidance
      if (routePreferences.avoidTraffic) {
        if (edge.trafficLevel === "heavy") weight *= 2.0
        if (edge.trafficLevel === "blocked") weight *= 10.0
        if (edge.trafficLevel === "moderate") weight *= 1.3
      }

      // Apply highway preference
      if (routePreferences.preferHighways && edge.roadType === "highway") {
        weight *= 0.7 // Prefer highways
      } else if (!routePreferences.preferHighways && edge.roadType === "highway") {
        weight *= 1.2 // Avoid highways
      }

      // Apply route type preference
      switch (routePreferences.routeType) {
        case "fastest":
          // Prioritize speed over distance
          weight = weight / (edge.speedLimit / 35) // Normalize by speed
          break
        case "shortest":
          // Prioritize distance
          weight = edge.distance
          break
        case "balanced":
          // Balance between time and distance
          weight = (weight + edge.distance) / 2
          break
      }

      modifiedEdges.set(edgeId, { ...edge, currentWeight: weight })
    }

    modifiedGraph.edges = modifiedEdges
    const modifiedPathfinder = new AStar(modifiedGraph)

    const result = modifiedPathfinder.findPath(selectedOrigin, selectedDestination)
    if (!result) return null

    // Convert to Route format with detailed steps
    const steps: RouteStep[] = result.edges.map((edge, index) => {
      const fromNode = graph.nodes.get(edge.from)
      const toNode = graph.nodes.get(edge.to)

      let instruction = `Continue on ${edge.roadType} road`
      if (fromNode && toNode) {
        instruction = `From ${fromNode.name} to ${toNode.name} via ${edge.roadType}`
      }

      // Add traffic warnings
      if (edge.trafficLevel === "heavy") {
        instruction += " (Heavy traffic expected)"
      } else if (edge.trafficLevel === "blocked") {
        instruction += " (Road blocked - finding alternative)"
      } else if (edge.trafficLevel === "moderate") {
        instruction += " (Moderate traffic)"
      }

      return {
        instruction,
        distance: edge.distance,
        duration: (edge.distance / (edge.speedLimit * 0.6)) * 60, // Convert to minutes
        edgeId: edge.id,
        maneuver: index === 0 ? "straight" : "straight", // Simplified for demo
      }
    })

    // Calculate realistic metrics
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)
    const baseTime = (result.totalDistance / 50) * 60 // Base time at 50 km/h
    const trafficDelay = Math.max(0, totalDuration - baseTime)

    // Calculate sustainability score based on efficiency
    const sustainabilityScore = Math.max(
      0,
      Math.min(
        100,
        100 -
          (trafficDelay / totalDuration) * 100 -
          result.edges.filter((e) => e.trafficLevel === "heavy" || e.trafficLevel === "blocked").length * 10,
      ),
    )

    const route: Route = {
      id: `route-${Date.now()}`,
      path: result.path,
      steps,
      totalDistance: result.totalDistance,
      totalDuration: totalDuration,
      trafficDelay,
      sustainabilityScore,
    }

    return route
  }, [pathfinder, selectedOrigin, selectedDestination, routePreferences, graph, edges])

  // Find alternative routes
  const findAlternativeRoutes = useMemo(() => {
    if (!selectedOrigin || !selectedDestination) return []

    const alternatives: Route[] = []

    // Generate alternative routes by modifying preferences
    const alternativePreferences = [
      { ...routePreferences, routeType: "shortest" as const },
      { ...routePreferences, routeType: "fastest" as const },
      { ...routePreferences, preferHighways: !routePreferences.preferHighways },
    ]

    alternativePreferences.forEach((prefs, index) => {
      // This would use the same logic as findRoute but with different preferences
      // For demo purposes, we'll create simplified alternatives
      if (findRoute) {
        const altRoute: Route = {
          ...findRoute,
          id: `alt-route-${index}`,
          totalDuration: findRoute.totalDuration * (0.9 + Math.random() * 0.3),
          totalDistance: findRoute.totalDistance * (0.95 + Math.random() * 0.1),
          sustainabilityScore: Math.max(0, findRoute.sustainabilityScore + (Math.random() - 0.5) * 20),
        }
        altRoute.trafficDelay = Math.max(0, altRoute.totalDuration - (altRoute.totalDistance / 50) * 60)
        alternatives.push(altRoute)
      }
    })

    return alternatives.slice(0, 2) // Return top 2 alternatives
  }, [findRoute, selectedOrigin, selectedDestination, routePreferences])

  return { findRoute, findAlternativeRoutes, pathfinder }
}
