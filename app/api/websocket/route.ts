import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  // This is a mock WebSocket endpoint for demonstration
  // In a real application, you would set up a proper WebSocket server

  return new Response(
    JSON.stringify({
      message: "WebSocket endpoint - use a proper WebSocket server for production",
      endpoints: {
        incidents: "/api/incidents",
        traffic: "/api/traffic",
      },
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}
