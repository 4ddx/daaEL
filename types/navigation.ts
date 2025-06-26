export interface RouteRequest {
  origin: string
  destination: string
  preferences: RoutePreferences
}

export interface RoutePreferences {
  avoidTraffic: boolean
  preferHighways: boolean
  avoidTolls: boolean
  routeType: "fastest" | "shortest" | "balanced"
}

export interface RouteStep {
  instruction: string
  distance: number
  duration: number
  edgeId: string
  maneuver: "straight" | "left" | "right" | "u-turn"
}

export interface Route {
  id: string
  path: string[]
  steps: RouteStep[]
  totalDistance: number
  totalDuration: number
  trafficDelay: number
  sustainabilityScore: number
}
