"use client"

import { useEffect, useRef, useState } from "react"
import { useTrafficStore } from "@/lib/store"

// Declare Leaflet as global to avoid import issues
declare global {
  interface Window {
    L: any
  }
}

interface InteractiveMapProps {
  mapType: "street" | "satellite"
}

export default function InteractiveMap({ mapType }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const routeLineRef = useRef<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  const { nodes, currentRoute, customMapCoordinates, selectedOrigin, selectedDestination } = useTrafficStore()

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadLeaflet = async () => {
      if (window.L) {
        setLeafletLoaded(true)
        return
      }

      // Load Leaflet CSS
      const cssLink = document.createElement("link")
      cssLink.rel = "stylesheet"
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      cssLink.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      cssLink.crossOrigin = ""
      document.head.appendChild(cssLink)

      // Load Leaflet JS
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      script.crossOrigin = ""
      script.onload = () => {
        // Fix for default markers
        if (window.L) {
          delete window.L.Icon.Default.prototype._getIconUrl
          window.L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          })
        }
        setLeafletLoaded(true)
      }
      document.head.appendChild(script)
    }

    loadLeaflet()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current || !window.L) return

    // Default center on India
    mapInstanceRef.current = window.L.map(mapRef.current).setView([20.5937, 78.9629], 5)

    // Add tile layers
    const streetLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    })

    const satelliteLayer = window.L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© Esri, Maxar, Earthstar Geographics",
        maxZoom: 19,
      },
    )

    // Add default layer
    if (mapType === "satellite") {
      satelliteLayer.addTo(mapInstanceRef.current)
    } else {
      streetLayer.addTo(mapInstanceRef.current)
    }

    // Store layers for switching
    mapInstanceRef.current.streetLayer = streetLayer
    mapInstanceRef.current.satelliteLayer = satelliteLayer

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [leafletLoaded, mapType])

  // Switch map type
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return

    // Remove current layer
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer._url) {
        // This is a tile layer
        mapInstanceRef.current.removeLayer(layer)
      }
    })

    // Add new layer
    if (mapType === "satellite") {
      mapInstanceRef.current.satelliteLayer.addTo(mapInstanceRef.current)
    } else {
      mapInstanceRef.current.streetLayer.addTo(mapInstanceRef.current)
    }
  }, [mapType, leafletLoaded])

  // Update map view based on custom coordinates
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !customMapCoordinates) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    if (customMapCoordinates.length === 1) {
      // Single location
      const coord = customMapCoordinates[0]
      mapInstanceRef.current.setView([coord.lat, coord.lng], 10)

      const marker = window.L.marker([coord.lat, coord.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup("Selected Location")
      markersRef.current.push(marker)
    } else if (customMapCoordinates.length >= 2) {
      // Multiple locations - fit bounds
      const bounds = window.L.latLngBounds(customMapCoordinates.map((coord) => [coord.lat, coord.lng]))
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })

      // Add origin marker (green)
      const originMarker = window.L.marker([customMapCoordinates[0].lat, customMapCoordinates[0].lng], {
        icon: window.L.divIcon({
          className: "custom-marker",
          html: '<div style="background-color: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      })
        .addTo(mapInstanceRef.current)
        .bindPopup("Origin")
      markersRef.current.push(originMarker)

      // Add destination marker (red)
      const destMarker = window.L.marker([customMapCoordinates[1].lat, customMapCoordinates[1].lng], {
        icon: window.L.divIcon({
          className: "custom-marker",
          html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      })
        .addTo(mapInstanceRef.current)
        .bindPopup("Destination")
      markersRef.current.push(destMarker)
    }
  }, [customMapCoordinates, leafletLoaded])

  // Draw route on map
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !currentRoute) return

    // Remove existing route line
    if (routeLineRef.current) {
      routeLineRef.current.remove()
      routeLineRef.current = null
    }

    // Get coordinates for the route
    const routeCoordinates: [number, number][] = []
    currentRoute.path.forEach((nodeId) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (node) {
        routeCoordinates.push([node.coordinates[0], node.coordinates[1]])
      }
    })

    if (routeCoordinates.length > 1) {
      // Create route line
      routeLineRef.current = window.L.polyline(routeCoordinates, {
        color: "#3b82f6",
        weight: 4,
        opacity: 0.8,
        dashArray: "10, 5",
      }).addTo(mapInstanceRef.current)

      // Add intermediate city markers
      currentRoute.path.slice(1, -1).forEach((nodeId) => {
        const node = nodes.find((n) => n.id === nodeId)
        if (node) {
          const intermediateMarker = window.L.marker([node.coordinates[0], node.coordinates[1]], {
            icon: window.L.divIcon({
              className: "custom-marker",
              html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            }),
          })
            .addTo(mapInstanceRef.current)
            .bindPopup(`Via: ${node.name}`)
          markersRef.current.push(intermediateMarker)
        }
      })

      // Fit map to show entire route
      mapInstanceRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [50, 50] })
    }
  }, [currentRoute, nodes, leafletLoaded])

  if (!leafletLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Map Controls Info */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="space-y-2 text-xs">
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
            <span>Via Cities</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-1 bg-blue-500 rounded" style={{ borderStyle: "dashed" }}></div>
            <span>Route</span>
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
        {mapType === "satellite" ? "© Esri, Maxar" : "© OpenStreetMap"}
      </div>
    </div>
  )
}
