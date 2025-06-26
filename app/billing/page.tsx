"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Progress } from "@/components/progress"
import { CreditCard, Calendar, Download, Plus, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react"

export default function BillingPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Billing & Payments</h1>
          <p className="text-gray-600">Manage your billing information and payment methods</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Plan</span>
            <Badge variant="default">Pro Plan</Badge>
          </CardTitle>
          <CardDescription>Your current subscription and usage details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Plan Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">Pro Plan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">$99/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next billing:</span>
                  <span className="font-medium">Apr 15, 2024</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Usage This Month</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>API Calls</span>
                    <span>7,500 / 10,000</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage</span>
                    <span>45 GB / 100 GB</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Users</span>
                    <span>8 / 15</span>
                  </div>
                  <Progress value={53} className="h-2" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Billing History
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your saved payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: "Visa",
                last4: "4242",
                expiry: "12/26",
                isDefault: true,
                status: "Active",
              },
              {
                type: "Mastercard",
                last4: "8888",
                expiry: "08/25",
                isDefault: false,
                status: "Active",
              },
            ].map((card, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {card.type} ending in {card.last4}
                    </p>
                    <p className="text-sm text-gray-600">Expires {card.expiry}</p>
                  </div>
                  {card.isDefault && <Badge variant="secondary">Default</Badge>}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={card.status === "Active" ? "default" : "secondary"}>{card.status}</Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                date: "Mar 15, 2024",
                description: "Pro Plan - Monthly",
                amount: "$99.00",
                status: "Paid",
                invoice: "INV-2024-003",
              },
              {
                date: "Feb 15, 2024",
                description: "Pro Plan - Monthly",
                amount: "$99.00",
                status: "Paid",
                invoice: "INV-2024-002",
              },
              {
                date: "Jan 15, 2024",
                description: "Pro Plan - Monthly",
                amount: "$99.00",
                status: "Paid",
                invoice: "INV-2024-001",
              },
              {
                date: "Dec 15, 2023",
                description: "Pro Plan - Monthly",
                amount: "$99.00",
                status: "Failed",
                invoice: "INV-2023-012",
              },
            ].map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {transaction.status === "Paid" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {transaction.date} • {transaction.invoice}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={transaction.status === "Paid" ? "default" : "destructive"}>
                    {transaction.status}
                  </Badge>
                  <p className="font-semibold">{transaction.amount}</p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
