"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
import CreatePlanModal from "@/components/admin/CreatePlanModal";
import EditPlanModal from "@/components/admin/EditPlanModal";

import { useAdminContext } from "@/context/Admin/AdminContext";

interface Plan {
  currency: string;
  _id: string;
  name: string;
  type: string; // "limited" or other types
  messageLimit: number;
  deviceLimit: number;
  durationDays: number;
  price: number;
  createdAt: string;
  __v: number;
  status?: "Active" | "Inactive"; // Assuming status might still be needed for filtering/display
}

type FilterStatus = "all" | "active" | "inactive";

function PlanManagementPage() {
  const { createNewPlan, getAllPlans, plans: allPlans, editPlan, deletePlan } = useAdminContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const cards = [
    {
      title: "Total Plans",
      value: allPlans?.plans?.length?.toString() || "0",
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
      value: allPlans?.plans?.filter((plan: any) => plan.status?.toLowerCase() === "active").length?.toString() || "0",
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

  const [plans, setPlans] = useState<Plan[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    // Assuming a 'status' field might be added or derived for filtering
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && plan.status?.toLowerCase() === "active") ||
      (statusFilter === "inactive" && plan.status?.toLowerCase() === "inactive");

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    
    if (allPlans?.plans?.length > 0) {
      setPlans(allPlans?.plans?.map((plan: any) => ({
        currency: plan.currency,
        _id: plan._id,
        name: plan.name,
        type: plan.type,
        messageLimit: plan.messageLimit,
        deviceLimit: plan.deviceLimit,
        durationDays: plan.durationDays,
        createdAt: plan.createdAt,
        __v: plan.__v,
        price: plan.price,
        status: plan.status || "Active", // Assuming a default status if not provided
      })));
    }
  }, [allPlans]);

  useEffect(() => {
    getAllPlans();
  }, []);

  return (
    <div className="w-full space-y-6 min-h-[85vh] bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Plan Management
        </h1>
        <Button
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Plan
        </Button>
        <CreatePlanModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreatePlan={async (newPlan) => {
            await createNewPlan(newPlan);
            console.log("New Plan Created:", newPlan);
          }}
        />

        {selectedPlan && (
          <EditPlanModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            plan={selectedPlan}
            onEditPlan={async (planId, updatedPlan) => {
              await editPlan(planId, updatedPlan);
              setIsEditModalOpen(false);
              setSelectedPlan(null);
            }}
          />
        )}
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
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Limits</TableHead>
              <TableHead>Devices</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Created At</TableHead>
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
                <motion.tr
                  key={plan._id}
                  className="hover:bg-gray-50/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: filteredPlans.indexOf(plan) * 0.05 }}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-purple-600">
                        {plan?.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{plan?.type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-blue-600">
                      {plan?.currency} {plan?.price}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {plan?.messageLimit?.toLocaleString() ? plan?.messageLimit?.toLocaleString() + " messages" : "Unlimited messages"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {plan?.deviceLimit} devices
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {plan?.durationDays} days
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(plan?.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 capitalize rounded-full text-xs font-medium ${
                        plan?.status?.toLowerCase() === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {plan?.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePlan(plan._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default PlanManagementPage;
