"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/input"
import { Button } from "@/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import type { AStarResult } from "@/lib/astar"

declare global {
  interface Window {
    L: any
  }
}

interface City {
  id: string
  name: string
  country: string
  lat: number
  lng: number
  population?: number
}

interface RouteStep {
  instruction: string
  distance: number
  duration: number
  way_name?: string
  maneuver?: {
    type: string
    modifier?: string
  }
}

interface DetailedRoute {
  coordinates: number[][]
  distance: number
  duration: number
  steps: RouteStep[]
  alternatives?: DetailedRoute[]
}

interface PathfindingMapProps {
  onPathFound?: (result: AStarResult) => void
}

export default function PathfindingMap({ onPathFound }: PathfindingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  // Search states
  const [startQuery, setStartQuery] = useState("")
  const [endQuery, setEndQuery] = useState("")
  const [startSuggestions, setStartSuggestions] = useState<City[]>([])
  const [endSuggestions, setEndSuggestions] = useState<City[]>([])
  const [selectedStart, setSelectedStart] = useState<City | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<City | null>(null)
  const [showStartSuggestions, setShowStartSuggestions] = useState(false)
  const [showEndSuggestions, setShowEndSuggestions] = useState(false)

  // Route states
  const [currentRoute, setCurrentRoute] = useState<DetailedRoute | null>(null)
  const [mapType, setMapType] = useState<"satellite" | "street">("street")
  const [isLoading, setIsLoading] = useState(false)
  const [routePolylines, setRoutePolylines] = useState<any[]>([])
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0)
  const [showDirections, setShowDirections] = useState(false)

  // Comprehensive world cities database
  const worldCities: City[] = [
    // Major Indian Cities
    { id: "delhi", name: "Delhi", country: "India", lat: 28.6139, lng: 77.209, population: 32900000 },
    { id: "mumbai", name: "Mumbai", country: "India", lat: 19.076, lng: 72.8777, population: 20700000 },
    { id: "bangalore", name: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946, population: 13200000 },
    { id: "bengaluru", name: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946, population: 13200000 },
    { id: "chennai", name: "Chennai", country: "India", lat: 13.0827, lng: 80.2707, population: 11500000 },
    { id: "kolkata", name: "Kolkata", country: "India", lat: 22.5726, lng: 88.3639, population: 15700000 },
    { id: "hyderabad", name: "Hyderabad", country: "India", lat: 17.385, lng: 78.4867, population: 10500000 },
    { id: "pune", name: "Pune", country: "India", lat: 18.5204, lng: 73.8567, population: 7400000 },
    { id: "ahmedabad", name: "Ahmedabad", country: "India", lat: 23.0225, lng: 72.5714, population: 8400000 },
    { id: "jaipur", name: "Jaipur", country: "India", lat: 26.9124, lng: 75.7873, population: 3700000 },
    { id: "lucknow", name: "Lucknow", country: "India", lat: 26.8467, lng: 80.9462, population: 3400000 },
    { id: "kanpur", name: "Kanpur", country: "India", lat: 26.4499, lng: 80.3319, population: 2900000 },
    { id: "nagpur", name: "Nagpur", country: "India", lat: 21.1458, lng: 79.0882, population: 2500000 },
    { id: "indore", name: "Indore", country: "India", lat: 22.7196, lng: 75.8577, population: 2200000 },

    // Major World Cities
    { id: "newyork", name: "New York", country: "USA", lat: 40.7128, lng: -74.006, population: 8400000 },
    { id: "london", name: "London", country: "UK", lat: 51.5074, lng: -0.1278, population: 9500000 },
    { id: "tokyo", name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, population: 14000000 },
    { id: "paris", name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, population: 2200000 },
    { id: "berlin", name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405, population: 3700000 },
    { id: "sydney", name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, population: 5400000 },
    { id: "dubai", name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, population: 3500000 },
    { id: "singapore", name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, population: 5900000 },
    { id: "losangeles", name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437, population: 4000000 },
    { id: "chicago", name: "Chicago", country: "USA", lat: 41.8781, lng: -87.6298, population: 2700000 },
    { id: "toronto", name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, population: 2900000 },
    { id: "moscow", name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173, population: 12500000 },
    { id: "istanbul", name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784, population: 15500000 },
    { id: "bangkok", name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, population: 10500000 },
    { id: "seoul", name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978, population: 9700000 },
    { id: "melbourne", name: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631, population: 5200000 },
  ]

  // Improved search function
  const searchCities = (query: string): City[] => {
    if (query.length < 1) return []

    const searchTerm = query.toLowerCase().trim()

    const filtered = worldCities.filter((city) => {
      const cityName = city.name.toLowerCase()
      const countryName = city.country.toLowerCase()

      if (cityName === searchTerm || cityName.startsWith(searchTerm)) return true
      if (cityName.includes(searchTerm) || countryName.includes(searchTerm)) return true

      // Common aliases
      if (searchTerm === "bombay" && cityName === "mumbai") return true
      if (searchTerm === "calcutta" && cityName === "kolkata") return true
      if (searchTerm === "madras" && cityName === "chennai") return true
      if (searchTerm === "bangalore" && cityName === "bengaluru") return true
      if (searchTerm === "nyc" && cityName.includes("new york")) return true
      if (searchTerm === "la" && cityName.includes("los angeles")) return true

      return false
    })

    const uniqueCities = filtered.filter(
      (city, index, self) => index === self.findIndex((c) => c.lat === city.lat && c.lng === city.lng),
    )

    return uniqueCities
      .sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(searchTerm)
        const bStartsWith = b.name.toLowerCase().startsWith(searchTerm)
        const aExact = a.name.toLowerCase() === searchTerm
        const bExact = b.name.toLowerCase() === searchTerm

        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        if (aStartsWith && !bStartsWith) return -1
        if (!aStartsWith && bStartsWith) return 1

        return (b.population || 0) - (a.population || 0)
      })
      .slice(0, 8)
  }

  // Load Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadLeaflet = async () => {
      if (window.L) {
        setLeafletLoaded(true)
        return
      }

      const cssLink = document.createElement("link")
      cssLink.rel = "stylesheet"
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(cssLink)

      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.onload = () => {
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
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return

    mapInstanceRef.current = window.L.map(mapRef.current).setView([20, 0], 2)

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

    if (mapType === "satellite") {
      satelliteLayer.addTo(mapInstanceRef.current)
    } else {
      streetLayer.addTo(mapInstanceRef.current)
    }

    mapInstanceRef.current.streetLayer = streetLayer
    mapInstanceRef.current.satelliteLayer = satelliteLayer

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [leafletLoaded, mapType])

  // Handle search input changes
  useEffect(() => {
    const suggestions = searchCities(startQuery)
    setStartSuggestions(suggestions)
  }, [startQuery])

  useEffect(() => {
    const suggestions = searchCities(endQuery)
    setEndSuggestions(suggestions)
  }, [endQuery])

  // Update map when cities are selected
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStart || !selectedEnd) return

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer.options && layer.options.isCustomMarker) {
        mapInstanceRef.current.removeLayer(layer)
      }
    })

    // Add start marker (green)
    const startMarker = window.L.marker([selectedStart.lat, selectedStart.lng], {
      icon: window.L.divIcon({
        className: "custom-marker",
        html: '<div style="background-color: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
      isCustomMarker: true,
    })
      .addTo(mapInstanceRef.current)
      .bindPopup(`<strong>Start:</strong> ${selectedStart.name}, ${selectedStart.country}`)

    // Add end marker (red)
    const endMarker = window.L.marker([selectedEnd.lat, selectedEnd.lng], {
      icon: window.L.divIcon({
        className: "custom-marker",
        html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
      isCustomMarker: true,
    })
      .addTo(mapInstanceRef.current)
      .bindPopup(`<strong>End:</strong> ${selectedEnd.name}, ${selectedEnd.country}`)

    // Fit map to show both cities
    const group = window.L.featureGroup([startMarker, endMarker])
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
  }, [selectedStart, selectedEnd])

  const handleStartSelect = (city: City) => {
    setSelectedStart(city)
    setStartQuery(`${city.name}, ${city.country}`)
    setShowStartSuggestions(false)
  }

  const handleEndSelect = (city: City) => {
    setSelectedEnd(city)
    setEndQuery(`${city.name}, ${city.country}`)
    setShowEndSuggestions(false)
  }

  // Enhanced routing with multiple alternatives and detailed steps
  const findDetailedRoute = async () => {
    if (!selectedStart || !selectedEnd) {
      alert("Please select both start and end cities")
      return
    }

    setIsLoading(true)

    try {
      // Try multiple routing services for best results
      const routes = await Promise.allSettled([
        fetchMapboxRoute(selectedStart, selectedEnd),
        fetchOpenRouteServiceRoute(selectedStart, selectedEnd),
        fetchOSRMRoute(selectedStart, selectedEnd),
      ])

      const successfulRoutes = routes
        .filter((result): result is PromiseFulfilledResult<DetailedRoute> => result.status === "fulfilled")
        .map((result) => result.value)
        .filter(Boolean)

      if (successfulRoutes.length > 0) {
        // Sort by distance and take the best route
        successfulRoutes.sort((a, b) => a.distance - b.distance)
        const bestRoute = successfulRoutes[0]
        bestRoute.alternatives = successfulRoutes.slice(1, 3) // Keep up to 2 alternatives

        setCurrentRoute(bestRoute)
        setSelectedRouteIndex(0)
        drawDetailedRoutes([bestRoute, ...(bestRoute.alternatives || [])])

        const result: AStarResult = {
          path: [selectedStart.id, selectedEnd.id],
          visitedNodes: [selectedStart.id, selectedEnd.id],
          totalDistance: bestRoute.distance,
          steps: [],
        }

        onPathFound?.(result)
      } else {
        throw new Error("All routing services failed")
      }
    } catch (error) {
      console.error("Routing error:", error)
      // Fallback to simple route
      drawSimpleRoute()
    }

    setIsLoading(false)
  }

  // Mapbox Directions API (most detailed)
  const fetchMapboxRoute = async (start: City, end: City): Promise<DetailedRoute> => {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson&access_token=pk.eyJ1IjoidGVzdCIsImEiOiJjbGV0ZXN0In0.test`,
    )

    if (!response.ok) throw new Error("Mapbox routing failed")

    const data = await response.json()
    const route = data.routes[0]

    return {
      coordinates: route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]),
      distance: route.distance / 1000,
      duration: route.duration / 60,
      steps: route.legs[0].steps.map((step: any) => ({
        instruction: step.maneuver.instruction,
        distance: step.distance / 1000,
        duration: step.duration / 60,
        way_name: step.name,
        maneuver: step.maneuver,
      })),
    }
  }

  // OpenRouteService API
  const fetchOpenRouteServiceRoute = async (start: City, end: City): Promise<DetailedRoute> => {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248d5b2b7b7a4b84b8b9b8b4b8b4b8b4b8b&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}&format=geojson&instructions=true`,
    )

    if (!response.ok) throw new Error("OpenRouteService routing failed")

    const data = await response.json()
    const route = data.features[0]

    return {
      coordinates: route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]),
      distance: route.properties.segments[0].distance / 1000,
      duration: route.properties.segments[0].duration / 60,
      steps: route.properties.segments[0].steps.map((step: any) => ({
        instruction: step.instruction,
        distance: step.distance / 1000,
        duration: step.duration / 60,
        way_name: step.name || "Unnamed road",
      })),
    }
  }

  // OSRM API (Open Source Routing Machine)
  const fetchOSRMRoute = async (start: City, end: City): Promise<DetailedRoute> => {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson`,
    )

    if (!response.ok) throw new Error("OSRM routing failed")

    const data = await response.json()
    const route = data.routes[0]

    return {
      coordinates: route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]),
      distance: route.distance / 1000,
      duration: route.duration / 60,
      steps: route.legs[0].steps.map((step: any) => ({
        instruction: step.maneuver.instruction || `${step.maneuver.type} ${step.maneuver.modifier || ""}`.trim(),
        distance: step.distance / 1000,
        duration: step.duration / 60,
        way_name: step.name || "Unnamed road",
        maneuver: step.maneuver,
      })),
    }
  }

  // Draw multiple route alternatives
  const drawDetailedRoutes = (routes: DetailedRoute[]) => {
    if (!mapInstanceRef.current) return

    // Clear existing routes
    routePolylines.forEach((polyline) => {
      mapInstanceRef.current.removeLayer(polyline)
    })

    const newPolylines: any[] = []
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

    routes.forEach((route, index) => {
      const polyline = window.L.polyline(route.coordinates, {
        color: colors[index] || "#6b7280",
        weight: index === selectedRouteIndex ? 6 : 4,
        opacity: index === selectedRouteIndex ? 0.9 : 0.6,
      }).addTo(mapInstanceRef.current)

      // Add click handler to select route
      polyline.on("click", () => {
        setSelectedRouteIndex(index)
        drawDetailedRoutes(routes) // Redraw with new selection
      })

      newPolylines.push(polyline)
    })

    setRoutePolylines(newPolylines)

    // Fit map to main route
    if (routes[0]) {
      const bounds = window.L.latLngBounds(routes[0].coordinates)
      mapInstanceRef.current.fitBounds(bounds.pad(0.1))
    }
  }

  // Fallback simple route
  const drawSimpleRoute = () => {
    if (!selectedStart || !selectedEnd || !mapInstanceRef.current) return

    const coords = [
      [selectedStart.lat, selectedStart.lng],
      [selectedEnd.lat, selectedEnd.lng],
    ]

    const polyline = window.L.polyline(coords, {
      color: "#3b82f6",
      weight: 4,
      opacity: 0.8,
    }).addTo(mapInstanceRef.current)

    setRoutePolylines([polyline])

    const distance = calculateDistance(selectedStart, selectedEnd)

    const simpleRoute: DetailedRoute = {
      coordinates: coords,
      distance,
      duration: distance / 80, // Assume 80 km/h average
      steps: [
        {
          instruction: `Head from ${selectedStart.name} to ${selectedEnd.name}`,
          distance,
          duration: distance / 80,
          way_name: "Direct route",
        },
      ],
    }

    setCurrentRoute(simpleRoute)

    const result: AStarResult = {
      path: [selectedStart.id, selectedEnd.id],
      visitedNodes: [selectedStart.id, selectedEnd.id],
      totalDistance: distance,
      steps: [],
    }

    onPathFound?.(result)
  }

  const calculateDistance = (city1: City, city2: City): number => {
    const R = 6371
    const dLat = toRadians(city2.lat - city1.lat)
    const dLng = toRadians(city2.lng - city1.lng)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(city1.lat)) * Math.cos(toRadians(city2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180)
  }

  const clearPath = () => {
    setCurrentRoute(null)
    setSelectedStart(null)
    setSelectedEnd(null)
    setStartQuery("")
    setEndQuery("")
    setShowDirections(false)

    if (mapInstanceRef.current) {
      routePolylines.forEach((polyline) => {
        mapInstanceRef.current.removeLayer(polyline)
      })
      setRoutePolylines([])

      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer.options && layer.options.isCustomMarker) {
          mapInstanceRef.current.removeLayer(layer)
        }
      })

      mapInstanceRef.current.setView([20, 0], 2)
    }
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getManeuverIcon = (maneuver?: { type: string; modifier?: string }): string => {
    if (!maneuver) return "➡️"

    switch (maneuver.type) {
      case "turn":
        return maneuver.modifier === "left" ? "↰" : maneuver.modifier === "right" ? "↱" : "➡️"
      case "merge":
        return "🔀"
      case "ramp":
        return "🛣️"
      case "roundabout":
        return "🔄"
      case "fork":
        return "🍴"
      case "continue":
        return "➡️"
      default:
        return "➡️"
    }
  }

  if (!leafletLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading advanced routing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">🛣️ Advanced Route Planner</h3>
            <p className="text-xs text-gray-600 mb-4">Turn-by-turn directions with multiple route options</p>
          </div>

          {/* Search inputs - same as before */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-gray-700">🟢 From City</label>
            <Input
              type="text"
              placeholder="Type city name..."
              value={startQuery}
              onChange={(e) => {
                setStartQuery(e.target.value)
                setShowStartSuggestions(true)
              }}
              onFocus={() => setShowStartSuggestions(true)}
              className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-green-500"
            />

            {showStartSuggestions && startSuggestions.length > 0 && (
              <div className="absolute z-[60] w-full mt-1 bg-white border-2 border-gray-200 rounded-md shadow-xl max-h-48 overflow-y-auto">
                {startSuggestions.map((city) => (
                  <button
                    key={`${city.id}-${city.lat}-${city.lng}`}
                    onClick={() => handleStartSelect(city)}
                    className="w-full px-4 py-3 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{city.name}</div>
                    <div className="text-sm text-gray-500">{city.country}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-gray-700">🔴 To City</label>
            <Input
              type="text"
              placeholder="Type destination..."
              value={endQuery}
              onChange={(e) => {
                setEndQuery(e.target.value)
                setShowEndSuggestions(true)
              }}
              onFocus={() => setShowEndSuggestions(true)}
              className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-red-500"
            />

            {showEndSuggestions && endSuggestions.length > 0 && (
              <div className="absolute z-[60] w-full mt-1 bg-white border-2 border-gray-200 rounded-md shadow-xl max-h-48 overflow-y-auto">
                {endSuggestions.map((city) => (
                  <button
                    key={`${city.id}-${city.lat}-${city.lng}`}
                    onClick={() => handleEndSelect(city)}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{city.name}</div>
                    <div className="text-sm text-gray-500">{city.country}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => setMapType(mapType === "satellite" ? "street" : "satellite")}
              variant="outline"
              className="w-full h-10"
            >
              {mapType === "satellite" ? "🛰️ Street View" : "🗺️ Satellite View"}
            </Button>

            <Button
              onClick={findDetailedRoute}
              disabled={!selectedStart || !selectedEnd || isLoading}
              className="w-full h-12 text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Finding Best Routes...
                </>
              ) : (
                <>🧭 Find Detailed Routes</>
              )}
            </Button>

            <Button onClick={clearPath} variant="outline" className="w-full h-10">
              🗑️ Clear All
            </Button>
          </div>

          {/* Route Alternatives */}
          {currentRoute && currentRoute.alternatives && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">🛣️ Route Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[currentRoute, ...(currentRoute.alternatives || [])].map((route, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedRouteIndex(index)}
                    className={`w-full p-3 text-left rounded border transition-colors ${
                      selectedRouteIndex === index ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">
                          Route {index + 1} {index === 0 ? "(Fastest)" : index === 1 ? "(Shortest)" : "(Alternative)"}
                        </div>
                        <div className="text-xs text-gray-600">
                          {route.distance.toFixed(0)} km • {formatDuration(route.duration)}
                        </div>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][index] }}
                      />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Turn-by-turn directions */}
          {currentRoute && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  🧭 Turn-by-Turn Directions
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDirections(!showDirections)}
                    className="h-6 px-2"
                  >
                    {showDirections ? "Hide" : "Show"}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showDirections && (
                <CardContent className="max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {currentRoute.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded text-xs">
                        <span className="text-lg">{getManeuverIcon(step.maneuver)}</span>
                        <div className="flex-1">
                          <div className="font-medium">{step.instruction}</div>
                          {step.way_name && step.way_name !== "Unnamed road" && (
                            <div className="text-gray-600">on {step.way_name}</div>
                          )}
                          <div className="text-gray-500">
                            {step.distance.toFixed(1)} km • {formatDuration(step.duration)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Selected Cities Display */}
          {selectedStart && (
            <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded text-sm">
              <div className="font-medium text-green-800">✅ FROM: {selectedStart.name}</div>
              <div className="text-green-600">{selectedStart.country}</div>
            </div>
          )}

          {selectedEnd && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm">
              <div className="font-medium text-red-800">🎯 TO: {selectedEnd.name}</div>
              <div className="text-red-600">{selectedEnd.country}</div>
            </div>
          )}
        </div>

        {/* Click outside to close suggestions */}
        {(showStartSuggestions || showEndSuggestions) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowStartSuggestions(false)
              setShowEndSuggestions(false)
            }}
          />
        )}
      </div>

      {/* Right side - Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Enhanced Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg">
          <h4 className="font-medium mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Start City</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>End City</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1 bg-blue-500"></div>
              <span>Main Route</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1 bg-green-500"></div>
              <span>Alternative</span>
            </div>
          </div>
        </div>

        {/* Route Info Overlay */}
        {currentRoute && (
          <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
            <div className="text-sm">
              <div className="font-medium">
                📍 {selectedStart?.name} → {selectedEnd?.name}
              </div>
              <div className="text-gray-600">
                🛣️ {currentRoute.distance.toFixed(0)} km • ⏱️ {formatDuration(currentRoute.duration)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {currentRoute.steps.length} turn{currentRoute.steps.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
