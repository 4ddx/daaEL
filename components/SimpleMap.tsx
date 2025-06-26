"use client"

import { useEffect, useRef } from "react"
import { useTrafficStore } from "@/lib/store"
import { TRAFFIC_COLORS } from "@/lib/constants"

export default function SimpleMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { nodes, edges, currentRoute, selectedOrigin, selectedDestination, customMapCoordinates, initializeGraph } =
    useTrafficStore()

  // Initialize graph data
  useEffect(() => {
    initializeGraph()
  }, [initializeGraph])

  // Draw the map
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Calculate bounds
    const padding = 50

    // Use custom coordinates if available, otherwise use node coordinates
    let minLat, maxLat, minLng, maxLng

    if (customMapCoordinates && customMapCoordinates.length > 0) {
      minLat = Math.min(...customMapCoordinates.map((coord) => coord.lat)) - 0.05
      maxLat = Math.max(...customMapCoordinates.map((coord) => coord.lat)) + 0.05
      minLng = Math.min(...customMapCoordinates.map((coord) => coord.lng)) - 0.05
      maxLng = Math.max(...customMapCoordinates.map((coord) => coord.lng)) + 0.05
    } else {
      minLat = Math.min(...nodes.map((n) => n.coordinates[0])) - 0.01
      maxLat = Math.max(...nodes.map((n) => n.coordinates[0])) + 0.01
      minLng = Math.min(...nodes.map((n) => n.coordinates[1])) - 0.01
      maxLng = Math.max(...nodes.map((n) => n.coordinates[1])) + 0.01
    }

    // Convert lat/lng to canvas coordinates
    const latToY = (lat: number) => padding + ((maxLat - lat) / (maxLat - minLat)) * (canvas.height - 2 * padding)
    const lngToX = (lng: number) => padding + ((lng - minLng) / (maxLng - minLng)) * (canvas.width - 2 * padding)

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from)
      const toNode = nodes.find((n) => n.id === edge.to)

      if (!fromNode || !toNode) return

      const fromX = lngToX(fromNode.coordinates[1])
      const fromY = latToY(fromNode.coordinates[0])
      const toX = lngToX(toNode.coordinates[1])
      const toY = latToY(toNode.coordinates[0])

      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.strokeStyle = TRAFFIC_COLORS[edge.trafficLevel]
      ctx.lineWidth = edge.trafficLevel === "blocked" ? 6 : edge.trafficLevel === "heavy" ? 4 : 2
      ctx.stroke()
    })

    // Draw current route
    if (currentRoute && currentRoute.path.length > 1) {
      ctx.beginPath()
      currentRoute.path.forEach((nodeId, index) => {
        const node = nodes.find((n) => n.id === nodeId)
        if (!node) return

        const x = lngToX(node.coordinates[1])
        const y = latToY(node.coordinates[0])

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 5
      ctx.setLineDash([10, 5])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw nodes
    nodes.forEach((node) => {
      const x = lngToX(node.coordinates[1])
      const y = latToY(node.coordinates[0])

      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)

      if (node.id === selectedOrigin) {
        ctx.fillStyle = "#22c55e"
      } else if (node.id === selectedDestination) {
        ctx.fillStyle = "#ef4444"
      } else {
        ctx.fillStyle = "#6b7280"
      }

      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Draw node labels
      ctx.fillStyle = "#000000"
      ctx.font = "11px Arial"
      ctx.textAlign = "center"
      ctx.fillText(node.name, x, y - 10)
    })

    // Draw custom coordinates if available
    if (customMapCoordinates) {
      customMapCoordinates.forEach((coord, index) => {
        const x = lngToX(coord.lng)
        const y = latToY(coord.lat)

        ctx.beginPath()
        ctx.arc(x, y, 8, 0, 2 * Math.PI)

        // Green for first coordinate (origin), red for second (destination)
        ctx.fillStyle = index === 0 ? "#22c55e" : "#ef4444"
        ctx.fill()

        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw label
        ctx.fillStyle = "#000000"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(index === 0 ? "Origin" : "Destination", x, y - 15)
      })

      // Draw a line between origin and destination if both exist
      if (customMapCoordinates.length >= 2) {
        const origin = customMapCoordinates[0]
        const destination = customMapCoordinates[1]

        ctx.beginPath()
        ctx.moveTo(lngToX(origin.lng), latToY(origin.lat))
        ctx.lineTo(lngToX(destination.lng), latToY(destination.lat))
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 3
        ctx.setLineDash([10, 5])
        ctx.stroke()
        ctx.setLineDash([])
      }
    }
  }, [nodes, edges, currentRoute, selectedOrigin, selectedDestination, customMapCoordinates])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full rounded-lg border" style={{ width: "100%", height: "100%" }} />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Origin</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Destination</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-12 h-2 bg-blue-500 rounded-full"></div>
            <span>Route</span>
          </div>
        </div>
      </div>
    </div>
  )
}
