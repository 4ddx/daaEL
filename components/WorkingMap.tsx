"use client"

import { useEffect, useRef, useState } from "react"
import { useTrafficStore } from "@/lib/store"

export default function WorkingMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { customMapCoordinates, currentRoute, nodes } = useTrafficStore()

  useEffect(() => {
    if (!mapRef.current) return

    // Simple fallback map using Google Maps embed
    const renderMap = () => {
      try {
        let mapUrl = "https://www.google.com/maps/embed/v1/view"
        const apiKey = "AIzaSyBFw0Qbyq9zTFTd-tUX4iWSkR7k-E6YNVM" // Demo key

        if (customMapCoordinates && customMapCoordinates.length >= 2) {
          // Show directions between two points
          const origin = `${customMapCoordinates[0].lat},${customMapCoordinates[0].lng}`
          const destination = `${customMapCoordinates[1].lat},${customMapCoordinates[1].lng}`
          mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destination}&mode=driving`
        } else if (customMapCoordinates && customMapCoordinates.length === 1) {
          // Show single location
          const center = `${customMapCoordinates[0].lat},${customMapCoordinates[0].lng}`
          mapUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${center}&zoom=10`
        } else {
          // Default view of India
          mapUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=20.5937,78.9629&zoom=5`
        }

        mapRef.current!.innerHTML = `
          <iframe
            width="100%"
            height="100%"
            style="border:0; border-radius: 8px;"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            src="${mapUrl}">
          </iframe>
        `
        setMapLoaded(true)
        setError(null)
      } catch (err) {
        console.error("Map loading error:", err)
        setError("Failed to load map")
        renderFallbackMap()
      }
    }

    const renderFallbackMap = () => {
      // Canvas-based fallback
      const canvas = document.createElement("canvas")
      canvas.width = mapRef.current!.offsetWidth
      canvas.height = mapRef.current!.offsetHeight
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.style.borderRadius = "8px"
      canvas.style.backgroundColor = "#f0f9ff"

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear and set background
      ctx.fillStyle = "#f0f9ff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = "#e0e7ff"
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      // Calculate bounds for nodes
      if (nodes.length > 0) {
        const lats = nodes.map((n) => n.coordinates[0])
        const lngs = nodes.map((n) => n.coordinates[1])
        const minLat = Math.min(...lats) - 1
        const maxLat = Math.max(...lats) + 1
        const minLng = Math.min(...lngs) - 1
        const maxLng = Math.max(...lngs) + 1

        const latToY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * (canvas.height - 100) + 50
        const lngToX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (canvas.width - 100) + 50

        // Draw connections between cities
        ctx.strokeStyle = "#94a3b8"
        ctx.lineWidth = 2
        nodes.forEach((node, i) => {
          nodes.forEach((otherNode, j) => {
            if (i < j) {
              ctx.beginPath()
              ctx.moveTo(lngToX(node.coordinates[1]), latToY(node.coordinates[0]))
              ctx.lineTo(lngToX(otherNode.coordinates[1]), latToY(otherNode.coordinates[0]))
              ctx.stroke()
            }
          })
        })

        // Draw route if exists
        if (currentRoute && currentRoute.path.length > 1) {
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 4
          ctx.beginPath()
          currentRoute.path.forEach((nodeId, index) => {
            const node = nodes.find((n) => n.id === nodeId)
            if (node) {
              const x = lngToX(node.coordinates[1])
              const y = latToY(node.coordinates[0])
              if (index === 0) {
                ctx.moveTo(x, y)
              } else {
                ctx.lineTo(x, y)
              }
            }
          })
          ctx.stroke()
        }

        // Draw cities
        nodes.forEach((node) => {
          const x = lngToX(node.coordinates[1])
          const y = latToY(node.coordinates[0])

          // City circle
          ctx.beginPath()
          ctx.arc(x, y, 8, 0, 2 * Math.PI)
          ctx.fillStyle = "#1e40af"
          ctx.fill()
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 2
          ctx.stroke()

          // City name
          ctx.fillStyle = "#1e293b"
          ctx.font = "12px Arial"
          ctx.textAlign = "center"
          ctx.fillText(node.name, x, y - 15)
        })

        // Draw custom coordinates if available
        if (customMapCoordinates) {
          customMapCoordinates.forEach((coord, index) => {
            const x = lngToX(coord.lng)
            const y = latToY(coord.lat)

            ctx.beginPath()
            ctx.arc(x, y, 12, 0, 2 * Math.PI)
            ctx.fillStyle = index === 0 ? "#22c55e" : "#ef4444"
            ctx.fill()
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 3
            ctx.stroke()

            // Label
            ctx.fillStyle = "#000000"
            ctx.font = "bold 12px Arial"
            ctx.textAlign = "center"
            ctx.fillText(index === 0 ? "FROM" : "TO", x, y + 25)
          })
        }
      } else {
        // No data message
        ctx.fillStyle = "#64748b"
        ctx.font = "16px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Map Loading...", canvas.width / 2, canvas.height / 2)
      }

      mapRef.current!.innerHTML = ""
      mapRef.current!.appendChild(canvas)
      setMapLoaded(true)
    }

    // Try Google Maps first, fallback to canvas
    renderMap()
  }, [customMapCoordinates, currentRoute, nodes])

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {error && (
        <div className="absolute top-4 left-4 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}

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
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Cities</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-1 bg-blue-500"></div>
            <span>Route</span>
          </div>
        </div>
      </div>
    </div>
  )
}
