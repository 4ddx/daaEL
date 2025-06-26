"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Input } from "@/components/input"
import { Badge } from "@/components/badge"
import { Textarea } from "@/components/textarea"
import { useTrafficStore } from "@/lib/store"
import type { TrafficIncident } from "@/types/traffic"
import { AlertTriangle, Plus, X, Zap, Trash2, Car, Construction, Ban, Clock } from "lucide-react"

export function IncidentSimulator() {
  const { incidents, edges, addIncident, removeIncident, generateRandomIncident, clearAllIncidents } = useTrafficStore()

  const [newIncident, setNewIncident] = useState({
    type: "accident" as TrafficIncident["type"],
    location: "",
    severity: "medium" as TrafficIncident["severity"],
    description: "",
    duration: 30,
  })

  const handleAddIncident = () => {
    if (!newIncident.location || !newIncident.description) return

    const incident: TrafficIncident = {
      id: `inc-${Date.now()}`,
      type: newIncident.type,
      location: newIncident.location,
      severity: newIncident.severity,
      description: newIncident.description,
      startTime: new Date(),
      estimatedDuration: newIncident.duration,
      affectedEdges: [newIncident.location],
    }

    addIncident(incident)
    setNewIncident({
      type: "accident",
      location: "",
      severity: "medium",
      description: "",
      duration: 30,
    })
  }

  const getSeverityColor = (severity: TrafficIncident["severity"]) => {
    switch (severity) {
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "critical":
        return "bg-red-200 text-red-900 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getIncidentIcon = (type: TrafficIncident["type"]) => {
    switch (type) {
      case "accident":
        return <Car className="h-4 w-4" />
      case "construction":
        return <Construction className="h-4 w-4" />
      case "closure":
        return <Ban className="h-4 w-4" />
      case "congestion":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getIncidentTypeColor = (type: TrafficIncident["type"]) => {
    switch (type) {
      case "accident":
        return "text-red-600 bg-red-50"
      case "construction":
        return "text-orange-600 bg-orange-50"
      case "closure":
        return "text-gray-600 bg-gray-50"
      case "congestion":
        return "text-yellow-600 bg-yellow-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Incident Simulator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Incident */}
        <div className="space-y-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
          <h4 className="font-medium text-sm flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create New Incident</span>
          </h4>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Incident Type</label>
              <Select
                value={newIncident.type}
                onValueChange={(value: TrafficIncident["type"]) => setNewIncident((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accident">
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-red-600" />
                      <span>Vehicle Accident</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="construction">
                    <div className="flex items-center space-x-2">
                      <Construction className="h-4 w-4 text-orange-600" />
                      <span>Road Construction</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="closure">
                    <div className="flex items-center space-x-2">
                      <Ban className="h-4 w-4 text-gray-600" />
                      <span>Road Closure</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="congestion">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span>Traffic Congestion</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Location</label>
              <Select
                value={newIncident.location}
                onValueChange={(value) => setNewIncident((prev) => ({ ...prev, location: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select road segment" />
                </SelectTrigger>
                <SelectContent>
                  {edges.map((edge) => (
                    <SelectItem key={edge.id} value={edge.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{edge.id}</span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {edge.roadType}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Severity</label>
                <Select
                  value={newIncident.severity}
                  onValueChange={(value: TrafficIncident["severity"]) =>
                    setNewIncident((prev) => ({ ...prev, severity: value }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Impact</SelectItem>
                    <SelectItem value="medium">Medium Impact</SelectItem>
                    <SelectItem value="high">High Impact</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Duration (min)</label>
                <Input
                  type="number"
                  value={newIncident.duration}
                  onChange={(e) =>
                    setNewIncident((prev) => ({
                      ...prev,
                      duration: Number.parseInt(e.target.value) || 30,
                    }))
                  }
                  className="h-9"
                  min="5"
                  max="300"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
              <Textarea
                placeholder="Describe the incident..."
                value={newIncident.description}
                onChange={(e) => setNewIncident((prev) => ({ ...prev, description: e.target.value }))}
                className="h-16 text-sm resize-none"
              />
            </div>

            <Button
              onClick={handleAddIncident}
              className="w-full h-9"
              size="sm"
              disabled={!newIncident.location || !newIncident.description}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Incident
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Quick Actions</label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={generateRandomIncident} className="h-9">
              <Zap className="h-3 w-3 mr-1" />
              Random Incident
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllIncidents}
              disabled={incidents.length === 0}
              className="h-9"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Active Incidents</label>
            <Badge variant="outline" className="text-xs">
              {incidents.length} active
            </Badge>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${getIncidentTypeColor(incident.type)}`}>
                        {getIncidentIcon(incident.type)}
                      </div>
                      <Badge variant="outline" className={`text-xs border ${getSeverityColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {incident.location}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">{incident.description}</p>

                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>Started: {incident.startTime.toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>Duration: {incident.estimatedDuration}min</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIncident(incident.id)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {incidents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active incidents</p>
                <p className="text-xs">Create an incident to see traffic impact</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
