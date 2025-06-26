"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Card, CardContent } from "@/components/card"
import { Alert, AlertDescription } from "@/components/alert"
import {
  Search,
  Navigation,
  MapPin,
  Star,
  Globe,
  Car,
  Bike,
  PersonStanding,
  Bus,
  Share,
  Heart,
  Layers,
  Satellite,
  MapIcon,
  Construction,
  Compass,
  ZoomIn,
  ZoomOut,
  Target,
  Camera,
  Key,
  AlertTriangle,
  Info,
} from "lucide-react"

declare global {
  interface Window {
    google: any
    initMap: () => void
    L: any
  }
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
  price_level?: number
  photos?: any[]
  opening_hours?: {
    open_now: boolean
    weekday_text: string[]
  }
  formatted_phone_number?: string
  website?: string
  types: string[]
  reviews?: any[]
}

interface DirectionsResult {
  routes: any[]
  geocoded_waypoints: any[]
}

export default function EnhancedGoogleMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const directionsServiceRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

  // State management with SSR-safe initialization
  const [isClient, setIsClient] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "hybrid" | "terrain">("roadmap")
  const [travelMode, setTravelMode] = useState<"DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT">("DRIVING")
  const [showTraffic, setShowTraffic] = useState(false)
  const [showTransit, setShowTransit] = useState(false)
  const [showBicycling, setShowBicycling] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [directions, setDirections] = useState<DirectionsResult | null>(null)
  const [routeInfo, setRouteInfo] = useState<any>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([])
  const [placeDetails, setPlaceDetails] = useState<any>(null)
  const [streetViewVisible, setStreetViewVisible] = useState(false)
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([])
  const [layersVisible, setLayersVisible] = useState(false)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [mapProvider, setMapProvider] = useState<"google" | "leaflet" | "error">("google")
  const [apiError, setApiError] = useState<string | null>(null)
  const [trafficLayer, setTrafficLayer] = useState<any>(null)
  const [transitLayer, setTransitLayer] = useState<any>(null)
  const [bicyclingLayer, setBicyclingLayer] = useState<any>(null)
  const [missingApis, setMissingApis] = useState<string[]>([])
  const [showApiWarning, setShowApiWarning] = useState(false)

  // 🔑 Your Google Maps API Key
  const GOOGLE_MAPS_API_KEY = "AIzaSyB721NWfHpbC1SWgIqGgqQApmDQXT5Qm2o"

  // Check if API key is properly configured
  const isValidApiKey = (key: string): boolean => {
    return (
      key &&
      key.length > 20 &&
      key !== "YOUR_GOOGLE_MAPS_API_KEY_HERE" &&
      key.startsWith("AIza") &&
      !key.includes("-") &&
      /^[A-Za-z0-9_-]+$/.test(key)
    )
  }

  // Comprehensive mock data for fallback
  const mockPlaces = [
    {
      place_id: "mock_1",
      name: "India Gate",
      formatted_address: "Rajpath, India Gate, New Delhi, Delhi 110001, India",
      geometry: { location: { lat: 28.6129, lng: 77.2295 } },
      rating: 4.5,
      types: ["tourist_attraction", "establishment"],
    },
    {
      place_id: "mock_2",
      name: "Gateway of India",
      formatted_address: "Apollo Bandar, Colaba, Mumbai, Maharashtra 400001, India",
      geometry: { location: { lat: 18.9217, lng: 72.8347 } },
      rating: 4.4,
      types: ["tourist_attraction", "establishment"],
    },
    {
      place_id: "mock_3",
      name: "Bangalore Palace",
      formatted_address: "Vasanth Nagar, Bengaluru, Karnataka 560052, India",
      geometry: { location: { lat: 12.998, lng: 77.5926 } },
      rating: 4.3,
      types: ["tourist_attraction", "establishment"],
    },
    {
      place_id: "mock_4",
      name: "Taj Mahal",
      formatted_address: "Agra, Uttar Pradesh 282001, India",
      geometry: { location: { lat: 27.1751, lng: 78.0421 } },
      rating: 4.8,
      types: ["tourist_attraction", "establishment"],
    },
    {
      place_id: "mock_5",
      name: "Qutub Minar",
      formatted_address: "Mehrauli, New Delhi, Delhi 110030, India",
      geometry: { location: { lat: 28.5244, lng: 77.1855 } },
      rating: 4.6,
      types: ["tourist_attraction", "establishment"],
    },
    {
      place_id: "mock_6",
      name: "Victoria Memorial",
      formatted_address: "Victoria Memorial Hall, 1, Queens Way, Kolkata, West Bengal 700071, India",
      geometry: { location: { lat: 22.5448, lng: 88.3426 } },
      rating: 4.7,
      types: ["tourist_attraction", "establishment"],
    },
    {
      place_id: "mock_7",
      name: "Mysore Palace",
      formatted_address: "Sayyaji Rao Rd, Mysuru, Karnataka 570001, India",
      geometry: { location: { lat: 12.3052, lng: 76.6552 } },
      rating: 4.6,
      types: ["tourist_attraction", "establishment"],
    },
    {
      place_id: "mock_8",
      name: "Hawa Mahal",
      formatted_address: "Hawa Mahal Rd, Badi Choupad, J.D.A. Market, Pink City, Jaipur, Rajasthan 302002, India",
      geometry: { location: { lat: 26.9239, lng: 75.8267 } },
      rating: 4.5,
      types: ["tourist_attraction", "establishment"],
    },
    {
      place_id: "mock_9",
      name: "Golden Temple",
      formatted_address: "Golden Temple Rd, Amritsar, Punjab 143006, India",
      geometry: { location: { lat: 31.62, lng: 74.8765 } },
      rating: 4.9,
      types: ["tourist_attraction", "establishment"],
    },
    {
      place_id: "mock_10",
      name: "Lotus Temple",
      formatted_address: "Lotus Temple Rd, Bahapur, Shambhu Dayal Bagh, Kalkaji, New Delhi, Delhi 110019, India",
      geometry: { location: { lat: 28.5535, lng: 77.2588 } },
      rating: 4.6,
      types: ["tourist_attraction", "establishment"],
    },
  ]

  // Indian cities for search
  const indianCities = [
    { name: "Mumbai", lat: 19.076, lng: 72.8777 },
    { name: "Delhi", lat: 28.7041, lng: 77.1025 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
    { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
    { name: "Kanpur", lat: 26.4499, lng: 80.3319 },
    { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
    { name: "Indore", lat: 22.7196, lng: 75.8577 },
    { name: "Thane", lat: 19.2183, lng: 72.9781 },
    { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
  ]

  // SSR-safe client detection
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load Google Maps API with minimal requirements
  useEffect(() => {
    if (!isClient) return

    if (typeof window !== "undefined" && window.google?.maps) {
      setIsLoaded(true)
      setMapProvider("google")
      return
    }

    const loadGoogleMaps = async () => {
      try {
        // Use dynamic import for better performance
        const { Loader } = await import("@googlemaps/js-api-loader")

        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places", "geometry", "marker"],
          region: "IN", // Optimize for India
          language: "en",
        })

        await loader.load()
        setIsLoaded(true)
        setMapProvider("google")
      } catch (error) {
        console.error("Failed to load Google Maps:", error)
        setApiError("Google Maps API failed to load - check your API key")
        loadLeafletFallback()
      }
    }

    loadGoogleMaps()
  }, [isClient])

  // Load Leaflet as fallback
  const loadLeafletFallback = async () => {
    if (typeof window === "undefined") return

    if (window.L) {
      setMapProvider("leaflet")
      setIsLoaded(true)
      return
    }

    try {
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
      script.onerror = () => {
        setMapProvider("error")
        setApiError("Failed to load mapping libraries")
      }
      document.head.appendChild(script)
    } catch (error) {
      setMapProvider("error")
      setApiError("Failed to load fallback map")
    }
  }

  // Initialize Google Maps with minimal features
  const initializeGoogleMap = () => {
    if (typeof window === "undefined" || !window.google || !mapRef.current) return

    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
        mapTypeId: mapType,
        mapId: "DEMO_MAP_ID", // Add this line to enable Advanced Markers
        streetViewControl: true,
        fullscreenControl: true,
        mapTypeControl: true,
        zoomControl: true,
        scaleControl: true,
      })

      // Try to initialize services (with error handling)
      try {
        directionsServiceRef.current = new window.google.maps.DirectionsService()
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer()
      } catch (error) {
        console.log("Directions API not available:", error)
        setMissingApis((prev) => [...prev, "Directions API"])
      }

      try {
        geocoderRef.current = new window.google.maps.Geocoder()
      } catch (error) {
        console.log("Geocoding API not available:", error)
        setMissingApis((prev) => [...prev, "Geocoding API"])
      }

      // Try to initialize layers
      try {
        setTrafficLayer(new window.google.maps.TrafficLayer())
        setTransitLayer(new window.google.maps.TransitLayer())
        setBicyclingLayer(new window.google.maps.BicyclingLayer())
      } catch (error) {
        console.log("Layer APIs not available:", error)
      }

      // Get user location
      getCurrentLocation()

      // Show API warning if needed
      if (missingApis.length > 0) {
        setShowApiWarning(true)
      }
    } catch (error) {
      console.error("Google Maps initialization failed:", error)
      setApiError("Google Maps initialization failed")
      loadLeafletFallback()
    }
  }

  // Initialize Leaflet Map
  const initializeLeafletMap = () => {
    if (typeof window === "undefined" || !window.L || !mapRef.current) return

    try {
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

      streetLayer.addTo(mapInstanceRef.current)
      mapInstanceRef.current.streetLayer = streetLayer
      mapInstanceRef.current.satelliteLayer = satelliteLayer

      getCurrentLocation()
    } catch (error) {
      console.error("Leaflet initialization failed:", error)
      setMapProvider("error")
      setApiError("Failed to initialize map")
    }
  }

  // Initialize map based on provider
  useEffect(() => {
    if (!isClient || !isLoaded || !mapRef.current || mapInstanceRef.current) return

    if (mapProvider === "google") {
      initializeGoogleMap()
    } else if (mapProvider === "leaflet") {
      initializeLeafletMap()
    }
  }, [isClient, isLoaded, mapProvider, mapType])

  // Get current location
  const getCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setCurrentLocation(pos)

        if (mapInstanceRef.current) {
          if (mapProvider === "google" && window.google) {
            mapInstanceRef.current.setCenter(pos)
            mapInstanceRef.current.setZoom(15)

            // Replace the AdvancedMarkerElement code with standard Marker
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
          } else if (mapProvider === "leaflet" && window.L) {
            mapInstanceRef.current.setView([pos.lat, pos.lng], 15)
            window.L.marker([pos.lat, pos.lng]).addTo(mapInstanceRef.current).bindPopup("Your Location")
          }
        }
      },
      (error) => {
        console.log("Geolocation failed:", error)
      },
    )
  }

  // Fallback search function that works without any Google APIs
  const handleSearch = async (query: string) => {
    if (!isClient || query.length < 2) return

    // First try using Google's Geocoder if available
    if (mapProvider === "google" && window.google && geocoderRef.current) {
      try {
        const request = {
          address: query,
          region: "IN", // Bias towards India
        }

        geocoderRef.current.geocode(request, (results: any, status: any) => {
          if (status === window.google.maps.GeocoderStatus.OK && results) {
            const suggestions = results.slice(0, 5).map((result: any, index: number) => ({
              place_id: result.place_id || `geocode_${index}`,
              name: result.formatted_address.split(",")[0],
              formatted_address: result.formatted_address,
              geometry: {
                location: {
                  lat: result.geometry.location.lat(),
                  lng: result.geometry.location.lng(),
                },
              },
              types: result.types || [],
            }))
            setSuggestions(suggestions)
            setShowSuggestions(true)
          } else {
            // Geocoding API not available or error - use fallback
            fallbackSearch(query)
          }
        })
      } catch (error) {
        console.log("Geocoding error, using fallback:", error)
        fallbackSearch(query)
      }
    } else {
      // Use fallback search for Leaflet or when Geocoder isn't available
      fallbackSearch(query)
    }
  }

  // Fallback search that works without any Google APIs
  const fallbackSearch = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase()

      // Search mock places
      const matchedPlaces = mockPlaces.filter(
        (place) =>
          place.name.toLowerCase().includes(lowerQuery) || place.formatted_address.toLowerCase().includes(lowerQuery),
      )

      // Search Indian cities
      const matchedCities = indianCities
        .filter((city) => city.name.toLowerCase().includes(lowerQuery))
        .map((city, index) => ({
          place_id: `city_${index}`,
          name: city.name,
          formatted_address: `${city.name}, India`,
          geometry: {
            location: {
              lat: city.lat,
              lng: city.lng,
            },
          },
          types: ["locality", "political"],
        }))

      // Combine results
      const combinedResults = [...matchedPlaces, ...matchedCities].slice(0, 8)
      setSuggestions(combinedResults)
      setShowSuggestions(true)
    },
    [indianCities, mockPlaces, setSuggestions, setShowSuggestions],
  )

  // Handle place selection
  const selectPlace = useCallback(
    (place: any) => {
      setSelectedPlace(place)
      setSearchQuery(place.name || place.formatted_address.split(",")[0])
      setShowSuggestions(false)

      if (mapInstanceRef.current) {
        const location = place.geometry?.location || {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        }

        if (mapProvider === "google" && window.google) {
          mapInstanceRef.current.setCenter(location)
          mapInstanceRef.current.setZoom(17)

          new window.google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            title: place.name || place.formatted_address,
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `),
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32),
            },
          })
        } else if (mapProvider === "leaflet" && window.L) {
          mapInstanceRef.current.setView([location.lat, location.lng], 17)
          window.L.marker([location.lat, location.lng])
            .addTo(mapInstanceRef.current)
            .bindPopup(place.name || place.formatted_address)
            .openPopup()
        }
      }
    },
    [mapProvider, setSelectedPlace, setSearchQuery, setShowSuggestions],
  )

  // Map controls
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

  const changeMapType = (type: string) => {
    if (mapProvider === "google" && mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type)
    } else if (mapProvider === "leaflet" && mapInstanceRef.current) {
      // Switch between street and satellite for Leaflet
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer._url) {
          mapInstanceRef.current.removeLayer(layer)
        }
      })

      if (type === "satellite") {
        mapInstanceRef.current.satelliteLayer?.addTo(mapInstanceRef.current)
      } else {
        mapInstanceRef.current.streetLayer?.addTo(mapInstanceRef.current)
      }
    }
    setMapType(type as any)
  }

  const recenterToLocation = () => {
    getCurrentLocation()
  }

  const resetView = () => {
    if (!mapInstanceRef.current) return

    if (mapProvider === "google") {
      mapInstanceRef.current.setCenter({ lat: 20.5937, lng: 78.9629 })
      mapInstanceRef.current.setZoom(5)
    } else if (mapProvider === "leaflet") {
      mapInstanceRef.current.setView([20.5937, 78.9629], 5)
    }
  }

  const toggleLayer = (layerName: string) => {
    if (mapProvider !== "google" || !mapInstanceRef.current) return

    switch (layerName) {
      case "traffic":
        if (showTraffic) {
          trafficLayer?.setMap(null)
        } else {
          trafficLayer?.setMap(mapInstanceRef.current)
        }
        setShowTraffic(!showTraffic)
        break
      case "transit":
        if (showTransit) {
          transitLayer?.setMap(null)
        } else {
          transitLayer?.setMap(mapInstanceRef.current)
        }
        setShowTransit(!showTransit)
        break
      case "bicycling":
        if (showBicycling) {
          bicyclingLayer?.setMap(null)
        } else {
          bicyclingLayer?.setMap(mapInstanceRef.current)
        }
        setShowBicycling(!showBicycling)
        break
      default:
        break
    }
  }

  const savePlace = (place: Place) => {
    if (savedPlaces.find((p) => p.place_id === place.place_id)) {
      setSavedPlaces(savedPlaces.filter((p) => p.place_id !== place.place_id))
    } else {
      setSavedPlaces([...savedPlaces, place])
    }
  }

  const shareLocation = (place: Place) => {
    const shareData = {
      title: place.name,
      text: `Check out ${place.name} on the map!`,
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.formatted_address)}`,
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share(shareData)
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.log("Error sharing:", error))
    } else {
      // Fallback for browsers without Web Share API
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(shareData.url)
        alert("Location URL copied to clipboard!")
      } else {
        alert("Sharing not supported in this browser.")
      }
    }
  }

  // Fallback directions function
  const getDirections = (destination: any) => {
    if (mapProvider === "google" && window.google && directionsServiceRef.current && currentLocation) {
      try {
        directionsRendererRef.current.setMap(mapInstanceRef.current)

        directionsServiceRef.current.route(
          {
            origin: currentLocation,
            destination: destination,
            travelMode: window.google.maps.TravelMode[travelMode],
          },
          (result: any, status: any) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              directionsRendererRef.current.setDirections(result)

              const route = result.routes[0].legs[0]
              setRouteInfo({
                distance: route.distance.text,
                duration: route.duration.text,
              })
            } else {
              console.error("Directions request failed due to " + status)
              alert("Could not calculate directions. Please try again.")

              // Add to missing APIs if not authorized
              if (status === "NOT_FOUND" || status === "ZERO_RESULTS") {
                alert("No route found between these locations.")
              } else if (status === "REQUEST_DENIED") {
                setMissingApis((prev) => [...prev, "Directions API"])
                setShowApiWarning(true)
              }
            }
          },
        )
      } catch (error) {
        console.error("Directions error:", error)
        alert("Directions service is not available.")
        setMissingApis((prev) => [...prev, "Directions API"])
        setShowApiWarning(true)
      }
    } else {
      // Simple fallback for Leaflet or when Directions API isn't available
      if (mapProvider === "leaflet" && window.L && currentLocation && mapInstanceRef.current) {
        // Draw a simple line between points
        const points = [
          [currentLocation.lat, currentLocation.lng],
          [destination.lat, destination.lng],
        ]

        // Remove any existing polylines
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer._latlngs) {
            mapInstanceRef.current.removeLayer(layer)
          }
        })

        // Add new polyline
        const polyline = window.L.polyline(points, { color: "blue", weight: 5 }).addTo(mapInstanceRef.current)

        // Fit bounds to show the route
        mapInstanceRef.current.fitBounds(polyline.getBounds())

        // Calculate straight-line distance
        const distance = calculateDistance(currentLocation.lat, currentLocation.lng, destination.lat, destination.lng)

        setRouteInfo({
          distance: `${distance.toFixed(1)} km`,
          duration: `${Math.round(distance * 2)} min`, // Rough estimate
        })
      } else {
        alert("Directions require your current location.")
      }
    }
  }

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180)
  }

  // Simple street view fallback
  const openStreetView = (location: any) => {
    // Open in a new tab instead of trying to use the API
    const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${location.lat},${location.lng}`
    window.open(streetViewUrl, "_blank")
  }

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing map...</p>
        </div>
      </div>
    )
  }

  if (apiKeyMissing) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <Key className="h-16 w-16 mx-auto mb-6 text-blue-600" />
            <h2 className="text-2xl font-bold mb-4">Google Maps API Key Setup</h2>
            <p className="text-gray-600 mb-6">Please add your Google Maps API key to enable full mapping features.</p>

            <Alert className="text-left mb-6">
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-semibold">📍 Required APIs for Google Maps:</p>
                  <div className="bg-green-50 p-3 rounded text-sm">
                    <p className="font-semibold">✅ Enable these APIs:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>
                        <strong>Maps JavaScript API</strong> - Core mapping
                      </li>
                      <li>
                        <strong>Geocoding API</strong> - Address search
                      </li>
                      <li>
                        <strong>Directions API</strong> - Navigation
                      </li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Setup Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-left">
                <li>
                  Go to{" "}
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    className="text-blue-600 underline"
                    rel="noreferrer"
                  >
                    Google Cloud Console
                  </a>
                </li>
                <li>Create a new project or select existing</li>
                <li>Enable the required APIs listed above</li>
                <li>Create credentials (API Key)</li>
                <li>Set up billing (required for Google Maps)</li>
                <li>Copy the key and replace in the code</li>
              </ol>
            </div>

            <div className="mt-8">
              <Button asChild className="mr-4">
                <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
                  Get API Key
                </a>
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setApiKeyMissing(false)
                  loadLeafletFallback()
                }}
                className="ml-2"
              >
                Use OpenStreetMap Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mapProvider === "error") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Map Loading Failed</h3>
            <p className="text-gray-600 mb-4">
              Unable to load mapping services. Please check your internet connection and API configuration.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {mapProvider === "google" ? "Google Maps" : "OpenStreetMap"}...</p>
          {apiError && <p className="text-sm text-orange-600 mt-2">Falling back to OpenStreetMap...</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* API Error Alert */}
      {apiError && (
        <Alert className="absolute top-4 left-4 right-4 z-20 bg-orange-50 border-orange-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {mapProvider === "leaflet"
              ? "Using OpenStreetMap (Google Maps API configuration needed for full features)"
              : apiError}
          </AlertDescription>
        </Alert>
      )}

      {/* API Warning Alert */}
      {showApiWarning && missingApis.length > 0 && (
        <Alert
          className="absolute top-4 left-4 right-4 z-20 bg-yellow-50 border-yellow-200"
          style={{ top: apiError ? "80px" : "16px" }}
        >
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm">
            <div className="flex justify-between items-center">
              <span>Some Google Maps features are limited. Missing APIs: {missingApis.join(", ")}</span>
              <Button variant="ghost" size="sm" onClick={() => setShowApiWarning(false)} className="h-6 w-6 p-0">
                ×
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div
        className="absolute top-4 left-4 right-4 z-10"
        style={{
          top: apiError && showApiWarning ? "144px" : apiError ? "80px" : showApiWarning ? "80px" : "16px",
        }}
      >
        <div className="relative">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={`Search ${mapProvider === "google" ? "Google Maps" : "OpenStreetMap"}`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.length > 2) {
                    handleSearch(e.target.value)
                  } else {
                    setSuggestions([])
                    setShowSuggestions(false)
                  }
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="pl-10 pr-4 h-12 bg-white shadow-lg border-0 rounded-lg"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLayersVisible(!layersVisible)}
              className="h-12 w-12 bg-white shadow-lg"
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-14 left-0 right-0 max-h-80 overflow-y-auto shadow-xl z-20">
              <CardContent className="p-0">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectPlace(suggestion)}
                    className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{suggestion.name}</div>
                        <div className="text-sm text-gray-500">{suggestion.formatted_address}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Map Controls */}
      <div
        className="absolute top-20 right-4 z-10 space-y-2"
        style={{
          top: apiError && showApiWarning ? "184px" : apiError ? "120px" : showApiWarning ? "120px" : "80px",
        }}
      >
        <div className="bg-white rounded-lg shadow-lg p-1">
          <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="icon" onClick={recenterToLocation} className="h-10 w-10 bg-white shadow-lg">
          <Target className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={resetView} className="h-10 w-10 bg-white shadow-lg">
          <Compass className="h-4 w-4" />
        </Button>
      </div>

      {/* Layers Panel */}
      {layersVisible && (
        <Card
          className="absolute top-20 left-4 w-64 shadow-xl z-10"
          style={{
            top: apiError && showApiWarning ? "184px" : apiError ? "120px" : showApiWarning ? "120px" : "80px",
          }}
        >
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Map Options</h3>

            {/* Map Types */}
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium">Map Type</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={mapType === "roadmap" ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeMapType("roadmap")}
                  className="h-8"
                >
                  <MapIcon className="h-3 w-3 mr-1" />
                  Map
                </Button>
                <Button
                  variant={mapType === "satellite" ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeMapType("satellite")}
                  className="h-8"
                >
                  <Satellite className="h-3 w-3 mr-1" />
                  Satellite
                </Button>
                {mapProvider === "google" && (
                  <>
                    <Button
                      variant={mapType === "hybrid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => changeMapType("hybrid")}
                      className="h-8"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      Hybrid
                    </Button>
                    <Button
                      variant={mapType === "terrain" ? "default" : "outline"}
                      size="sm"
                      onClick={() => changeMapType("terrain")}
                      className="h-8"
                    >
                      <MapIcon className="h-3 w-3 mr-1" />
                      Terrain
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Layer Toggles - Only for Google Maps */}
            {mapProvider === "google" && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Layers</h4>
                <div className="space-y-1">
                  <Button
                    variant={showTraffic ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLayer("traffic")}
                    className="w-full justify-start h-8"
                  >
                    <Construction className="h-3 w-3 mr-2" />
                    Traffic
                  </Button>
                  <Button
                    variant={showTransit ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLayer("transit")}
                    className="w-full justify-start h-8"
                  >
                    <Bus className="h-3 w-3 mr-2" />
                    Transit
                  </Button>
                  <Button
                    variant={showBicycling ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLayer("bicycling")}
                    className="w-full justify-start h-8"
                  >
                    <Bike className="h-3 w-3 mr-2" />
                    Bicycling
                  </Button>
                </div>
              </div>
            )}

            {/* Provider Info */}
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded mt-4">
              Using: {mapProvider === "google" ? "Google Maps" : "OpenStreetMap"}
              {mapProvider === "leaflet" && <div className="mt-1">Limited features available</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Travel Mode Selector - Only for Google Maps */}
      {mapProvider === "google" && (
        <div className="absolute bottom-4 left-4 z-10">
          <Card className="shadow-lg">
            <CardContent className="p-2">
              <div className="flex space-x-1">
                <Button
                  variant={travelMode === "DRIVING" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTravelMode("DRIVING")}
                  className="h-8"
                >
                  <Car className="h-3 w-3" />
                </Button>
                <Button
                  variant={travelMode === "WALKING" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTravelMode("WALKING")}
                  className="h-8"
                >
                  <PersonStanding className="h-3 w-3" />
                </Button>
                <Button
                  variant={travelMode === "BICYCLING" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTravelMode("BICYCLING")}
                  className="h-8"
                >
                  <Bike className="h-3 w-3" />
                </Button>
                <Button
                  variant={travelMode === "TRANSIT" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTravelMode("TRANSIT")}
                  className="h-8"
                >
                  <Bus className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Place Details Panel */}
      {selectedPlace && (
        <Card className="absolute bottom-4 right-4 w-80 max-h-96 overflow-y-auto shadow-xl z-10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{selectedPlace.name}</h3>
                <p className="text-sm text-gray-600">{selectedPlace.formatted_address}</p>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" onClick={() => savePlace(selectedPlace)} className="h-8 w-8">
                  <Heart
                    className={`h-4 w-4 ${savedPlaces.find((p) => p.place_id === selectedPlace.place_id) ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => shareLocation(selectedPlace)} className="h-8 w-8">
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPlace(null)} className="h-8 w-8">
                  ×
                </Button>
              </div>
            </div>

            {/* Rating */}
            {selectedPlace.rating && (
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{selectedPlace.rating}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                onClick={() => getDirections(selectedPlace.geometry.location)}
                disabled={!currentLocation}
                className="h-8"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Directions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openStreetView(selectedPlace.geometry.location)}
                className="h-8"
              >
                <Camera className="h-3 w-3 mr-1" />
                Street View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Information */}
      {routeInfo && (
        <Card
          className="absolute top-20 left-4 w-64 shadow-xl z-10"
          style={{
            top: apiError && showApiWarning ? "184px" : apiError ? "120px" : showApiWarning ? "120px" : "80px",
          }}
        >
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Route Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Distance:</span>
                <span className="text-sm font-medium">{routeInfo.distance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="text-sm font-medium">{routeInfo.duration}</span>
              </div>
              {mapProvider === "leaflet" && (
                <div className="text-xs text-gray-500 mt-2">
                  Note: This is a straight-line estimate. For accurate directions, enable the Directions API.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Map */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Click outside to close suggestions */}
      {showSuggestions && <div className="fixed inset-0 z-5" onClick={() => setShowSuggestions(false)} />}
    </div>
  )
}
