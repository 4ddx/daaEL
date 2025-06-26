"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Switch } from "@/components/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import { Badge } from "@/components/badge"
import { PlaceSearchInput } from "./PlaceSearchInput"
import { RouteVisualization } from "./RouteVisualization"
import { useTrafficStore } from "@/lib/store"
import { usePathfinding } from "@/hooks/usePathfinding"
import type { PlaceResult } from "@/hooks/useGooglePlaces"
import { Navigation, Map, Globe } from "lucide-react"

export function NavigationPanel() {
  const {
    nodes,
    selectedOrigin,
    selectedDestination,
    routePreferences,
    setSelectedOrigin,
    setSelectedDestination,
    setCurrentRoute,
    setRoutePreferences,
  } = useTrafficStore()

  const { findRoute } = usePathfinding()
  const [searchMode, setSearchMode] = useState<"nodes" | "places">("places")
  const [selectedOriginPlace, setSelectedOriginPlace] = useState<PlaceResult | null>(null)
  const [selectedDestinationPlace, setSelectedDestinationPlace] = useState<PlaceResult | null>(null)

  const handleOriginPlaceSelect = (place: PlaceResult) => {
    setSelectedOriginPlace(place)

    // Enhanced logging for Indian locations
    console.log(`🇮🇳 Selected origin: ${place.structured_formatting.main_text}`)
    console.log(`📍 Full address: ${place.description}`)
    console.log(`🗺️ Coordinates: ${place.geometry?.location.lat}, ${place.geometry?.location.lng}`)

    // For demo, map to nearest node - with safety checks
    if (nodes && nodes.length > 0) {
      const nearestNode = nodes[0]
      setSelectedOrigin(nearestNode.id)
    } else {
      console.warn("No nodes available for mapping")
      // Set a default or handle the case appropriately
      setSelectedOrigin("default-origin")
    }
  }

  const handleDestinationPlaceSelect = (place: PlaceResult) => {
    setSelectedDestinationPlace(place)

    // Enhanced logging for Indian locations
    console.log(`🇮🇳 Selected destination: ${place.structured_formatting.main_text}`)
    console.log(`📍 Full address: ${place.description}`)
    console.log(`🗺️ Coordinates: ${place.geometry?.location.lat}, ${place.geometry?.location.lng}`)

    // For demo, map to nearest node - with safety checks
    if (nodes && nodes.length > 1) {
      const nearestNode = nodes[1]
      setSelectedDestination(nearestNode.id)
    } else if (nodes && nodes.length === 1) {
      // If only one node, use it but warn
      console.warn("Only one node available, using same node for destination")
      setSelectedDestination(nodes[0].id)
    } else {
      console.warn("No nodes available for mapping")
      // Set a default or handle the case appropriately
      setSelectedDestination("default-destination")
    }
  }

  const clearSelection = () => {
    setSelectedOrigin(null)
    setSelectedDestination(null)
    setCurrentRoute(null)
    setSelectedOriginPlace(null)
    setSelectedDestinationPlace(null)
  }

  const setIndianDemoRoute = () => {
    // Set a demo route between Indian cities
    const mumbaiPlace: PlaceResult = {
      place_id: "demo_mumbai",
      description: "Marine Drive, Mumbai, Maharashtra, India",
      structured_formatting: {
        main_text: "Marine Drive",
        secondary_text: "Mumbai, Maharashtra, India",
      },
      geometry: {
        location: { lat: 18.9434, lng: 72.8234 },
      },
    }

    const bangalorePlace: PlaceResult = {
      place_id: "demo_bangalore",
      description: "MG Road, Bangalore, Karnataka, India",
      structured_formatting: {
        main_text: "MG Road",
        secondary_text: "Bangalore, Karnataka, India",
      },
      geometry: {
        location: { lat: 12.9716, lng: 77.5946 },
      },
    }

    setSelectedOriginPlace(mumbaiPlace)
    setSelectedDestinationPlace(bangalorePlace)
    setSelectedOrigin("A")
    setSelectedDestination("E")
  }

  // Auto-calculate route when both origin and destination are selected
  useEffect(() => {
    if (selectedOrigin && selectedDestination && nodes && nodes.length > 0) {
      const route = findRoute
      if (route) {
        setCurrentRoute(route)
      }
    }
  }, [selectedOrigin, selectedDestination, routePreferences, findRoute, setCurrentRoute, nodes])

  if (!nodes || nodes.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <span>Smart Navigation</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500">Loading navigation data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            <span>Smart Navigation</span>
          </div>
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            🇮🇳 India Ready
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="route" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="route" className="text-xs">
              Route
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs">
              Settings
            </TabsTrigger>
            <TabsTrigger value="visualization" className="text-xs">
              Routes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="route" className="space-y-4 mt-4">
            {/* Search Mode Toggle */}
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-orange-50 to-green-50 rounded border border-orange-200">
              <span className="text-sm font-medium">Search Mode:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant={searchMode === "places" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchMode("places")}
                  className="h-7 text-xs"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  Global Places
                </Button>
                <Button
                  variant={searchMode === "nodes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchMode("nodes")}
                  className="h-7 text-xs"
                >
                  <Map className="h-3 w-3 mr-1" />
                  Demo Nodes
                </Button>
              </div>
            </div>

            {searchMode === "places" ? (
              <>
                {/* Indian Cities Info */}
                <div className="p-3 bg-gradient-to-r from-orange-50 to-white rounded border border-orange-200">
                  <h4 className="text-sm font-medium text-orange-800 mb-2 flex items-center">
                    🇮🇳 Indian Metropolitan Cities Supported
                  </h4>
                  <div className="grid grid-cols-3 gap-1 text-xs text-orange-700">
                    <span>• Delhi</span>
                    <span>• Mumbai</span>
                    <span>• Bangalore</span>
                    <span>• Chennai</span>
                    <span>• Kolkata</span>
                    <span>• Pune</span>
                    <span>• Hyderabad</span>
                    <span>• Ahmedabad</span>
                    <span>• Surat</span>
                  </div>
                </div>

                {/* Origin Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>From</span>
                    {selectedOriginPlace?.description.includes("India") && (
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                        🇮🇳
                      </Badge>
                    )}
                  </label>
                  <PlaceSearchInput
                    placeholder="Search Indian cities, landmarks, or global locations..."
                    onPlaceSelect={handleOriginPlaceSelect}
                    value={selectedOriginPlace?.structured_formatting.main_text}
                  />
                </div>

                {/* Destination Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>To</span>
                    {selectedDestinationPlace?.description.includes("India") && (
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                        🇮🇳
                      </Badge>
                    )}
                  </label>
                  <PlaceSearchInput
                    placeholder="Search Indian cities, landmarks, or global locations..."
                    onPlaceSelect={handleDestinationPlaceSelect}
                    value={selectedDestinationPlace?.structured_formatting.main_text}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Node Selection Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Origin Node</span>
                  </label>
                  <Select value={selectedOrigin || ""} onValueChange={setSelectedOrigin}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select starting point" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.name} ({node.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Destination Node</span>
                  </label>
                  <Select value={selectedDestination || ""} onValueChange={setSelectedDestination}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map((node) => (
                        <SelectItem key={node.id} value={node.id} disabled={node.id === selectedOrigin}>
                          {node.name} ({node.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={clearSelection} className="h-10">
                Clear All
              </Button>
              <Button onClick={setIndianDemoRoute} className="h-10">
                <span className="mr-2">🇮🇳</span>
                India Demo
              </Button>
            </div>

            {/* Quick Indian City Buttons */}
            {searchMode === "places" && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Quick Select Indian Cities</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const place: PlaceResult = {
                        place_id: "quick_delhi",
                        description: "Connaught Place, Delhi, India",
                        structured_formatting: {
                          main_text: "Connaught Place",
                          secondary_text: "Delhi, India",
                        },
                      }
                      handleOriginPlaceSelect(place)
                    }}
                    className="h-8 text-xs"
                  >
                    🏛️ Delhi
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const place: PlaceResult = {
                        place_id: "quick_mumbai",
                        description: "Marine Drive, Mumbai, India",
                        structured_formatting: {
                          main_text: "Marine Drive",
                          secondary_text: "Mumbai, India",
                        },
                      }
                      handleDestinationPlaceSelect(place)
                    }}
                    className="h-8 text-xs"
                  >
                    🌊 Mumbai
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const place: PlaceResult = {
                        place_id: "quick_bangalore",
                        description: "MG Road, Bangalore, India",
                        structured_formatting: {
                          main_text: "MG Road",
                          secondary_text: "Bangalore, India",
                        },
                      }
                      handleOriginPlaceSelect(place)
                    }}
                    className="h-8 text-xs"
                  >
                    💻 Bangalore
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const place: PlaceResult = {
                        place_id: "quick_chennai",
                        description: "Marina Beach, Chennai, India",
                        structured_formatting: {
                          main_text: "Marina Beach",
                          secondary_text: "Chennai, India",
                        },
                      }
                      handleDestinationPlaceSelect(place)
                    }}
                    className="h-8 text-xs"
                  >
                    🏖️ Chennai
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 mt-4">
            {/* Route Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Optimization Priority</label>
              <Select
                value={routePreferences.routeType}
                onValueChange={(value: "fastest" | "shortest" | "balanced") =>
                  setRoutePreferences({ routeType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fastest">⚡ Fastest Route (Time Priority)</SelectItem>
                  <SelectItem value="shortest">📏 Shortest Distance</SelectItem>
                  <SelectItem value="balanced">⚖️ Balanced (Time + Distance)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Preferences */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Traffic & Road Preferences</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <label className="text-sm font-medium">Avoid Heavy Traffic</label>
                    <p className="text-xs text-gray-600">Route around congested areas</p>
                  </div>
                  <Switch
                    checked={routePreferences.avoidTraffic}
                    onCheckedChange={(checked) => setRoutePreferences({ avoidTraffic: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <label className="text-sm font-medium">Prefer Highways</label>
                    <p className="text-xs text-gray-600">Use major roads when possible</p>
                  </div>
                  <Switch
                    checked={routePreferences.preferHighways}
                    onCheckedChange={(checked) => setRoutePreferences({ preferHighways: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <label className="text-sm font-medium">Avoid Tolls</label>
                    <p className="text-xs text-gray-600">Skip toll roads if possible</p>
                  </div>
                  <Switch
                    checked={routePreferences.avoidTolls}
                    onCheckedChange={(checked) => setRoutePreferences({ avoidTolls: checked })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualization" className="mt-4">
            <RouteVisualization />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
