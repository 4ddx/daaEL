import type { Graph, Edge, PathResult } from "@/types/graph"

export class Dijkstra {
  private graph: Graph

  constructor(graph: Graph) {
    this.graph = graph
  }

  findPath(startId: string, goalId: string): PathResult | null {
    const distances = new Map<string, number>()
    const previous = new Map<string, string>()
    const unvisited = new Set<string>()

    // Initialize distances
    for (const nodeId of this.graph.nodes.keys()) {
      distances.set(nodeId, Number.POSITIVE_INFINITY)
      unvisited.add(nodeId)
    }
    distances.set(startId, 0)

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      const current = Array.from(unvisited).reduce((min, nodeId) =>
        (distances.get(nodeId) || Number.POSITIVE_INFINITY) < (distances.get(min) || Number.POSITIVE_INFINITY)
          ? nodeId
          : min,
      )

      if (current === goalId) {
        return this.reconstructPath(previous, current, distances.get(current) || 0)
      }

      unvisited.delete(current)

      const neighbors = this.graph.adjacencyList.get(current) || []
      for (const neighbor of neighbors) {
        if (!unvisited.has(neighbor)) continue

        const edge = this.getEdge(current, neighbor)
        if (!edge) continue

        const tentativeDistance = (distances.get(current) || Number.POSITIVE_INFINITY) + edge.currentWeight

        if (tentativeDistance < (distances.get(neighbor) || Number.POSITIVE_INFINITY)) {
          distances.set(neighbor, tentativeDistance)
          previous.set(neighbor, current)
        }
      }
    }

    return null
  }

  private getEdge(from: string, to: string): Edge | undefined {
    const edgeId = `${from}${to}`
    const reverseEdgeId = `${to}${from}`
    return this.graph.edges.get(edgeId) || this.graph.edges.get(reverseEdgeId)
  }

  private reconstructPath(previous: Map<string, string>, current: string, totalCost: number): PathResult {
    const path = [current]
    const edges: Edge[] = []
    let totalDistance = 0

    while (previous.has(current)) {
      const prev = previous.get(current)!
      path.unshift(prev)

      const edge = this.getEdge(prev, current)
      if (edge) {
        edges.unshift(edge)
        totalDistance += edge.distance
      }

      current = prev
    }

    return {
      path,
      totalDistance,
      totalTime: totalCost,
      edges,
    }
  }
}
