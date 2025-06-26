export interface Node {
  id: string
  name: string
  x: number
  y: number
  lat: number
  lng: number
  type: "city" | "waypoint"
}

export interface Edge {
  from: string
  to: string
  weight: number
  distance: number
}

export interface AStarResult {
  path: string[]
  visitedNodes: string[]
  totalDistance: number
  steps: AStarStep[]
}

export interface AStarStep {
  current: string
  openSet: string[]
  closedSet: string[]
  gScore: Record<string, number>
  fScore: Record<string, number>
  heuristic: Record<string, number>
}

export class AStarPathfinder {
  private nodes: Map<string, Node> = new Map()
  private edges: Map<string, Edge[]> = new Map()

  addNode(node: Node) {
    this.nodes.set(node.id, node)
    if (!this.edges.has(node.id)) {
      this.edges.set(node.id, [])
    }
  }

  addEdge(from: string, to: string, weight: number) {
    const fromNode = this.nodes.get(from)
    const toNode = this.nodes.get(to)

    if (!fromNode || !toNode) return

    const distance = this.calculateDistance(fromNode, toNode)

    // Add bidirectional edges
    this.edges.get(from)?.push({ from, to, weight, distance })
    this.edges.get(to)?.push({ from: to, to: from, weight, distance })
  }

  private calculateDistance(node1: Node, node2: Node): number {
    // Haversine formula for real-world distance
    const R = 6371 // Earth's radius in km
    const dLat = this.toRadians(node2.lat - node1.lat)
    const dLng = this.toRadians(node2.lng - node1.lng)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(node1.lat)) *
        Math.cos(this.toRadians(node2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  private heuristic(from: string, to: string): number {
    const fromNode = this.nodes.get(from)
    const toNode = this.nodes.get(to)

    if (!fromNode || !toNode) return Number.POSITIVE_INFINITY

    return this.calculateDistance(fromNode, toNode)
  }

  findPath(start: string, goal: string): AStarResult | null {
    const openSet = new Set([start])
    const closedSet = new Set<string>()
    const cameFrom = new Map<string, string>()

    const gScore = new Map<string, number>()
    const fScore = new Map<string, number>()

    // Initialize scores
    for (const nodeId of this.nodes.keys()) {
      gScore.set(nodeId, Number.POSITIVE_INFINITY)
      fScore.set(nodeId, Number.POSITIVE_INFINITY)
    }

    gScore.set(start, 0)
    fScore.set(start, this.heuristic(start, goal))

    const steps: AStarStep[] = []
    const visitedNodes: string[] = []

    while (openSet.size > 0) {
      // Find node with lowest fScore
      let current = Array.from(openSet).reduce((lowest, node) =>
        (fScore.get(node) || Number.POSITIVE_INFINITY) < (fScore.get(lowest) || Number.POSITIVE_INFINITY)
          ? node
          : lowest,
      )

      // Record step for visualization
      const gScoreObj: Record<string, number> = {}
      const fScoreObj: Record<string, number> = {}
      const heuristicObj: Record<string, number> = {}

      for (const [nodeId, score] of gScore) {
        gScoreObj[nodeId] = score
      }
      for (const [nodeId, score] of fScore) {
        fScoreObj[nodeId] = score
      }
      for (const nodeId of this.nodes.keys()) {
        heuristicObj[nodeId] = this.heuristic(nodeId, goal)
      }

      steps.push({
        current,
        openSet: Array.from(openSet),
        closedSet: Array.from(closedSet),
        gScore: gScoreObj,
        fScore: fScoreObj,
        heuristic: heuristicObj,
      })

      if (current === goal) {
        // Reconstruct path
        const path = [current]
        while (cameFrom.has(current)) {
          current = cameFrom.get(current)!
          path.unshift(current)
        }

        const totalDistance = path.reduce((total, nodeId, index) => {
          if (index === 0) return 0
          const prevNode = this.nodes.get(path[index - 1])!
          const currNode = this.nodes.get(nodeId)!
          return total + this.calculateDistance(prevNode, currNode)
        }, 0)

        return {
          path,
          visitedNodes,
          totalDistance,
          steps,
        }
      }

      openSet.delete(current)
      closedSet.add(current)
      visitedNodes.push(current)

      // Check neighbors
      const neighbors = this.edges.get(current) || []

      for (const edge of neighbors) {
        const neighbor = edge.to

        if (closedSet.has(neighbor)) continue

        const tentativeGScore = (gScore.get(current) || Number.POSITIVE_INFINITY) + edge.weight

        if (!openSet.has(neighbor)) {
          openSet.add(neighbor)
        } else if (tentativeGScore >= (gScore.get(neighbor) || Number.POSITIVE_INFINITY)) {
          continue
        }

        cameFrom.set(neighbor, current)
        gScore.set(neighbor, tentativeGScore)
        fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, goal))
      }
    }

    return null // No path found
  }

  getNodes(): Node[] {
    return Array.from(this.nodes.values())
  }

  getEdges(): Edge[] {
    const allEdges: Edge[] = []
    for (const edges of this.edges.values()) {
      allEdges.push(...edges)
    }
    return allEdges
  }
}
