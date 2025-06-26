"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Badge } from "@/components/badge"
import {
  Search,
  Navigation,
  MapPin,
  Star,
  Share,
  Heart,
  Layers,
  Satellite,
  MapIcon,
  Compass,
  ZoomIn,
  ZoomOut,
  Target,
  Camera,
  RotateCcw,
  BarChart3,
  Navigation2,
  Zap,
  Activity,
} from "lucide-react"
import { AStar } from "@/lib/pathfinding"
import { Dijkstra } from "@/lib/dijkstra"
import { BellmanFord } from "@/lib/bellmanFord"
import { createBangaloreGraph, bangalorePlaces } from "@/lib/bangaloreData"
import type { PathResult } from "@/types/graph"
import type { JSX } from "react"

declare global {
  interface Window {
    google: any
    initMap: () => void
    L: any
  }
}

interface AlgorithmResult {
  name: string
  result: PathResult | null
  executionTime: number
  nodesVisited: number
  color: string
  icon: JSX.Element
}

interface Place {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  rating?: number
  types: string[]
}

export default function BangalorePathfindingMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const directionsServiceRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

  // Map state
  const [isClient, setIsClient] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapProvider, setMapProvider] = useState<"google" | "leaflet" | "error">("google")
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "hybrid" | "terrain">("roadmap")
  const [apiError, setApiError] = useState<string | null>(null)
  const [layersVisible, setLayersVisible] = useState(false)
  const [showTraffic, setShowTraffic] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  // Pathfinding state
  const [graph] = useState(() => createBangaloreGraph())
  const [startNode, setStartNode] = useState<string | null>(null)
  const [endNode, setEndNode] = useState<string | null>(null)
  const [algorithmResults, setAlgorithmResults] = useState<AlgorithmResult[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("all")
  const [showComparison, setShowComparison] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1000)
  const [isAnimating, setIsAnimating] = useState(false)

  // Visualization state
  const [pathOverlays, setPathOverlays] = useState<any[]>([])
  const [nodeMarkers, setNodeMarkers] = useState<any[]>([])

  const GOOGLE_MAPS_API_KEY = "AIzaSyB721NWfHpbC1SWgIqGgqQApmDQXT5Qm2o"

  // Initialize client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load Google Maps
  useEffect(() => {
    if (!isClient) return

    if (typeof window !== "undefined" && window.google?.maps) {
      setIsLoaded(true)
      setMapProvider("google")
      return
    }

    const loadGoogleMaps = async () => {
      try {
        const { Loader } = await import("@googlemaps/js-api-loader")

        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places", "geometry", "marker"],
          region: "IN",
          language: "en",
        })

        await loader.load()
        setIsLoaded(true)
        setMapProvider("google")
      } catch (error) {
        console.error("Failed to load Google Maps:", error)
        setApiError("Google Maps API failed to load")
        loadLeafletFallback()
      }
    }

    loadGoogleMaps()
  }, [isClient])

  // Load Leaflet fallback
  const loadLeafletFallback = async () => {
    if (typeof window === "undefined") return

    if (window.L) {
      setMapProvider("leaflet")
      setIsLoaded(true)
      return
    }

    try {
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
        setMapProvider("leaflet")
        setIsLoaded(true)
      }
      document.head.appendChild(script)
    } catch (error) {
      setMapProvider("error")
      setApiError("Failed to load mapping libraries")
    }
  }

  // Initialize map
  useEffect(() => {
    if (!isClient || !isLoaded || !mapRef.current || mapInstanceRef.current) return

    if (mapProvider === "google") {
      initializeGoogleMap()
    } else if (mapProvider === "leaflet") {
      initializeLeafletMap()
    }
  }, [isClient, isLoaded, mapProvider])

  const initializeGoogleMap = () => {
    if (!window.google || !mapRef.current) return

    // Center on Bangalore
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 12.9716, lng: 77.5946 }, // Bangalore center
      zoom: 11,
      mapTypeId: mapType,
      mapId: "DEMO_MAP_ID", // Add this line
      streetViewControl: true,
      fullscreenControl: true,
      mapTypeControl: true,
      zoomControl: false, // We'll use custom controls
      scaleControl: true,
    })

    // Initialize services
    try {
      directionsServiceRef.current = new window.google.maps.DirectionsService()
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer()
      geocoderRef.current = new window.google.maps.Geocoder()
    } catch (error) {
      console.log("Some Google Maps services not available:", error)
    }

    // Add traffic layer
    const trafficLayer = new window.google.maps.TrafficLayer()
    if (showTraffic) {
      trafficLayer.setMap(mapInstanceRef.current)
    }

    // Add all Bangalore nodes as markers
    addNodeMarkers()
    getCurrentLocation()
  }

  const initializeLeafletMap = () => {
    if (!window.L || !mapRef.current) return

    mapInstanceRef.current = window.L.map(mapRef.current).setView([12.9716, 77.5946], 11)

    const streetLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    })

    streetLayer.addTo(mapInstanceRef.current)
    addNodeMarkers()
    getCurrentLocation()
  }

  // Add node markers to map
  const addNodeMarkers = () => {
    if (!mapInstanceRef.current) return

    const markers: any[] = []

    graph.nodes.forEach((node) => {
      if (mapProvider === "google" && window.google) {
        const marker = new window.google.maps.Marker({
          position: { lat: node.coordinates[0], lng: node.coordinates[1] },
          map: mapInstanceRef.current,
          title: node.name,
          icon: {
            url: getNodeIcon(node.type),
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12),
          },
        })

        marker.addListener("click", () => {
          if (!startNode) {
            setStartNode(node.id)
          } else if (!endNode && node.id !== startNode) {
            setEndNode(node.id)
          } else {
            setStartNode(node.id)
            setEndNode(null)
          }
        })

        markers.push(marker)
      } else if (mapProvider === "leaflet" && window.L) {
        const marker = window.L.marker([node.coordinates[0], node.coordinates[1]])
          .addTo(mapInstanceRef.current)
          .bindPopup(node.name)

        marker.on("click", () => {
          if (!startNode) {
            setStartNode(node.id)
          } else if (!endNode && node.id !== startNode) {
            setEndNode(node.id)
          } else {
            setStartNode(node.id)
            setEndNode(null)
          }
        })

        markers.push(marker)
      }
    })

    setNodeMarkers(markers)
  }

  const getNodeIcon = (type: string): string => {
    const icons = {
      intersection:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#ffffff" strokeWidth="2"/>
          <circle cx="12" cy="12" r="3" fill="#ffffff"/>
        </svg>
      `),
      landmark:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
      `),
      commercial:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" fill="#10B981" stroke="#ffffff" strokeWidth="2" rx="2"/>
          <rect x="8" y="8" width="8" height="8" fill="#ffffff" rx="1"/>
        </svg>
      `),
      residential:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L4 9v12h16V9l-8-6z" fill="#F59E0B" stroke="#ffffff" strokeWidth="2"/>
          <rect x="10" y="14" width="4" height="6" fill="#ffffff"/>
        </svg>
      `),
    }
    return icons[type as keyof typeof icons] || icons.intersection
  }

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setCurrentLocation(pos)

        // Only center if within Bangalore area
        if (pos.lat >= 12.8 && pos.lat <= 13.2 && pos.lng >= 77.4 && pos.lng <= 77.8) {
          if (mapInstanceRef.current) {
            if (mapProvider === "google") {
              mapInstanceRef.current.setCenter(pos)
              mapInstanceRef.current.setZoom(15)

              new window.google.maps.Marker({
                position: pos,
                map: mapInstanceRef.current,
                title: "Your Location",
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                },
              })
            } else if (mapProvider === "leaflet") {
              mapInstanceRef.current.setView([pos.lat, pos.lng], 13)
            }
          }
        }
      },
      (error) => {
        console.log("Geolocation failed:", error)
      },
    )
  }

  // Search functionality
  const handleSearch = (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const lowerQuery = query.toLowerCase()

    // Search Bangalore places
    const matchedPlaces = bangalorePlaces
      .filter(
        (place) =>
          place.name.toLowerCase().includes(lowerQuery) ||
          place.category.toLowerCase().includes(lowerQuery) ||
          place.description.toLowerCase().includes(lowerQuery),
      )
      .map((place) => {
        const node = graph.nodes.get(place.id)
        return node
          ? {
              place_id: place.id,
              name: place.name,
              formatted_address: `${place.name}, ${place.category}, Bangalore`,
              geometry: {
                location: {
                  lat: node.coordinates[0],
                  lng: node.coordinates[1],
                },
              },
              types: [place.category.toLowerCase().replace(/\s+/g, "_")],
              rating: Math.random() * 2 + 3.5, // Mock rating
            }
          : null
      })
      .filter(Boolean)
      .slice(0, 8)

    setSuggestions(matchedPlaces)
    setShowSuggestions(true)
  }

  const selectPlace = (place: any) => {
    setSelectedPlace(place)
    setSearchQuery(place.name)
    setShowSuggestions(false)

    if (mapInstanceRef.current) {
      const location = place.geometry.location

      if (mapProvider === "google") {
        mapInstanceRef.current.setCenter(location)
        mapInstanceRef.current.setZoom(15)
      } else if (mapProvider === "leaflet") {
        mapInstanceRef.current.setView([location.lat, location.lng], 15)
      }

      // Set as start or end node
      if (!startNode) {
        setStartNode(place.place_id)
      } else if (!endNode && place.place_id !== startNode) {
        setEndNode(place.place_id)
      }
    }
  }

  // Pathfinding algorithms
  const runPathfindingAlgorithms = async () => {
    if (!startNode || !endNode) {
      alert("Please select both start and end locations")
      return
    }

    setIsCalculating(true)
    setAlgorithmResults([])

    const algorithms = [
      {
        name: "A* (Heuristic)",
        algorithm: new AStar(graph),
        color: "#3B82F6",
        icon: <Zap className="h-4 w-4" />,
      },
      {
        name: "Dijkstra (Optimal)",
        algorithm: new Dijkstra(graph),
        color: "#10B981",
        icon: <Target className="h-4 w-4" />,
      },
      {
        name: "Bellman-Ford (Robust)",
        algorithm: new BellmanFord(graph),
        color: "#F59E0B",
        icon: <Activity className="h-4 w-4" />,
      },
    ]

    const results: AlgorithmResult[] = []

    for (const { name, algorithm, color, icon } of algorithms) {
      const startTime = performance.now()
      const result = algorithm.findPath(startNode, endNode)
      const endTime = performance.now()

      results.push({
        name,
        result,
        executionTime: endTime - startTime,
        nodesVisited: result?.path.length || 0,
        color,
        icon,
      })

      // Add small delay for visual effect
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    setAlgorithmResults(results)
    setIsCalculating(false)
    setShowComparison(true)

    // Draw paths on map
    drawPaths(results)
  }

  const drawPaths = (results: AlgorithmResult[]) => {
    // Clear existing paths
    pathOverlays.forEach((overlay) => {
      if (mapProvider === "google") {
        overlay.setMap(null)
      } else if (mapProvider === "leaflet") {
        mapInstanceRef.current.removeLayer(overlay)
      }
    })

    const newOverlays: any[] = []

    results.forEach((result, index) => {
      if (!result.result) return

      const coordinates = result.result.path
        .map((nodeId) => {
          const node = graph.nodes.get(nodeId)
          return node ? [node.coordinates[0], node.coordinates[1]] : null
        })
        .filter(Boolean)

      if (mapProvider === "google" && window.google) {
        const path = new window.google.maps.Polyline({
          path: coordinates.map((coord) => ({ lat: coord![0], lng: coord![1] })),
          geodesic: true,
          strokeColor: result.color,
          strokeOpacity: 0.8,
          strokeWeight: 4 + index,
        })

        path.setMap(mapInstanceRef.current)
        newOverlays.push(path)
      } else if (mapProvider === "leaflet" && window.L) {
        const polyline = window.L.polyline(coordinates, {
          color: result.color,
          weight: 4 + index,
          opacity: 0.8,
        }).addTo(mapInstanceRef.current)

        newOverlays.push(polyline)
      }
    })

    setPathOverlays(newOverlays)
  }

  const clearPaths = () => {
    pathOverlays.forEach((overlay) => {
      if (mapProvider === "google") {
        overlay.setMap(null)
      } else if (mapProvider === "leaflet") {
        mapInstanceRef.current.removeLayer(overlay)
      }
    })
    setPathOverlays([])
    setAlgorithmResults([])
    setStartNode(null)
    setEndNode(null)
    setShowComparison(false)
  }

  const zoomIn = () => {
    if (!mapInstanceRef.current) return
    if (mapProvider === "google") {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1)
    } else if (mapProvider === "leaflet") {
      mapInstanceRef.current.zoomIn()
    }
  }

  const zoomOut = () => {
    if (!mapInstanceRef.current) return
    if (mapProvider === "google") {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1)
    } else if (mapProvider === "leaflet") {
      mapInstanceRef.current.zoomOut()
    }
  }

  const resetView = () => {
    if (!mapInstanceRef.current) return
    if (mapProvider === "google") {
      mapInstanceRef.current.setCenter({ lat: 12.9716, lng: 77.5946 })
      mapInstanceRef.current.setZoom(11)
    } else if (mapProvider === "leaflet") {
      mapInstanceRef.current.setView([12.9716, 77.5946], 11)
    }
  }

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Bangalore Pathfinding System...</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {mapProvider === "google" ? "Google Maps" : "OpenStreetMap"}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🏙️ Bangalore Pathfinding</h2>
            <p className="text-sm text-gray-600">AI-powered route optimization with comparative analysis</p>
            <div className="flex justify-center space-x-2 mt-2">
              <Badge variant="secondary">A* Algorithm</Badge>
              <Badge variant="secondary">Dijkstra</Badge>
              <Badge variant="secondary">Bellman-Ford</Badge>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-gray-700">🔍 Search Bangalore Locations</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search MG Road, Koramangala, Whitefield..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleSearch(e.target.value)
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="pl-10"
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute z-50 w-full mt-1 shadow-xl max-h-64 overflow-y-auto">
                <CardContent className="p-0">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectPlace(suggestion)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{suggestion.name}</div>
                          <div className="text-sm text-gray-500">{suggestion.formatted_address}</div>
                          {suggestion.rating && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-600">{suggestion.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Selected Nodes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Route Selection</h3>
              <Button variant="ghost" size="sm" onClick={clearPaths}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {startNode && (
              <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <div className="font-medium text-green-800">Start: {graph.nodes.get(startNode)?.name}</div>
                    <div className="text-sm text-green-600">Click another location to set destination</div>
                  </div>
                </div>
              </div>
            )}

            {endNode && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div>
                    <div className="font-medium text-red-800">End: {graph.nodes.get(endNode)?.name}</div>
                    <div className="text-sm text-red-600">Ready to calculate optimal routes</div>
                  </div>
                </div>
              </div>
            )}

            {!startNode && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
                <MapPin className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click on map markers or search to select start location</p>
              </div>
            )}
          </div>

          {/* Algorithm Controls */}
          <div className="space-y-3">
            <Button
              onClick={runPathfindingAlgorithms}
              disabled={!startNode || !endNode || isCalculating}
              className="w-full h-12 text-lg font-semibold"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calculating Routes...
                </>
              ) : (
                <>
                  <Navigation2 className="h-5 w-5 mr-2" />
                  Compare All Algorithms
                </>
              )}
            </Button>

            {algorithmResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Algorithm Performance</h4>
                {algorithmResults.map((result, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: result.color }}></div>
                        {result.icon}
                        <span className="font-medium text-sm">{result.name}</span>
                      </div>
                      <Badge variant={result.result ? "default" : "destructive"}>
                        {result.result ? "Success" : "Failed"}
                      </Badge>
                    </div>

                    {result.result && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Distance</div>
                          <div className="font-medium">{result.result.totalDistance.toFixed(1)} km</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Time</div>
                          <div className="font-medium">{result.executionTime.toFixed(2)} ms</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Nodes</div>
                          <div className="font-medium">{result.nodesVisited}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Efficiency</div>
                          <div className="font-medium">
                            {result.result.totalTime
                              ? ((result.result.totalDistance / result.result.totalTime) * 60).toFixed(1)
                              : "N/A"}{" "}
                            km/h
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Comparative Analysis */}
          {showComparison && algorithmResults.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Comparative Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Fastest Execution</div>
                  <div className="text-sm font-medium">
                    {
                      algorithmResults.reduce((fastest, current) =>
                        current.executionTime < fastest.executionTime ? current : fastest,
                      ).name
                    }
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Shortest Path</div>
                  <div className="text-sm font-medium">
                    {
                      algorithmResults
                        .filter((r) => r.result)
                        .reduce((shortest, current) =>
                          current.result!.totalDistance < (shortest.result?.totalDistance || Number.POSITIVE_INFINITY)
                            ? current
                            : shortest,
                        ).name
                    }
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Most Efficient</div>
                  <div className="text-sm font-medium">
                    {
                      algorithmResults
                        .filter((r) => r.result && r.result.totalTime)
                        .reduce((efficient, current) => {
                          const currentEff = current.result!.totalDistance / current.result!.totalTime
                          const efficientEff = efficient.result
                            ? efficient.result.totalDistance / efficient.result.totalTime
                            : 0
                          return currentEff > efficientEff ? current : efficient
                        }, algorithmResults[0]).name
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Intersections</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Landmarks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Commercial Areas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Residential Areas</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Click outside to close suggestions */}
        {showSuggestions && <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />}
      </div>

      {/* Right side - Map */}
      <div className="flex-1 relative">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 space-y-2">
          <div className="bg-white rounded-lg shadow-lg p-1">
            <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={resetView} className="h-10 w-10 bg-white shadow-lg">
            <Compass className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLayersVisible(!layersVisible)}
            className="h-10 w-10 bg-white shadow-lg"
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>

        {/* Layers Panel */}
        {layersVisible && (
          <Card className="absolute top-4 left-4 w-64 shadow-xl z-10">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Map Options</h3>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Map Type</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={mapType === "roadmap" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMapType("roadmap")}
                    className="h-8"
                  >
                    <MapIcon className="h-3 w-3 mr-1" />
                    Map
                  </Button>
                  <Button
                    variant={mapType === "satellite" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMapType("satellite")}
                    className="h-8"
                  >
                    <Satellite className="h-3 w-3 mr-1" />
                    Satellite
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded mt-4">
                Using: {mapProvider === "google" ? "Google Maps" : "OpenStreetMap"}
                <div className="mt-1">Bangalore-focused pathfinding system</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Algorithm Status */}
        {isCalculating && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <Card className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="font-semibold mb-2">Running Pathfinding Algorithms</h3>
              <p className="text-sm text-gray-600">Comparing A*, Dijkstra, and Bellman-Ford...</p>
            </Card>
          </div>
        )}

        {/* Results Summary */}
        {algorithmResults.length > 0 && !isCalculating && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Card className="bg-white/95 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Route Analysis Complete</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowComparison(!showComparison)}>
                    {showComparison ? "Hide" : "Show"} Details
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  {algorithmResults.map((result, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: result.color }}></div>
                        <span className="text-sm font-medium">{result.name.split(" ")[0]}</span>
                      </div>
                      {result.result ? (
                        <>
                          <div className="text-lg font-bold">{result.result.totalDistance.toFixed(1)} km</div>
                          <div className="text-xs text-gray-600">{result.executionTime.toFixed(1)}ms</div>
                        </>
                      ) : (
                        <div className="text-sm text-red-500">No path found</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Map */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Street View for selected place */}
        {selectedPlace && mapProvider === "google" && (
          <div className="absolute bottom-4 right-4 z-10">
            <Card className="w-80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedPlace.name}</h3>
                    <p className="text-sm text-gray-600">{selectedPlace.formatted_address}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedPlace(null)} className="h-8 w-8">
                      ×
                    </Button>
                  </div>
                </div>

                {selectedPlace.rating && (
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{selectedPlace.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!startNode) {
                        setStartNode(selectedPlace.place_id)
                      } else if (!endNode && selectedPlace.place_id !== startNode) {
                        setEndNode(selectedPlace.place_id)
                      }
                    }}
                    className="h-8"
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Set Route Point
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const location = selectedPlace.geometry.location
                      const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${location.lat},${location.lng}`
                      window.open(streetViewUrl, "_blank")
                    }}
                    className="h-8"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Street View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
