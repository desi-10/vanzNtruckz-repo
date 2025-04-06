"use client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetCustomer } from "@/service/customer";
import { Order, OrderItem, User, Vehicle } from "@prisma/client";

type OrderItemType = Order & {
  driver: User & {
    user: User & {
      name: string;
      phone: string;
    };
  };
  vehicle: Vehicle & {
    name: string;
  };
  items: OrderItem[];
};

type CustomerType = User & {
  image: { id: string; url: string } | null;
  orders: OrderItemType[];
};

export default function CustomerPage() {
  const id = useParams().id;

  const { data: customerData } = useGetCustomer((id as string) || "");
  const customer: CustomerType = customerData?.data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          {/* <AvatarImage src={customer.image || ""} /> */}
          <AvatarFallback>{customer?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{customer?.name}</h1>
          <p className="text-gray-500">{customer?.email || "N/A"}</p>
          <p className="text-gray-500">{customer?.phone || "N/A"}</p>
        </div>
        <div className="ml-auto">
          <Button asChild className="bg-primaryColor text-white">
            <Link href={`/dashboard/customers/${customer?.id}/edit`}>
              Edit Customer
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {customer?.orders?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Since</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {/* {format(customer.createdAt, "MMMM dd, yyyy")} */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <Badge variant={customer.isActive ? "success" : "destructive"}>
              {customer.isActive ? "Active" : "Inactive"}
            </Badge> */}
          </CardContent>
        </Card>
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
                    {order.driver?.user?.name || "Not Assigned"}
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
