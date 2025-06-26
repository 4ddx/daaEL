"use client"

import { useState, useCallback } from "react"

export interface PlaceResult {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
}

// Comprehensive Indian cities database
const indianCities = {
  delhi: {
    name: "Delhi",
    state: "Delhi",
    coordinates: { lat: 28.6139, lng: 77.209 },
    landmarks: [
      "Connaught Place",
      "India Gate",
      "Red Fort",
      "Chandni Chowk",
      "Karol Bagh",
      "Lajpat Nagar",
      "Saket",
      "Gurgaon",
      "Noida",
      "Dwarka",
      "Rohini",
      "Janakpuri",
    ],
  },
  mumbai: {
    name: "Mumbai",
    state: "Maharashtra",
    coordinates: { lat: 19.076, lng: 72.8777 },
    landmarks: [
      "Marine Drive",
      "Bandra",
      "Andheri",
      "Juhu",
      "Colaba",
      "Fort",
      "Powai",
      "Malad",
      "Borivali",
      "Thane",
      "Navi Mumbai",
      "Worli",
    ],
  },
  bangalore: {
    name: "Bangalore",
    state: "Karnataka",
    coordinates: { lat: 12.9716, lng: 77.5946 },
    landmarks: [
      "MG Road",
      "Brigade Road",
      "Koramangala",
      "Indiranagar",
      "Whitefield",
      "Electronic City",
      "Jayanagar",
      "Malleshwaram",
      "BTM Layout",
      "HSR Layout",
    ],
  },
  chennai: {
    name: "Chennai",
    state: "Tamil Nadu",
    coordinates: { lat: 13.0827, lng: 80.2707 },
    landmarks: [
      "Marina Beach",
      "T Nagar",
      "Anna Nagar",
      "Adyar",
      "Velachery",
      "OMR",
      "Porur",
      "Tambaram",
      "Mylapore",
      "Nungambakkam",
    ],
  },
  kolkata: {
    name: "Kolkata",
    state: "West Bengal",
    coordinates: { lat: 22.5726, lng: 88.3639 },
    landmarks: [
      "Park Street",
      "Salt Lake",
      "New Town",
      "Howrah",
      "Ballygunge",
      "Gariahat",
      "Esplanade",
      "Sealdah",
      "Dumdum",
      "Behala",
    ],
  },
  pune: {
    name: "Pune",
    state: "Maharashtra",
    coordinates: { lat: 18.5204, lng: 73.8567 },
    landmarks: [
      "FC Road",
      "MG Road",
      "Koregaon Park",
      "Baner",
      "Wakad",
      "Hinjewadi",
      "Kothrud",
      "Deccan",
      "Camp",
      "Hadapsar",
    ],
  },
  ahmedabad: {
    name: "Ahmedabad",
    state: "Gujarat",
    coordinates: { lat: 23.0225, lng: 72.5714 },
    landmarks: [
      "Sabarmati",
      "Vastrapur",
      "Satellite",
      "Maninagar",
      "Navrangpura",
      "CG Road",
      "SG Highway",
      "Bopal",
      "Gota",
      "Prahlad Nagar",
    ],
  },
  hyderabad: {
    name: "Hyderabad",
    state: "Telangana",
    coordinates: { lat: 17.385, lng: 78.4867 },
    landmarks: [
      "Banjara Hills",
      "Jubilee Hills",
      "HITEC City",
      "Gachibowli",
      "Madhapur",
      "Secunderabad",
      "Begumpet",
      "Ameerpet",
      "Kukatpally",
      "Miyapur",
    ],
  },
  surat: {
    name: "Surat",
    state: "Gujarat",
    coordinates: { lat: 21.1702, lng: 72.8311 },
    landmarks: [
      "Adajan",
      "Vesu",
      "Althan",
      "Piplod",
      "Citylight",
      "Rander",
      "Katargam",
      "Udhna",
      "Varachha",
      "Nanpura",
    ],
  },
}

export function useGooglePlaces() {
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const searchPlaces = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    const mockPlaces: PlaceResult[] = []

    // Search through Indian cities and landmarks
    Object.entries(indianCities).forEach(([cityKey, cityData]) => {
      // Check if query matches city name
      if (cityData.name.toLowerCase().includes(query.toLowerCase())) {
        mockPlaces.push({
          place_id: `city_${cityKey}`,
          description: `${cityData.name}, ${cityData.state}, India`,
          structured_formatting: {
            main_text: cityData.name,
            secondary_text: `${cityData.state}, India`,
          },
          geometry: {
            location: {
              lat: cityData.coordinates.lat + (Math.random() - 0.5) * 0.01,
              lng: cityData.coordinates.lng + (Math.random() - 0.5) * 0.01,
            },
          },
        })
      }

      // Search through landmarks in each city
      cityData.landmarks.forEach((landmark, index) => {
        if (landmark.toLowerCase().includes(query.toLowerCase())) {
          mockPlaces.push({
            place_id: `${cityKey}_${index}`,
            description: `${landmark}, ${cityData.name}, ${cityData.state}, India`,
            structured_formatting: {
              main_text: landmark,
              secondary_text: `${cityData.name}, ${cityData.state}, India`,
            },
            geometry: {
              location: {
                lat: cityData.coordinates.lat + (Math.random() - 0.5) * 0.05,
                lng: cityData.coordinates.lng + (Math.random() - 0.5) * 0.05,
              },
            },
          })
        }
      })

      // Generate street suggestions for the query in each major city
      if (query.length >= 3) {
        mockPlaces.push({
          place_id: `street_${cityKey}_${query}`,
          description: `${query} Road, ${cityData.name}, ${cityData.state}, India`,
          structured_formatting: {
            main_text: `${query} Road`,
            secondary_text: `${cityData.name}, ${cityData.state}, India`,
          },
          geometry: {
            location: {
              lat: cityData.coordinates.lat + (Math.random() - 0.5) * 0.1,
              lng: cityData.coordinates.lng + (Math.random() - 0.5) * 0.1,
            },
          },
        })
      }
    })

    // Add some international locations for comparison
    const internationalPlaces: PlaceResult[] = [
      {
        place_id: "us_1",
        description: `${query} Street, New York, NY, USA`,
        structured_formatting: {
          main_text: `${query} Street`,
          secondary_text: "New York, NY, USA",
        },
        geometry: {
          location: {
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.006 + (Math.random() - 0.5) * 0.1,
          },
        },
      },
      {
        place_id: "uk_1",
        description: `${query} Road, London, United Kingdom`,
        structured_formatting: {
          main_text: `${query} Road`,
          secondary_text: "London, United Kingdom",
        },
        geometry: {
          location: {
            lat: 51.5074 + (Math.random() - 0.5) * 0.1,
            lng: -0.1278 + (Math.random() - 0.5) * 0.1,
          },
        },
      },
    ]

    // Combine Indian and international results, prioritizing Indian locations
    const allPlaces = [...mockPlaces, ...internationalPlaces]

    // Filter and limit results
    const filteredPlaces = allPlaces
      .filter((place) => place.description.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8) // Show more results to accommodate Indian cities

    // Simulate API delay
    setTimeout(() => {
      setSuggestions(filteredPlaces)
      setIsLoading(false)
    }, 200)
  }, [])

  const getPlaceDetails = useCallback(
    async (placeId: string): Promise<PlaceResult | null> => {
      const place = suggestions.find((p) => p.place_id === placeId)
      return place || null
    },
    [suggestions],
  )

  return {
    suggestions,
    isLoading,
    searchPlaces,
    getPlaceDetails,
  }
}
