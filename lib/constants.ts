export const TRAFFIC_COLORS = {
  free: "#22c55e", // green
  light: "#84cc16", // lime
  moderate: "#eab308", // yellow
  heavy: "#f97316", // orange
  blocked: "#ef4444", // red
} as const

export const INCIDENT_COLORS = {
  accident: "#ef4444",
  construction: "#f97316",
  closure: "#dc2626",
  congestion: "#eab308",
} as const

export const DEFAULT_MAP_CENTER: [number, number] = [40.7128, -74.006] // NYC
export const DEFAULT_ZOOM = 13

export const SIMULATION_SPEEDS = {
  "0.5x": 0.5,
  "1x": 1,
  "2x": 2,
  "5x": 5,
  "10x": 10,
} as const

export const ROAD_SPEEDS = {
  highway: 65,
  arterial: 45,
  local: 35,
  residential: 25,
} as const
