import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any; 
  onEditPlan: (planId: string, updatedPlan: any) => void;
}

function EditPlanModal({ isOpen, onClose, plan, onEditPlan }: EditPlanModalProps) {
  const [name, setName] = useState(plan?.name || "");
  const [type, setType] = useState<"unlimited" | "limited">(plan?.type || "limited");
  const [messageLimit, setMessageLimit] = useState<string>(plan?.messageLimit?.toString() || "");
  const [deviceLimit, setDeviceLimit] = useState<string>(plan?.deviceLimit?.toString() || "");
  const [durationDays, setDurationDays] = useState<string>(plan?.durationDays?.toString() || "");
  const [price, setPrice] = useState<string>(plan?.price?.toString() || "");
  const [currency, setCurrency] = useState(plan?.currency || "INR");
  const [status, setStatus] = useState(plan?.status || "Active");

  useEffect(() => {
    if (plan) {
      setName(plan.name || "");
      setType(plan.type || "limited");
      setMessageLimit(plan.messageLimit?.toString() || "");
      setDeviceLimit(plan.deviceLimit?.toString() || "");
      setDurationDays(plan.durationDays?.toString() || "");
      setPrice(plan.price?.toString() || "");
      setCurrency(plan.currency || "INR");
      setStatus(plan.status || "Active");
    }
  }, [plan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPlan = {
      name,
      type,
      messageLimit: type === "limited" ? parseInt(messageLimit) : null,
      deviceLimit: parseInt(deviceLimit),
      durationDays: parseInt(durationDays),
      price: parseFloat(price),
      currency,
      status:status.toLowerCase(),
      _id: plan._id,
      createdAt: plan.createdAt,
      __v: plan.__v
    };
    onEditPlan(plan._id, updatedPlan);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Edit Plan
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Modify the details of your plan
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-medium">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                placeholder="Enter plan name"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right font-medium">
                Type
              </Label>
              <RadioGroup
                value={type}
                onValueChange={(value: "unlimited" | "limited") => setType(value)}
                className="col-span-3 flex space-x-6"
              >
                <div className="flex items-center space-x-2 hover:text-purple-500 transition-colors">
                  <RadioGroupItem value="limited" id="limited" />
                  <Label htmlFor="limited">Limited</Label>
                </div>
                <div className="flex items-center space-x-2 hover:text-purple-500 transition-colors">
                  <RadioGroupItem value="unlimited" id="unlimited" />
                  <Label htmlFor="unlimited">Unlimited</Label>
                </div>
              </RadioGroup>
            </div>

            {type === "limited" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-4 items-center gap-4"
              >
                <Label htmlFor="messageLimit" className="text-right font-medium">
                  Message Limit
                </Label>
                <Input
                  id="messageLimit"
                  type="number"
                  value={messageLimit}
                  onChange={(e) => setMessageLimit(e.target.value)}
                  className="col-span-3 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter message limit"
                  required
                />
              </motion.div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deviceLimit" className="text-right font-medium">
                Device Limit
              </Label>
              <Input
                id="deviceLimit"
                type="number"
                value={deviceLimit}
                onChange={(e) => setDeviceLimit(e.target.value)}
                className="col-span-3 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                placeholder="Enter device limit"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="durationDays" className="text-right font-medium">
                Duration (Days)
              </Label>
              <Input
                id="durationDays"
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="col-span-3 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                placeholder="Enter duration in days"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right font-medium">
                Price
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter price"
                  required
                />
                <Input
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-24 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  placeholder="Currency"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right font-medium">
                Status
              </Label>
              <RadioGroup
                value={status}
                onValueChange={(value: string) => setStatus(value)}
                className="col-span-3 flex space-x-6"
              >
                <div className="flex items-center space-x-2 hover:text-purple-500 transition-colors">
                  <RadioGroupItem value="Active" id="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2 hover:text-purple-500 transition-colors">
                  <RadioGroupItem value="Inactive" id="inactive" />
                  <Label htmlFor="inactive">Inactive</Label>
                </div>
              </RadioGroup>
            </div>
          </motion.div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 py-2 rounded-lg transform transition-all duration-200 hover:scale-105"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditPlanModal;