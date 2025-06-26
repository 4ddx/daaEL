"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/input"
import { useGooglePlaces, type PlaceResult } from "@/hooks/useGooglePlaces"
import { Search, Loader2, MapPin } from "lucide-react"

interface PlaceSearchInputProps {
  placeholder: string
  onPlaceSelect: (place: PlaceResult) => void
  value?: string
}

export function PlaceSearchInput({ placeholder, onPlaceSelect, value }: PlaceSearchInputProps) {
  const [query, setQuery] = useState(value || "")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { suggestions, isLoading, searchPlaces } = useGooglePlaces()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        searchPlaces(query)
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [query, searchPlaces])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handlePlaceSelect = (place: PlaceResult) => {
    setQuery(`${place.structured_formatting.main_text}, ${place.structured_formatting.secondary_text}`)
    setShowSuggestions(false)
    onPlaceSelect(place)
  }

  const getLocationIcon = (description: string): string => {
    if (description.includes("India")) return "🇮🇳"
    if (description.includes("USA")) return "🇺🇸"
    if (description.includes("United Kingdom")) return "🇬🇧"
    if (description.includes("Japan")) return "🇯🇵"
    if (description.includes("South Africa")) return "🇿🇦"
    if (description.includes("Australia")) return "🇦🇺"
    if (description.includes("Brazil")) return "🇧🇷"
    if (description.includes("UAE")) return "🇦🇪"
    return "🌍"
  }

  const getLocationTypeIcon = (mainText: string): JSX.Element => {
    const text = mainText.toLowerCase()
    if (text.includes("road") || text.includes("street") || text.includes("avenue")) {
      return <MapPin className="h-4 w-4 text-gray-400" />
    }
    if (text.includes("place") || text.includes("circle") || text.includes("gate")) {
      return <span className="text-blue-500">🏛️</span>
    }
    if (text.includes("mall") || text.includes("market") || text.includes("bazaar")) {
      return <span className="text-green-500">🏪</span>
    }
    if (text.includes("airport") || text.includes("station")) {
      return <span className="text-purple-500">🚉</span>
    }
    return <MapPin className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((place) => (
            <button
              key={place.place_id}
              onClick={() => handlePlaceSelect(place)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 text-center">{getLocationIcon(place.description)}</div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {getLocationTypeIcon(place.structured_formatting.main_text)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{place.structured_formatting.main_text}</div>
                  <div className="text-sm text-gray-500 truncate">{place.structured_formatting.secondary_text}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && !isLoading && query.length >= 2 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500"
        >
          <div className="space-y-2">
            <p>No places found for "{query}"</p>
            <p className="text-xs text-gray-400">Try searching for Indian cities like Delhi, Mumbai, Bangalore, etc.</p>
          </div>
        </div>
      )}

      {/* Quick suggestions when input is focused but empty */}
      {showSuggestions && query.length === 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4"
        >
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Popular Indian Cities</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad", "Ahmedabad"].map((city) => (
                <button
                  key={city}
                  onClick={() => setQuery(city)}
                  className="text-left p-2 hover:bg-gray-50 rounded text-blue-600 hover:text-blue-800"
                >
                  🇮🇳 {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
