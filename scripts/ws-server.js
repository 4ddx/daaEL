import { WebSocketServer } from "ws"

const wss = new WebSocketServer({ port: 3001 })

console.log("WebSocket server running on ws://localhost:3001")

wss.on("connection", function connection(ws) {
  console.log("Client connected")

  // Send periodic traffic updates
  const trafficInterval = setInterval(() => {
    const trafficUpdate = {
      type: "traffic_update",
      payload: [
        { edgeId: "AB", weight: 8 + Math.random() * 10 },
        { edgeId: "BC", weight: 7 + Math.random() * 15 },
        { edgeId: "CD", weight: 6 + Math.random() * 8 },
      ],
    }

    if (ws.readyState === 1) {
      // WebSocket.OPEN
      ws.send(JSON.stringify(trafficUpdate))
    }
  }, 5000)

  // Send random incidents
  const incidentInterval = setInterval(() => {
    if (Math.random() > 0.8) {
      // 20% chance
      const incident = {
        type: "incident",
        payload: {
          id: `inc-${Date.now()}`,
          type: ["accident", "construction", "closure"][Math.floor(Math.random() * 3)],
          location: ["AB", "BC", "CD", "DE"][Math.floor(Math.random() * 4)],
          severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
          description: "Randomly generated incident for demo",
          startTime: new Date(),
          estimatedDuration: 30 + Math.random() * 60,
          affectedEdges: ["AB"],
        },
      }

      if (ws.readyState === 1) {
        // WebSocket.OPEN
        ws.send(JSON.stringify(incident))
      }
    }
  }, 10000)

  ws.on("close", () => {
    console.log("Client disconnected")
    clearInterval(trafficInterval)
    clearInterval(incidentInterval)
  })

  ws.on("message", (message) => {
    console.log("Received:", message.toString())
  })
})
