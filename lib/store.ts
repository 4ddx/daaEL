import { create } from "zustand"
import type { Graph, Node, Edge, TrafficIncident } from "@/types/graph"
import type { Route } from "@/types/navigation"
import { mockNodes, mockEdges, mockIncidents } from "./mockData"

interface Coordinates {
  lat: number
  lng: number
}

interface TrafficStore {
  // Graph data
  graph: Graph
  nodes: Node[]
  edges: Edge[]

  // Map view
  customMapCoordinates: Coordinates[] | null

  // Simulation state
  isSimulationRunning: boolean
  currentTime: Date
  timeMultiplier: number
  trafficDensity: number
  timeOfDay: "morning" | "midday" | "peak" | "night"

  // Traffic data
  incidents: TrafficIncident[]

  // Navigation
  selectedOrigin: string | null
  selectedDestination: string | null
  currentRoute: Route | null
  alternativeRoutes: Route[]
  routePreferences: {
    avoidTraffic: boolean
    preferHighways: boolean
    avoidTolls: boolean
    routeType: "fastest" | "shortest" | "balanced"
  }

  // UI state
  selectedIncident: TrafficIncident | null

  // Actions
  setCustomMapCoordinates: (coordinates: Coordinates[] | null) => void
  setSimulationRunning: (running: boolean) => void
  setTimeMultiplier: (multiplier: number) => void
  setTrafficDensity: (density: number) => void
  setTimeOfDay: (time: "morning" | "midday" | "peak" | "night") => void
  addIncident: (incident: TrafficIncident) => void
  removeIncident: (incidentId: string) => void
  setSelectedOrigin: (nodeId: string | null) => void
  setSelectedDestination: (nodeId: string | null) => void
  setCurrentRoute: (route: Route | null) => void
  setAlternativeRoutes: (routes: Route[]) => void
  setRoutePreferences: (preferences: Partial<typeof this.routePreferences>) => void
  updateEdgeWeight: (edgeId: string, weight: number) => void
  initializeGraph: () => void
  resetSimulation: () => void
  generateRandomIncident: () => void
  clearAllIncidents: () => void
  updateTrafficConditions: () => void
}

export const useTrafficStore = create<TrafficStore>((set, get) => ({
  // Initial state
  graph: { nodes: new Map(), edges: new Map(), adjacencyList: new Map() },
  nodes: [],
  edges: [],
  customMapCoordinates: null,
  isSimulationRunning: false,
  currentTime: new Date(),
  timeMultiplier: 1,
  trafficDensity: 50,
  timeOfDay: "peak",
  incidents: [],
  selectedOrigin: null,
  selectedDestination: null,
  currentRoute: null,
  alternativeRoutes: [],
  routePreferences: {
    avoidTraffic: true,
    preferHighways: false,
    avoidTolls: false,
    routeType: "fastest",
  },
  selectedIncident: null,

  // Actions
  setCustomMapCoordinates: (coordinates) => set({ customMapCoordinates: coordinates }),

  setSimulationRunning: (running) => {
    set({ isSimulationRunning: running })
    if (running) {
      // Start simulation timer with traffic updates
      const interval = setInterval(() => {
        const state = get()
        if (!state.isSimulationRunning) {
          clearInterval(interval)
          return
        }
        set({ currentTime: new Date(state.currentTime.getTime() + 60000 * state.timeMultiplier) })

        // Update traffic conditions periodically
        if (Math.random() > 0.7) {
          get().updateTrafficConditions()
        }
      }, 1000)
    }
  },

  setTimeMultiplier: (multiplier) => set({ timeMultiplier: multiplier }),

  setTrafficDensity: (density) => {
    set({ trafficDensity: density })
    // Update edge weights based on density
    const state = get()
    const updatedEdges = state.edges.map((edge) => ({
      ...edge,
      currentWeight: edge.baseWeight * (1 + density / 100),
    }))
    set({ edges: updatedEdges })
    get().updateTrafficConditions()
  },

  setTimeOfDay: (time) => {
    set({ timeOfDay: time })
    // Adjust traffic based on time of day
    const state = get()
    const multipliers = {
      morning: 1.3,
      midday: 0.8,
      peak: 1.8,
      night: 0.5,
    }
    const updatedEdges = state.edges.map((edge) => ({
      ...edge,
      currentWeight: edge.baseWeight * multipliers[time],
      trafficLevel: multipliers[time] > 1.5 ? "heavy" : multipliers[time] > 1.2 ? "moderate" : "light",
    }))
    set({ edges: updatedEdges })
  },

  addIncident: (incident) =>
    set((state) => {
      const incidents = [...state.incidents, incident]
      // Update affected edges
      const updatedEdges = state.edges.map((edge) => {
        if (incident.affectedEdges.includes(edge.id)) {
          const severityMultiplier = {
            low: 1.2,
            medium: 1.5,
            high: 2.0,
            critical: 3.0,
          }[incident.severity]
          return {
            ...edge,
            currentWeight: edge.baseWeight * severityMultiplier,
            trafficLevel: incident.severity === "critical" ? "blocked" : "heavy",
          }
        }
        return edge
      })
      return { incidents, edges: updatedEdges }
    }),

  removeIncident: (incidentId) =>
    set((state) => {
      const incident = state.incidents.find((inc) => inc.id === incidentId)
      const incidents = state.incidents.filter((inc) => inc.id !== incidentId)

      // Restore affected edges
      const updatedEdges = state.edges.map((edge) => {
        if (incident?.affectedEdges.includes(edge.id)) {
          return {
            ...edge,
            currentWeight: edge.baseWeight,
            trafficLevel: "free",
          }
        }
        return edge
      })

      return { incidents, edges: updatedEdges }
    }),

  setSelectedOrigin: (nodeId) => set({ selectedOrigin: nodeId }),
  setSelectedDestination: (nodeId) => set({ selectedDestination: nodeId }),
  setCurrentRoute: (route) => set({ currentRoute: route }),
  setAlternativeRoutes: (routes) => set({ alternativeRoutes: routes }),

  setRoutePreferences: (preferences) =>
    set((state) => ({
      routePreferences: { ...state.routePreferences, ...preferences },
    })),

  updateEdgeWeight: (edgeId, weight) =>
    set((state) => {
      const updatedEdges = state.edges.map((edge) => (edge.id === edgeId ? { ...edge, currentWeight: weight } : edge))
      return { edges: updatedEdges }
    }),

  updateTrafficConditions: () => {
    set((state) => {
      const updatedEdges = state.edges.map((edge) => {
        // Simulate dynamic traffic changes
        const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
        const newWeight = edge.baseWeight * randomFactor * (1 + state.trafficDensity / 100)

        // Update traffic level based on weight
        let trafficLevel = edge.trafficLevel
        if (newWeight > edge.baseWeight * 2) trafficLevel = "heavy"
        else if (newWeight > edge.baseWeight * 1.5) trafficLevel = "moderate"
        else if (newWeight > edge.baseWeight * 1.2) trafficLevel = "light"
        else trafficLevel = "free"

        return {
          ...edge,
          currentWeight: newWeight,
          trafficLevel,
        }
      })
      return { edges: updatedEdges }
    })
  },

  resetSimulation: () => {
    set({
      isSimulationRunning: false,
      currentTime: new Date(),
      incidents: [],
      selectedOrigin: null,
      selectedDestination: null,
      currentRoute: null,
      alternativeRoutes: [],
      trafficDensity: 50,
      timeOfDay: "peak",
      customMapCoordinates: null,
    })
    // Reset edges to base weights
    const state = get()
    const resetEdges = state.edges.map((edge) => ({
      ...edge,
      currentWeight: edge.baseWeight,
      trafficLevel: "free",
    }))
    set({ edges: resetEdges })
  },

  generateRandomIncident: () => {
    const state = get()
    const types: TrafficIncident["type"][] = ["accident", "construction", "closure", "congestion"]
    const severities: TrafficIncident["severity"][] = ["low", "medium", "high"]
    const randomEdge = state.edges[Math.floor(Math.random() * state.edges.length)]

    const incident: TrafficIncident = {
      id: `inc-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      location: randomEdge.id,
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: `Random ${types[Math.floor(Math.random() * types.length)]} on ${randomEdge.roadType}`,
      startTime: new Date(),
      estimatedDuration: 15 + Math.random() * 60,
      affectedEdges: [randomEdge.id],
    }

    get().addIncident(incident)
  },

  clearAllIncidents: () => {
    const state = get()
    state.incidents.forEach((incident) => {
      get().removeIncident(incident.id)
    })
  },

  initializeGraph: () => {
    const nodes = new Map<string, Node>()
    const edges = new Map<string, Edge>()
    const adjacencyList = new Map<string, string[]>()

    // Initialize nodes
    mockNodes.forEach((node) => {
      nodes.set(node.id, node)
      adjacencyList.set(node.id, [])
    })

    // Initialize edges and adjacency list
    mockEdges.forEach((edge) => {
      edges.set(edge.id, edge)

      // Add to adjacency list (bidirectional)
      const fromNeighbors = adjacencyList.get(edge.from) || []
      const toNeighbors = adjacencyList.get(edge.to) || []

      fromNeighbors.push(edge.to)
      toNeighbors.push(edge.from)

      adjacencyList.set(edge.from, fromNeighbors)
      adjacencyList.set(edge.to, toNeighbors)
    })

    set({
      graph: { nodes, edges, adjacencyList },
      nodes: mockNodes,
      edges: mockEdges,
      incidents: mockIncidents,
    })
  },
}))
