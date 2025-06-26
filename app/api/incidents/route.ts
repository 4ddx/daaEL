import { NextResponse } from "next/server"
import { mockIncidents } from "@/lib/mockData"

export async function GET() {
  return NextResponse.json(mockIncidents)
}

export async function POST(request: Request) {
  try {
    const incident = await request.json()

    // In a real application, you would save this to a database
    const newIncident = {
      ...incident,
      id: `inc-${Date.now()}`,
      startTime: new Date(),
    }

    return NextResponse.json(newIncident, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid incident data" }, { status: 400 })
  }
}
