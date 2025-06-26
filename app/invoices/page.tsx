"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { FileText, Plus, Search, Filter, Download, Eye, Edit, Send, DollarSign, Calendar, Clock } from "lucide-react"

export default function InvoicesPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-gray-600">Create and manage your invoices</p>
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
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$23,456</div>
            <p className="text-xs text-muted-foreground">Across 45 invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$67,890</div>
            <p className="text-xs text-muted-foreground">+15.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">$8,450 total amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search invoices by number, customer, or amount..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Manage and track all your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                number: "INV-001",
                customer: "Acme Corporation",
                amount: "$2,450.00",
                status: "Paid",
                dueDate: "Mar 15, 2024",
                issueDate: "Feb 15, 2024",
              },
              {
                number: "INV-002",
                customer: "Tech Solutions Inc.",
                amount: "$1,890.00",
                status: "Pending",
                dueDate: "Mar 20, 2024",
                issueDate: "Feb 20, 2024",
              },
              {
                number: "INV-003",
                customer: "Global Enterprises",
                amount: "$3,200.00",
                status: "Overdue",
                dueDate: "Mar 10, 2024",
                issueDate: "Feb 10, 2024",
              },
              {
                number: "INV-004",
                customer: "StartUp Co.",
                amount: "$980.00",
                status: "Draft",
                dueDate: "Mar 25, 2024",
                issueDate: "Feb 25, 2024",
              },
              {
                number: "INV-005",
                customer: "Enterprise Ltd.",
                amount: "$1,650.00",
                status: "Sent",
                dueDate: "Mar 18, 2024",
                issueDate: "Feb 18, 2024",
              },
            ].map((invoice, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{invoice.number}</h3>
                      <p className="text-gray-600">{invoice.customer}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Issued: {invoice.issueDate}</span>
                        <span>Due: {invoice.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">{invoice.amount}</p>
                      <Badge
                        variant={
                          invoice.status === "Paid"
                            ? "default"
                            : invoice.status === "Overdue"
                              ? "destructive"
                              : invoice.status === "Draft"
                                ? "outline"
                                : "secondary"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {invoice.status === "Draft" && (
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      )}
                    </div>
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
