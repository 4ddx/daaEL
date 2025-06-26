"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Users, UserPlus, Search, Filter, Download, Mail, Phone, MapPin, TrendingUp, Star } from "lucide-react"

export default function CustomersPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-gray-600">Manage your customer database and track interactions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,923</div>
            <p className="text-xs text-muted-foreground">67.5% of total customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Customer Value</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,247</div>
            <p className="text-xs text-muted-foreground">+15.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search customers by name, email, or phone..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>Complete list of your customers and their information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "John Doe",
                email: "john.doe@example.com",
                phone: "+1 (555) 123-4567",
                location: "New York, NY",
                joinDate: "Jan 15, 2024",
                status: "Active",
                value: "$2,450",
                orders: 12,
              },
              {
                name: "Sarah Smith",
                email: "sarah.smith@example.com",
                phone: "+1 (555) 234-5678",
                location: "Los Angeles, CA",
                joinDate: "Feb 3, 2024",
                status: "Active",
                value: "$1,890",
                orders: 8,
              },
              {
                name: "Mike Johnson",
                email: "mike.johnson@example.com",
                phone: "+1 (555) 345-6789",
                location: "Chicago, IL",
                joinDate: "Dec 20, 2023",
                status: "Inactive",
                value: "$3,200",
                orders: 15,
              },
              {
                name: "Emily Brown",
                email: "emily.brown@example.com",
                phone: "+1 (555) 456-7890",
                location: "Houston, TX",
                joinDate: "Mar 8, 2024",
                status: "Active",
                value: "$980",
                orders: 4,
              },
              {
                name: "David Wilson",
                email: "david.wilson@example.com",
                phone: "+1 (555) 567-8901",
                location: "Phoenix, AZ",
                joinDate: "Jan 28, 2024",
                status: "Active",
                value: "$1,650",
                orders: 7,
              },
            ].map((customer, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{customer.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="font-semibold">{customer.value}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Orders</p>
                      <p className="font-semibold">{customer.orders}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="font-semibold text-xs">{customer.joinDate}</p>
                    </div>
                    <Badge variant={customer.status === "Active" ? "default" : "secondary"}>{customer.status}</Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
