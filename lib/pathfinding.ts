import type { Graph, Edge, PathResult } from "@/types/graph"

export class AStar {
  private graph: Graph

  constructor(graph: Graph) {
    this.graph = graph
  }

  findPath(startId: string, goalId: string): PathResult | null {
    // First try direct pathfinding
    const directPath = this.findDirectPath(startId, goalId)
    if (directPath) {
      return directPath
    }

    // If no direct path, try finding path through intermediate nodes
    console.log(`No direct path from ${startId} to ${goalId}, trying intermediate routes...`)

    const allNodes = Array.from(this.graph.nodes.keys())
    let bestPath: PathResult | null = null
    let shortestDistance = Number.POSITIVE_INFINITY

    // Try routing through each intermediate node
    for (const intermediateId of allNodes) {
      if (intermediateId === startId || intermediateId === goalId) continue

      const pathToIntermediate = this.findDirectPath(startId, intermediateId)
      const pathFromIntermediate = this.findDirectPath(intermediateId, goalId)

      if (pathToIntermediate && pathFromIntermediate) {
        // Combine the two paths
        const combinedPath = this.combinePaths(pathToIntermediate, pathFromIntermediate)

        if (combinedPath.totalDistance < shortestDistance) {
          shortestDistance = combinedPath.totalDistance
          bestPath = combinedPath
        }
      }
    }

    if (bestPath) {
      console.log(`Found route via intermediate cities: ${bestPath.path.join(" → ")}`)
      return bestPath
    }

    // If still no path, try multi-hop routing (up to 3 intermediate cities)
    return this.findMultiHopPath(startId, goalId, 3)
  }

  private findDirectPath(startId: string, goalId: string): PathResult | null {
    const openSet = new Set<string>([startId])
    const cameFrom = new Map<string, string>()
    const gScore = new Map<string, number>()
    const fScore = new Map<string, number>()

    // Initialize scores
    for (const nodeId of this.graph.nodes.keys()) {
      gScore.set(nodeId, Number.POSITIVE_INFINITY)
      fScore.set(nodeId, Number.POSITIVE_INFINITY)
    }
    gScore.set(startId, 0)
    fScore.set(startId, this.heuristic(startId, goalId))

    while (openSet.size > 0) {
      // Find node with lowest fScore
      const current = Array.from(openSet).reduce((lowest, nodeId) =>
        (fScore.get(nodeId) || Number.POSITIVE_INFINITY) < (fScore.get(lowest) || Number.POSITIVE_INFINITY)
          ? nodeId
          : lowest,
      )

      if (current === goalId) {
        return this.reconstructPath(cameFrom, current, gScore.get(current) || 0)
      }

      openSet.delete(current)
      const neighbors = this.graph.adjacencyList.get(current) || []

      for (const neighbor of neighbors) {
        const edge = this.getEdge(current, neighbor)
        if (!edge) continue

        const tentativeGScore = (gScore.get(current) || Number.POSITIVE_INFINITY) + edge.currentWeight

        if (tentativeGScore < (gScore.get(neighbor) || Number.POSITIVE_INFINITY)) {
          cameFrom.set(neighbor, current)
          gScore.set(neighbor, tentativeGScore)
          fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, goalId))

          if (!openSet.has(neighbor)) {
            openSet.add(neighbor)
          }
        }
      }
    }

    return null // No direct path found
  }

  private findMultiHopPath(startId: string, goalId: string, maxHops: number): PathResult | null {
    if (maxHops <= 0) return null

    const allNodes = Array.from(this.graph.nodes.keys())
    let bestPath: PathResult | null = null
    let shortestDistance = Number.POSITIVE_INFINITY

    // Try all combinations of intermediate nodes
    for (let hopCount = 1; hopCount <= maxHops; hopCount++) {
      const combinations = this.generateCombinations(
        allNodes.filter((id) => id !== startId && id !== goalId),
        hopCount,
      )

      for (const intermediateNodes of combinations) {
        const fullPath = [startId, ...intermediateNodes, goalId]
        const pathResult = this.calculatePathThroughNodes(fullPath)

        if (pathResult && pathResult.totalDistance < shortestDistance) {
          shortestDistance = pathResult.totalDistance
          bestPath = pathResult
        }
      }
    }

    if (bestPath) {
      console.log(`Found multi-hop route: ${bestPath.path.join(" → ")}`)
    }

    return bestPath
  }

  private generateCombinations<T>(array: T[], size: number): T[][] {
    if (size === 0) return [[]]
    if (size > array.length) return []

    const result: T[][] = []

    for (let i = 0; i <= array.length - size; i++) {
      const head = array[i]
      const tailCombinations = this.generateCombinations(array.slice(i + 1), size - 1)

      for (const tail of tailCombinations) {
        result.push([head, ...tail])
      }
    }

    return result
  }

  private calculatePathThroughNodes(nodeSequence: string[]): PathResult | null {
    let totalDistance = 0
    let totalTime = 0
    const allEdges: Edge[] = []
    const fullPath: string[] = []

    for (let i = 0; i < nodeSequence.length - 1; i++) {
      const segmentPath = this.findDirectPath(nodeSequence[i], nodeSequence[i + 1])
      if (!segmentPath) {
        return null // Can't complete this route
      }

      totalDistance += segmentPath.totalDistance
      totalTime += segmentPath.totalTime
      allEdges.push(...segmentPath.edges)

      if (i === 0) {
        fullPath.push(...segmentPath.path)
      } else {
        // Skip the first node to avoid duplication
        fullPath.push(...segmentPath.path.slice(1))
      }
    }

    return {
      path: fullPath,
      totalDistance,
      totalTime,
      edges: allEdges,
    }
  }

  private combinePaths(path1: PathResult, path2: PathResult): PathResult {
    // Remove the duplicate intermediate node
    const combinedPath = [...path1.path, ...path2.path.slice(1)]

    return {
      path: combinedPath,
      totalDistance: path1.totalDistance + path2.totalDistance,
      totalTime: path1.totalTime + path2.totalTime,
      edges: [...path1.edges, ...path2.edges],
    }
  }

  private heuristic(nodeId1: string, nodeId2: string): number {
    const node1 = this.graph.nodes.get(nodeId1)
    const node2 = this.graph.nodes.get(nodeId2)

    if (!node1 || !node2) return Number.POSITIVE_INFINITY

    // Haversine distance
    const R = 6371 // Earth's radius in km
    const dLat = this.toRadians(node2.coordinates[0] - node1.coordinates[0])
    const dLon = this.toRadians(node2.coordinates[1] - node1.coordinates[1])

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(node1.coordinates[0])) *
        Math.cos(this.toRadians(node2.coordinates[0])) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  private getEdge(from: string, to: string): Edge | undefined {
    const edgeId = `${from}${to}`
    const reverseEdgeId = `${to}${from}`
    return this.graph.edges.get(edgeId) || this.graph.edges.get(reverseEdgeId)
  }

  private reconstructPath(cameFrom: Map<string, string>, current: string, totalCost: number): PathResult {
    const path = [current]
    const edges: Edge[] = []
    let totalDistance = 0

    while (cameFrom.has(current)) {
      const previous = cameFrom.get(current)!
      path.unshift(previous)

      const edge = this.getEdge(previous, current)
      if (edge) {
        edges.unshift(edge)
        totalDistance += edge.distance
      }

      current = previous
    }

    return {
      path,
      totalDistance,
      totalTime: totalCost,
      edges,
    }
  }
}
