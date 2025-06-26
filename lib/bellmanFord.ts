import type { Graph, Edge, PathResult } from "@/types/graph"

export class BellmanFord {
  private graph: Graph

  constructor(graph: Graph) {
    this.graph = graph
  }

  findPath(startId: string, goalId: string): PathResult | null {
    const distances = new Map<string, number>()
    const previous = new Map<string, string>()
    const nodes = Array.from(this.graph.nodes.keys())

    // Initialize distances
    for (const nodeId of nodes) {
      distances.set(nodeId, Number.POSITIVE_INFINITY)
    }
    distances.set(startId, 0)

    // Relax edges repeatedly
    for (let i = 0; i < nodes.length - 1; i++) {
      let updated = false

      for (const [edgeId, edge] of this.graph.edges) {
        const fromDistance = distances.get(edge.from) || Number.POSITIVE_INFINITY
        const toDistance = distances.get(edge.to) || Number.POSITIVE_INFINITY

        // Check both directions
        if (fromDistance + edge.currentWeight < toDistance) {
          distances.set(edge.to, fromDistance + edge.currentWeight)
          previous.set(edge.to, edge.from)
          updated = true
        }

        if (toDistance + edge.currentWeight < fromDistance) {
          distances.set(edge.from, toDistance + edge.currentWeight)
          previous.set(edge.from, edge.to)
          updated = true
        }
      }

      if (!updated) break // Early termination if no updates
    }

    // Check for negative cycles
    for (const [edgeId, edge] of this.graph.edges) {
      const fromDistance = distances.get(edge.from) || Number.POSITIVE_INFINITY
      const toDistance = distances.get(edge.to) || Number.POSITIVE_INFINITY

      if (fromDistance + edge.currentWeight < toDistance || toDistance + edge.currentWeight < fromDistance) {
        console.warn("Negative cycle detected")
        return null
      }
    }

    if (!previous.has(goalId) && goalId !== startId) {
      return null
    }

    return this.reconstructPath(previous, goalId, distances.get(goalId) || 0)
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

  private getEdge(from: string, to: string): Edge | undefined {
    const edgeId = `${from}${to}`
    const reverseEdgeId = `${to}${from}`
    return this.graph.edges.get(edgeId) || this.graph.edges.get(reverseEdgeId)
  }
}
