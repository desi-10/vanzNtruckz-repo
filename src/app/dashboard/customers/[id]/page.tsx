"use client";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetCustomer } from "@/service/customer";
import { Badge } from "@/components/ui/badge";
import { Calendar, ShieldCheck, UserCheck } from "lucide-react";
import { CustomerType } from "@/types/customer";

export default function CustomerPage() {
  const id = useParams().id;

  const { data: customerData } = useGetCustomer((id as string) || "");
  const customer: CustomerType = customerData?.data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-6 border-b pb-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={customer?.image?.url || ""} />
          <AvatarFallback>{customer?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{customer?.name}</h1>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Email: </span>
            <p className="text-gray-500">{customer?.email || "N/A"}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Phone: </span>
            <p className="text-gray-500">{customer?.phone || "N/A"}</p>
          </div>
        </div>
        <div className="ml-auto">
          <Button className="bg-primaryColor text-white hover:bg-primaryColor/90">
            <Link href={`/dashboard/customers/${customer?.id}/edit`}>
              Edit Customer
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Orders */}
        <div className="border rounded-xl p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Total Orders
            </span>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{customer?.orders?.length || 0}</p>
        </div>

        {/* Member Since */}
        <div className="border rounded-xl p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Member Since
            </span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold ">
            {/* {format(customer.createdAt, "MMMM dd, yyyy")} */}
            --
          </p>
        </div>

        {/* Account Status */}
        <div className="border rounded-xl p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Account Status
            </span>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <p
            className={`text-sm font-semibold px-2 py-1 inline-block rounded-full ${
              customer
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          ></p>
        </div>
      </div>
      <section>
        <div>
          <p className="text-xl font-bold">Order History</p>
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer?.orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order?.id}</TableCell>
                  <TableCell>
                    {format(order?.createdAt, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{order?.vehicle?.name}</TableCell>
                  <TableCell>
                    {order.driver?.user?.name || "Unassigned"}
                  </TableCell>
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
        </div>
      </section>
    </div>
  );
}
