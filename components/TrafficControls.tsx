"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Slider } from "@/components/slider"
import { Badge } from "@/components/badge"
import { useTrafficStore } from "@/lib/store"
import { SIMULATION_SPEEDS } from "@/lib/constants"
import { Play, Pause, RotateCcw, Clock, Gauge, Sun, Moon, Sunrise, Sunset } from "lucide-react"

export function TrafficControls() {
  const {
    isSimulationRunning,
    timeMultiplier,
    trafficDensity,
    timeOfDay,
    currentTime,
    setSimulationRunning,
    setTimeMultiplier,
    setTrafficDensity,
    setTimeOfDay,
    resetSimulation,
  } = useTrafficStore()

  const getTimeIcon = (time: string) => {
    switch (time) {
      case "morning":
        return <Sunrise className="h-4 w-4" />
      case "midday":
        return <Sun className="h-4 w-4" />
      case "peak":
        return <Sunset className="h-4 w-4" />
      case "night":
        return <Moon className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTimeDescription = (time: string) => {
    switch (time) {
      case "morning":
        return "Morning Rush (7-9 AM)"
      case "midday":
        return "Midday Traffic (11 AM-2 PM)"
      case "peak":
        return "Evening Rush (5-7 PM)"
      case "night":
        return "Night Time (10 PM-6 AM)"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Clock className="h-5 w-5 text-green-600" />
          <span>Simulation Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Simulation Status */}
        <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Status</span>
            <Badge
              variant={isSimulationRunning ? "default" : "secondary"}
              className={isSimulationRunning ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
            >
              {isSimulationRunning ? "Running" : "Paused"}
            </Badge>
          </div>
          <div className="text-xs text-gray-600">Current Time: {currentTime.toLocaleTimeString()}</div>
        </div>

        {/* Play/Pause Controls */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Simulation Control</label>
          <div className="flex space-x-2">
            <Button
              variant={isSimulationRunning ? "destructive" : "default"}
              onClick={() => setSimulationRunning(!isSimulationRunning)}
              className="flex-1 h-11"
            >
              {isSimulationRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Simulation
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Simulation
                </>
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={resetSimulation} className="h-11 w-11">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Simulation Speed</label>
            <Badge variant="outline" className="text-xs">
              {timeMultiplier}x
            </Badge>
          </div>
          <Select
            value={timeMultiplier.toString()}
            onValueChange={(value) => setTimeMultiplier(Number.parseFloat(value))}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SIMULATION_SPEEDS).map(([label, value]) => (
                <SelectItem key={label} value={value.toString()}>
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Traffic Density Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Traffic Density</label>
            <Badge variant="outline" className="text-xs">
              {trafficDensity}%
            </Badge>
          </div>
          <div className="space-y-2">
            <Slider
              value={[trafficDensity]}
              onValueChange={(value) => setTrafficDensity(value[0])}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Light</span>
              <span>Moderate</span>
              <span>Heavy</span>
            </div>
          </div>
        </div>

        {/* Time of Day Simulation */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Time of Day</label>
          <Select
            value={timeOfDay}
            onValueChange={(value: "morning" | "midday" | "peak" | "night") => setTimeOfDay(value)}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">
                <div className="flex items-center space-x-2">
                  <Sunrise className="h-4 w-4 text-orange-500" />
                  <span>Morning Rush</span>
                </div>
              </SelectItem>
              <SelectItem value="midday">
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span>Midday</span>
                </div>
              </SelectItem>
              <SelectItem value="peak">
                <div className="flex items-center space-x-2">
                  <Sunset className="h-4 w-4 text-red-500" />
                  <span>Evening Rush</span>
                </div>
              </SelectItem>
              <SelectItem value="night">
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4 text-blue-500" />
                  <span>Night Time</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">{getTimeDescription(timeOfDay)}</div>
        </div>

        {/* Scenario Presets */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Quick Scenarios</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTrafficDensity(30)
                setTimeOfDay("midday")
                setTimeMultiplier(1)
              }}
            >
              Normal Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTrafficDensity(80)
                setTimeOfDay("peak")
                setTimeMultiplier(2)
              }}
            >
              Rush Hour
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTrafficDensity(90)
                setTimeOfDay("peak")
                setTimeMultiplier(5)
              }}
            >
              Event Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTrafficDensity(95)
                setTimeOfDay("morning")
                setTimeMultiplier(10)
              }}
            >
              Emergency
            </Button>
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm mb-2 text-blue-800">Current Settings</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Speed:</span>
              <span className="font-medium">{timeMultiplier}x</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Density:</span>
              <span className="font-medium">{trafficDensity}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Time:</span>
              <div className="flex items-center space-x-1">
                {getTimeIcon(timeOfDay)}
                <span className="font-medium capitalize">{timeOfDay}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
