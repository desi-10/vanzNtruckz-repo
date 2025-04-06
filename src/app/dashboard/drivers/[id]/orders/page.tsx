"use client";

import { useParams } from "next/navigation";
import { useGetDriver } from "@/service/driver";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft } from "lucide-react";
import { UserDriverType } from "@/types/driver";

export default function DriverOrdersPage() {
  const id = useParams().id;
  const {
    data: driverData,
    isLoading,
    isError,
  } = useGetDriver((id as string) || "");
  const driver: UserDriverType = driverData?.data;

  if (isError) return <ServerError />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href={`/dashboard/drivers/${id}`}>
                <ArrowLeft className="h-4 w-4" />
                Back to Driver
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold mt-2">Driver Orders</h1>
          <p className="text-sm text-gray-600">
            View all orders assigned to {driver?.name}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <div className="pb-2">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                driver?.orders?.length || 0
              )}
            </div>
          </div>
        </div>

        <section>
          <div className="pb-2">
            <p className="text-sm font-medium text-gray-500">
              Completed Orders
            </p>
          </div>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                driver?.orders?.filter((order) => order.status === "COMPLETED")
                  .length || 0
              )}
            </div>
          </CardContent>
        </section>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                driver?.orders?.filter(
                  (order) => order.status === "IN_PROGRESS"
                ).length || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Cancelled Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                driver?.orders?.filter((order) => order.status === "CANCELED")
                  .length || 0
              )}
            </div>
          </CardContent>
        </Card>
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
                    <TableCell>{order.customer?.name}</TableCell>
                    <TableCell>{order.pickUpPoint}</TableCell>
                    <TableCell>{order.dropOffPoint}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>₵{order.amount || 0}</TableCell>
                    <TableCell>
                      <Badge>{order.status}</Badge>
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
