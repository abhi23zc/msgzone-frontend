"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Check,
  X,
  Filter,
  Download,
  Calendar,
  User,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  MessageCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/services/api";
import toast from "react-hot-toast";

const PaymentApprovalPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<any|null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState<any|null>(null)

  // Mock payment data
  const cards = [
    {
      title: "Total Payment",
      value: stats?.total || 0,
      change: `${0}% this month`,
      trend: Number(10) >= 0 ? "up" : "down",
      icon: MessageCircle,
      style: {
        bg: "from-blue-50/80 to-indigo-50/80",
        icon: "from-blue-600 to-indigo-700",
        text: "text-blue-700",
        change: "text-blue-600",
      },
    },
    {
      title: "Approved Payments",
      value: stats?.approved || 0,
      change: `${0}% this month`,
      trend: Number(10) >= 0 ? "up" : "down",
      icon: CheckCircle2,
      style: {
        bg: "from-emerald-50/80 to-teal-50/80",
        icon: "from-emerald-600 to-teal-700",
        text: "text-emerald-700",
        change: "text-emerald-600",
      },
    },
    {
      title: "Pending Payments",
      value: stats?.pending || 0,
      change: `${0}% this month`,
      trend: Number(10) >= 0 ? "up" : "down",
      icon: XCircle,
      style: {
        bg: "from-red-50/80 to-rose-50/80",
        icon: "from-red-600 to-rose-700",
        text: "text-red-700",
        change: "text-red-600",
      },
    },
    {
      title: "Rejected Payments",
      value: stats?.rejected || 0,
      change: `${0}% this month`,
      trend: Number(10) >= 0 ? "up" : "down",
      icon: XCircle,
      style: {
        bg: "from-red-50/80 to-rose-50/80",
        icon: "from-red-600 to-rose-700",
        text: "text-red-700",
        change: "text-red-600",
      },
    },
  ];

  const handleApprove = (paymentId: string) => {
    // setPayments(
    //   payments.map((payment: any) =>
    //     payment.id === paymentId ? { ...payment, status: "approved" } : payment
    //   ) as any
    // );
    approvePayment(paymentId);
    setIsDialogOpen(false);
  };

  const handleReject = (paymentId: string) => {
    rejectPayment(paymentId);
    setIsDialogOpen(false);
  };
const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: {
      variant: "secondary",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    approved: {
      variant: "secondary", 
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    rejected: {
      variant: "secondary",
      className: "bg-red-100 text-red-800 hover:bg-red-100", 
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <Badge variant="secondary" className={config.className}>
      {status === "pending" && <Clock className="w-3 h-3 mr-1" />}
      {status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
      {status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

  const openPaymentDetails = (payment: any) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const filteredPayments = payments.filter((payment: any) => {
    const matchesSearch =
      payment?.userName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      payment?.userEmail?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      payment?.transactionId
        ?.toLowerCase()
        ?.includes(searchTerm?.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payment/admin");
      if (res?.data?.success) {
        console.log(res?.data);
        const formattedPayments = res?.data?.data?.payments?.map(
          (payment: any) => ({
            id: payment?.id,
            userId: payment?.user?._id,
            userName: payment?.user?.name,
            userEmail: payment?.user?.email,
            planName: payment?.plan?.name,
            amount: payment?.plan?.price,
            currency: "INR",
            paymentMethod: payment?.paymentMode,
            razorpay_order_id:
              payment?.paymentMode === "razorpay"
                ? payment?.razorpay_order_id
                : null,
            razorpay_payment_id:
              payment?.paymentMode === "razorpay"
                ? payment?.razorpay_payment_id
                : null,
            razorpay_signature:
              payment?.paymentMode === "razorpay"
                ? payment?.razorpay_signature
                : null,
            utrNumber:
              payment?.paymentMode === "manual" ? payment?.utrNumber : null,
            transactionId:
              payment?.paymentMode === "manual"
                ? payment?.utrNumber
                : payment?.razorpay_payment_id || "",
            paymentDate: new Date(payment?.date)?.toISOString()?.split("T")[0],
            status: payment?.status,
            screenshot:
              payment?.paymentMode === "manual" ? payment?.screenshotUrl : null,
            planDuration: `${payment?.plan?.durationDays} days`,
            deviceLimit: payment?.plan?.deviceLimit || "2 devices", // Default values since not in API
            messageLimit: payment?.plan?.messageLimit || "Unlimited", // Default values since not in API
          })
        );
        console.log(formattedPayments);
        setStats(res?.data?.data?.stats)
        setPayments(formattedPayments);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error while fetching payments");
    }
  };

  const approvePayment = async(paymentId: string) =>{
    try{
      const res = await api.put(`/payment/admin/approve-payment/${paymentId}`);
      if(res?.data?.success){
        toast.success("Payment approved");
        fetchPayments();
      }
    }catch(e){
      console.error(e);
      toast.error("Error while approving payment");
    }
  }

  const rejectPayment = async(paymentId: string) =>{
    try{
      const res = await api.put(`/payment/admin/reject-payment/${paymentId}`);
      if(res?.data?.success){
        toast.success("Payment rejected");
        fetchPayments();
      }
    }catch(e){
      console.error(e);
      toast.error("Error while rejecting payment");
    }
  }
  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full ">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Payment Approvals
          </h1>
          <p className="text-muted-foreground">
            Manage and approve user payment requests for your WhatsApp bulk
            sender service
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.style.bg} rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${card.style.icon} rounded-xl shadow-sm`}
                >
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  {card.trend === "up" ? (
                    <TrendingUp className={`w-4 h-4 ${card.style.change}`} />
                  ) : (
                    <TrendingDown className={`w-4 h-4 ${card.style.change}`} />
                  )}
                  <span
                    className={`text-sm font-semibold ${card.style.change}`}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                  {card.title}
                </h3>
                <p className={`text-3xl font-bold ${card.style.text}`}>
                  {card.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Requests</CardTitle>
            <CardDescription>
              Review and manage user payment requests for plan subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments?.map((payment:any) => (
                  <TableRow key={payment?.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${payment?.userEmail}`}
                          />
                          <AvatarFallback>
                            {payment?.userName
                              ?.split(" ")
                              ?.map((n:any) => n?.[0])
                              ?.join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{payment?.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment?.userEmail}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {payment?.userId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment?.planName}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment?.planDuration}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment?.messageLimit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">₹{payment?.amount}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment?.paymentMethod}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment?.transactionId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment?.paymentDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment?.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openPaymentDetails(payment)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {payment?.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(payment?.id)}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleReject(payment?.id)}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Review complete payment information and take action
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          User Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${selectedPayment.userEmail}`}
                            />
                            <AvatarFallback>
                              {selectedPayment.userName
                                .split(" ")
                                .map((n:any) => n?.[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {selectedPayment.userName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedPayment.userEmail}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              User ID: {selectedPayment.userId}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Plan Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Plan
                            </p>
                            <p className="text-sm">
                              {selectedPayment.planName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Duration
                            </p>
                            <p className="text-sm">
                              {selectedPayment.planDuration}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Devices
                            </p>
                            <p className="text-sm">
                              {selectedPayment.deviceLimit}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Messages
                            </p>
                            <p className="text-sm">
                              {selectedPayment.messageLimit}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Payment Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Amount
                            </p>
                            <p className="text-sm font-semibold">
                              ₹{selectedPayment.amount}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Method
                            </p>
                            <p className="text-sm">
                              {selectedPayment.paymentMethod}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Transaction ID
                            </p>
                            <p className="text-sm font-mono">
                              {selectedPayment.transactionId}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Date
                            </p>
                            <p className="text-sm">
                              {selectedPayment.paymentDate}
                            </p>
                          </div>
                        </div>
                        <div className="pt-2">
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Status
                          </p>
                          {getStatusBadge(selectedPayment.status)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Payment Screenshot
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedPayment?.screenshot ? (
                          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                            <img 
                              src={selectedPayment.screenshot}
                              alt="Payment Screenshot"
                              className="w-full h-auto object-contain max-h-[400px]"
                              onClick={() => window.open(selectedPayment.screenshot, '_blank')}
                              style={{cursor: 'pointer'}}
                            />
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-900">
                                No Screenshot Available
                              </p>
                              <p className="text-sm text-gray-500">
                                Payment screenshot has not been uploaded
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {selectedPayment.status === "pending" && (
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(selectedPayment.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject Payment
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedPayment.id)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve Payment
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PaymentApprovalPage;
