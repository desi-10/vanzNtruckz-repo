"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, User as UserIcon } from "lucide-react";
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
import Image from "next/image";
import { DeleteDialog } from "@/components/customers/delete-customer";
import { CustomerType } from "@/types/customer";

export const columns: ColumnDef<CustomerType>[] = [
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
    id: "profile_picture",
    accessorKey: "image",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Profile Picture</p>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="">
        <div className="h-10 w-10">
          {row.original.image ? (
            <Image
              src={row.original.image.url ?? "/images/default-user-profile.png"}
              alt="Profile Picture"
              width={100}
              height={100}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex justify-center items-center">
              <UserIcon className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    id: "customer_id",
    accessorKey: "id",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Customer ID</p>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => (
      <Link
        className="truncate w-44 hover:underline"
        href={`/dashboard/customers/${row.original.id}`}
      >
        <div className="truncate w-44">{row.original.id}</div>
      </Link>
    ),
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Name</p>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => <div>{row.original?.name ?? "N/A"}</div>,
    enableHiding: false,
  },
  {
    id: "phone_email",
    accessorKey: "phone",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Phone/Email</p>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div>{row.original?.phone || row.original?.email || "N/A"}</div>
    ),
  },
  {
    id: "address",
    accessorKey: "address",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Address</p>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => <div>{row.original.address ?? "N/A"}</div>,
  },
  {
    id: "verified",
    accessorKey: "emailVerified",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Verified</p>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => (
      <Badge
        className={`bg-white text-black rounded-full border hover:bg-transparent ${
          row.original.emailVerified || row.original.phoneVerified
            ? "border-green-500 text-green-500"
            : "border-gray-500 text-gray-500"
        }`}
      >
        {row.original.emailVerified || row.original.phoneVerified
          ? "Verified"
          : "Not Verified"}
      </Badge>
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
              Copy Customer ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/customers/${data.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <DeleteDialog data={data} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
  },
];
