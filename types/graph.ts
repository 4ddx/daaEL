export interface Node {
  id: string
  name: string
  coordinates: [number, number] // [lat, lng]
  type: "intersection" | "landmark" | "residential" | "commercial"
}

export interface Edge {
  id: string
  from: string
  to: string
  distance: number
  baseWeight: number
  currentWeight: number
  trafficLevel: TrafficLevel
  roadType: "highway" | "arterial" | "local" | "residential"
  speedLimit: number
  lanes: number
}

export interface Graph {
  nodes: Map<string, Node>
  edges: Map<string, Edge>
  adjacencyList: Map<string, string[]>
}

export type TrafficLevel = "free" | "light" | "moderate" | "heavy" | "blocked"

export interface PathResult {
  path: string[]
  totalDistance: number
  totalTime: number
  edges: Edge[]
}
