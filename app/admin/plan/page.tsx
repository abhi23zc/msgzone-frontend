"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CreditCard,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Package,
  CheckCircle2,
} from "lucide-react";

interface Plan {
  id: number;
  name: string;
  type: "Monthly" | "Yearly";
  duration: number;
  messageLimit: number;
  price: number;
  features: string[];
  status: "Active" | "Inactive";
}

type FilterStatus = "all" | "active" | "inactive";

function PlanManagementPage() {
  const cards = [
    {
      title: "Total Plans",
      value: "5",
      change: "+2 this month",
      trend: "up",
      icon: Package,
      style: {
        bg: "from-violet-50/80 to-purple-50/80",
        icon: "from-violet-600 to-purple-700",
        text: "text-violet-700",
        change: "text-violet-600",
      },
    },
    {
      title: "Active Plans",
      value: "4",
      change: "+1 this month",
      trend: "up",
      icon: CheckCircle2,
      style: {
        bg: "from-emerald-50/80 to-teal-50/80",
        icon: "from-emerald-600 to-teal-700",
        text: "text-emerald-700",
        change: "text-emerald-600",
      },
    },
    {
      title: "Total Revenue",
      value: "$12,500",
      change: "+22.4% this month",
      trend: "up",
      icon: CreditCard,
      style: {
        bg: "from-blue-50/80 to-indigo-50/80",
        icon: "from-blue-600 to-indigo-700",
        text: "text-blue-700",
        change: "text-blue-600",
      },
    },
  ];

  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 1,
      name: "Basic",
      type: "Monthly",
      duration: 1,
      messageLimit: 1000,
      price: 29,
      features: ["1,000 Messages/month", "Basic Support", "1 Team Member", "API Access"],
      status: "Active",
    },
    {
      id: 2,
      name: "Professional",
      type: "Monthly",
      duration: 1,
      messageLimit: 5000,
      price: 99,
      features: ["5,000 Messages/month", "Priority Support", "5 Team Members", "API Access", "Analytics"],
      status: "Active",
    },
    {
      id: 3,
      name: "Enterprise",
      type: "Yearly",
      duration: 12,
      messageLimit: 50000,
      price: 999,
      features: ["50,000 Messages/month", "24/7 Support", "Unlimited Team Members", "Advanced API", "Custom Analytics"],
      status: "Active",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && plan.status === "Active") ||
      (statusFilter === "inactive" && plan.status === "Inactive");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full space-y-6 min-h-[85vh] bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Plan Management
        </h1>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
          Create New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.style.bg} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${card.style.icon} rounded-lg shadow-md`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1">
                {card.trend === "up" ? (
                  <TrendingUp className={`w-4 h-4 ${card.style.change}`} />
                ) : (
                  <TrendingDown className={`w-4 h-4 ${card.style.change}`} />
                )}
                <span className={`text-sm font-semibold ${card.style.change}`}>
                  {card.change}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                {card.title}
              </h3>
              <p className={`text-3xl font-bold ${card.style.text}`}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Input
          placeholder="Search plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            All Plans
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "inactive" ? "default" : "outline"}
            onClick={() => setStatusFilter("inactive")}
          >
            Inactive
          </Button>
        </div>
      </div>

      <Card className="p-6 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Details</TableHead>
              <TableHead>Type & Duration</TableHead>
              <TableHead>Limits</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No plans found
                </TableCell>
              </TableRow>
            ) : (
              filteredPlans.map((plan) => (
                <TableRow key={plan.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-purple-600">{plan.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{plan.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {plan.duration} {plan.duration === 1 ? "Month" : "Months"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {plan.messageLimit.toLocaleString()} messages/month
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-blue-600">
                      ${plan.price}/mo
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {plan.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="text-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                      {plan.features.length > 2 && (
                        <div className="text-sm text-blue-600">
                          +{plan.features.length - 2} more
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {plan.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default PlanManagementPage;
