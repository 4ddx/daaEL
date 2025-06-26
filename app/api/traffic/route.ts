import { NextResponse } from "next/server"
import { mockEdges } from "@/lib/mockData"

export async function GET() {
  // Simulate real-time traffic updates
  const updatedEdges = mockEdges.map((edge) => ({
    ...edge,
    currentWeight: edge.baseWeight + Math.random() * 5,
    trafficLevel: Math.random() > 0.7 ? "heavy" : edge.trafficLevel,
  }))

  return NextResponse.json(updatedEdges)
}
