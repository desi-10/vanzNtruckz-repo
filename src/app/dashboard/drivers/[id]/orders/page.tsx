"use client";

import { useParams } from "next/navigation";
import { useGetDriver } from "@/service/driver";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import ServerError from "@/components/server-error";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Timer, Users, XCircle } from "lucide-react";
import { DriverType } from "@/types/driver";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DriverOrdersPage() {
  const id = useParams().id;
  const {
    data: driverData,
    isLoading,
    isError,
  } = useGetDriver((id as string) || "");
  const driver: DriverType = driverData?.data;

  if (isError) return <ServerError />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-6 border-b pb-4">
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={driver?.profilePicture?.url || ""}
            className="w-full h-full object-cover"
          />
          <AvatarFallback>{driver?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{driver?.user?.name}</h1>
          <div className="flex items-center gap-2 text-xs">
            <span className=" text-gray-500">Email: </span>
            <p className="text-gray-500">{driver?.user?.email || "N/A"}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className=" text-gray-500">Phone: </span>
            <p className="text-gray-500">{driver?.user?.phone || "N/A"}</p>
          </div>
        </div>
        <div className="ml-auto">
          <Button className="bg-primaryColor text-white hover:bg-primaryColor/90">
            <Link href={`/dashboard/drivers/${id}`}>Edit Driver</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Total Orders */}
        <div className="border rounded-xl p-3 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">
              Total Orders
            </span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-xl font-semibold">
            {isLoading ? (
              <Skeleton className="h-6 w-14" />
            ) : (
              driver?.orders?.length || 0
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">All time orders</p>
        </div>

        {/* Completed Orders */}
        <div className="border rounded-xl p-3 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">
              Completed Orders
            </span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-xl font-semibold text-green-600">
            {isLoading ? (
              <Skeleton className="h-6 w-14" />
            ) : (
              driver?.orders?.filter((o) => o.status === "COMPLETED").length ||
              0
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Successfully delivered
          </p>
        </div>

        {/* Active Orders */}
        <div className="border rounded-xl p-3 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">
              Active Orders
            </span>
            <Timer className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-semibold text-blue-600">
            {isLoading ? (
              <Skeleton className="h-6 w-14" />
            ) : (
              driver?.orders?.filter((o) => o.status === "IN_PROGRESS")
                .length || 0
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Currently in progress
          </p>
        </div>

        {/* Cancelled Orders */}
        <div className="border rounded-xl p-3 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">
              Cancelled Orders
            </span>
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-xl font-semibold text-red-600">
            {isLoading ? (
              <Skeleton className="h-6 w-14" />
            ) : (
              driver?.orders?.filter((o) => o.status === "CANCELED").length || 0
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">Orders cancelled</p>
        </div>
      </section>
      {/* Orders Table */}
      <section>
        <div>
          <p className="text-xl font-bold">Order History</p>
        </div>
        <div>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : driver.orders?.length === 0 ? (
            <p className="text-sm text-gray-500">No orders found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Pick Up</TableHead>
                  <TableHead>Drop Off</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driver?.orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer?.name || "N/A"}</TableCell>
                    <TableCell>{order.pickUpPoint}</TableCell>
                    <TableCell>{order.dropOffPoint}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>₵{order.amount || 0}</TableCell>
                    <TableCell>
                      <Badge
                        className={`bg-white text-black rounded-full border hover:bg-transparent ${
                          order.status === "COMPLETED"
                            ? "border-green-500 text-green-500"
                            : order.status === "PENDING"
                            ? "border-gray-500 text-gray-500"
                            : order.status === "CONFIRMED"
                            ? "border-yellow-500 text-yellow-500"
                            : order.status === "IN_PROGRESS"
                            ? " border-blue-500 text-blue-500"
                            : "border-red-500 text-red-500"
                        }`}
                      >
                        {order.status === "COMPLETED"
                          ? "Completed"
                          : order.status === "PENDING"
                          ? "Pending"
                          : order.status === "CONFIRMED"
                          ? "Confirmed"
                          : order.status === "IN_PROGRESS"
                          ? "In Progress"
                          : "Canceled"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
