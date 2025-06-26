"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Progress } from "@/components/progress"
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Download,
} from "lucide-react"

export default function SalesPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-gray-600">Manage your sales transactions and track revenue</p>
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
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +15.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$36.67</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
              -2.4% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.24%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +0.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Target</CardTitle>
            <CardDescription>Progress towards this month's goal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current: $45,231</span>
                <span className="text-sm text-gray-600">Target: $60,000</span>
              </div>
              <Progress value={75.4} className="h-3" />
              <p className="text-xs text-gray-600">75.4% of monthly target achieved</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Premium Plan", sales: 234, revenue: "$11,700" },
              { name: "Basic Plan", sales: 189, revenue: "$9,450" },
              { name: "Enterprise Plan", sales: 67, revenue: "$13,400" },
              { name: "Add-on Services", sales: 156, revenue: "$7,800" },
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-gray-600">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{product.revenue}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Latest transactions and orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "#12345",
                customer: "John Doe",
                product: "Premium Plan",
                amount: "$99.00",
                status: "Completed",
                date: "2 hours ago",
              },
              {
                id: "#12344",
                customer: "Sarah Smith",
                product: "Basic Plan",
                amount: "$49.00",
                status: "Completed",
                date: "4 hours ago",
              },
              {
                id: "#12343",
                customer: "Mike Johnson",
                product: "Enterprise Plan",
                amount: "$199.00",
                status: "Processing",
                date: "6 hours ago",
              },
              {
                id: "#12342",
                customer: "Emily Brown",
                product: "Add-on Services",
                amount: "$29.00",
                status: "Completed",
                date: "8 hours ago",
              },
              {
                id: "#12341",
                customer: "David Wilson",
                product: "Premium Plan",
                amount: "$99.00",
                status: "Refunded",
                date: "1 day ago",
              },
            ].map((sale, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium">{sale.id}</p>
                    <p className="text-xs text-gray-600">{sale.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm">{sale.product}</p>
                    <p className="text-xs text-gray-600">{sale.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant={
                      sale.status === "Completed"
                        ? "default"
                        : sale.status === "Processing"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {sale.status}
                  </Badge>
                  <p className="text-sm font-bold">{sale.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
