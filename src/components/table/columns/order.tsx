"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { OrderType } from "@/types/order";

export const columns: ColumnDef<OrderType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "id",
    accessorKey: "id",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Order ID</p>
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </div>
    ),
    cell: ({ row }) => (
      <Link
        className="truncate w-44 hover:underline"
        href={`/dashboard/orders/${row.original?.id}`}
      >
        <div className="truncate w-44">{row.original.id}</div>
      </Link>
    ),
  },
  {
    id: "customer",
    accessorKey: "customer.name",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Customer Name</p>
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </div>
    ),
    cell: ({ row }) => <div>{row.original?.customer?.name ?? "N/A"}</div>,
    enableHiding: false,
  },
  {
    id: "phone/email",
    accessorKey: "customer.phone",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Phone/Email</p>
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </div>
    ),
    cell: ({ row }) => (
      <div>
        {row.original.customer?.phone || row.original.customer?.email || "N/A"}
      </div>
    ),
  },
  {
    id: "pickupPoint",
    accessorKey: "pickupPoint",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Pickup Point</p>
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </div>
    ),
    cell: ({ row }) => <div>{row.original.pickUpPoint}</div>,
  },
  {
    id: "dropoffPoint",
    accessorKey: "dropoffPoint",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Dropoff Point</p>
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </div>
    ),
    cell: ({ row }) => <div>{row.original.dropOffPoint}</div>,
  },
  {
    id: "Delivery status",
    accessorKey: "deliveryStatus",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Delivery Status</p>
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </div>
    ),
    cell: ({ row }) => (
      <Badge
        className={`bg-white text-black rounded-full border hover:bg-transparent ${
          row.original.status === "COMPLETED"
            ? "border-green-500 text-green-500"
            : row.original.status === "PENDING"
            ? "border-gray-500 text-gray-500"
            : row.original.status === "CONFIRMED"
            ? "border-yellow-500 text-yellow-500"
            : row.original.status === "IN_PROGRESS"
            ? " border-blue-500 text-blue-500"
            : "border-red-500 text-red-500"
        }`}
      >
        {row.original.status === "COMPLETED"
          ? "Completed"
          : row.original.status === "PENDING"
          ? "Pending"
          : row.original.status === "CONFIRMED"
          ? "Confirmed"
          : row.original.status === "IN_PROGRESS"
          ? "In Progress"
          : "Canceled"}
      </Badge>
    ),
  },
  {
    id: "Driver",
    accessorKey: "driver.user.name",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Driver</p>
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </div>
    ),
    cell: ({ row }) => <div>{row.original.driver?.user?.name ?? "N/A"}</div>,
  },
  {
    id: "Created Date",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Created Date</p>
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </div>
    ),
    cell: ({ row }) => (
      <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(data.id)}
            >
              Copy Order Number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/orders/${data.id}`}>View Order</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
  },
];
