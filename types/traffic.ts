export interface TrafficIncident {
  id: string
  type: "accident" | "construction" | "closure" | "congestion"
  location: string // node or edge ID
  severity: "low" | "medium" | "high" | "critical"
  description: string
  startTime: Date
  estimatedDuration: number // minutes
  affectedEdges: string[]
}

export type TrafficLevel = "freeFlow" | "moderate" | "congested" | "stopAndGo"

export interface TrafficData {
  timestamp: Date
  incidents: TrafficIncident[]
  edgeWeights: Map<string, number>
  congestionLevels: Map<string, TrafficLevel>
}

export interface SimulationState {
  isRunning: boolean
  currentTime: Date
  timeMultiplier: number
  incidents: TrafficIncident[]
  vehicles: Vehicle[]
}

export interface Vehicle {
  id: string
  currentEdge: string
  progress: number // 0-1 along the edge
  route: string[]
  destination: string
  speed: number
}
