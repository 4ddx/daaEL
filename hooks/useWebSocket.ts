"use client"

import { useEffect, useRef } from "react"
import { useTrafficStore } from "@/lib/store"

export function useWebSocket(url = "ws://localhost:3001") {
  const ws = useRef<WebSocket | null>(null)
  const { addIncident, updateEdgeWeight } = useTrafficStore()

  useEffect(() => {
    // Create WebSocket connection
    ws.current = new WebSocket(url)

    ws.current.onopen = () => {
      console.log("WebSocket connected")
    }

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        switch (data.type) {
          case "incident":
            addIncident(data.payload)
            break
          case "traffic_update":
            data.payload.forEach(({ edgeId, weight }: { edgeId: string; weight: number }) => {
              updateEdgeWeight(edgeId, weight)
            })
            break
          default:
            console.log("Unknown message type:", data.type)
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    ws.current.onclose = () => {
      console.log("WebSocket disconnected")
    }

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url, addIncident, updateEdgeWeight])

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    }
  }

  return { sendMessage }
}
