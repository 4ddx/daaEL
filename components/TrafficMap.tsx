"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { GOOGLE_MAPS_API_KEY } from "../../config"
import { isBrowser } from "../../utils"

interface Incident {
  lat: number
  lng: number
  type: string
}

interface TrafficMapProps {
  incidents: Incident[]
}

const getIncidentIcon = (type: string): string => {
  switch (type) {
    case "Accident":
      return "/icons/accident.png"
    case "Congestion":
      return "/icons/congestion.png"
    case "Roadwork":
      return "/icons/roadwork.png"
    case "Other":
      return "/icons/other.png"
    default:
      return "/icons/other.png"
  }
}

const TrafficMap: React.FC<TrafficMapProps> = ({ incidents }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    setIsClient(isBrowser())
  }, [])

  useEffect(() => {
    if (!isClient) return

    if (typeof window !== "undefined" && window.google?.maps) {
      setIsLoaded(true)
      return
    }

    // Use the modern async loading pattern
    const loadGoogleMaps = async () => {
      try {
        // Import the Google Maps library dynamically
        const { Loader } = await import("@googlemaps/js-api-loader")

        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places", "geometry", "marker"],
        })

        await loader.load()
        setIsLoaded(true)
      } catch (error) {
        console.error("Failed to load Google Maps:", error)
        setApiError("Failed to load Google Maps")
      }
    }

    loadGoogleMaps()
  }, [isClient])

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 34.052235, lng: -118.243683 }, // Los Angeles
        zoom: 10,
      })

      mapInstanceRef.current = map
      addTrafficMarkers(incidents)
    }
  }, [isLoaded, incidents])

  const addTrafficMarkers = (incidents: Incident[]) => {
    if (!mapInstanceRef.current) return

    incidents.forEach((incident) => {
      const markerElement = document.createElement("div")
      markerElement.innerHTML = `
        <div style="
          width: 32px; 
          height: 32px; 
          background-image: url(${getIncidentIcon(incident.type)}); 
          background-size: cover;
          cursor: pointer;
        "></div>
      `

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: incident.lat, lng: incident.lng },
        map: mapInstanceRef.current,
        title: incident.type,
        content: markerElement,
      })
    })
  }

  if (apiError) {
    return <div>Error: {apiError}</div>
  }

  return (
    <div style={{ height: "500px", width: "100%" }} ref={mapRef}>
      {!isLoaded && isClient && <p>Loading Google Maps...</p>}
    </div>
  )
}

export default TrafficMap
