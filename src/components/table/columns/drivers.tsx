"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Truck } from "lucide-react";
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
import { PersonIcon } from "@radix-ui/react-icons";
import { DriverType } from "@/types/driver";
import { DeleteDialog } from "@/components/drivers/delete-driver";
// import DriverKycDetails from "@/components/driver-dialog";

export const columns: ColumnDef<DriverType>[] = [
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
    id: "car_picture",
    accessorKey: "carPicture",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Car Picture
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="">
        <div className="flex justify-center items-center w-full">
          {row.original?.driverProfile?.carPicture ? (
            <div className="h-10 w-10 overflow-hidden rounded-full flex justify-center items-center">
              <Image
                src={row.original?.driverProfile?.carPicture?.url ?? ""}
                alt="Car Picture"
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200  flex justify-center items-center">
              <Truck className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    id: "profile_picture",
    accessorKey: "profile_picture",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Profile Picture
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="">
        <div className="flex justify-center items-center w-full">
          {row.original?.image ? (
            <div className="h-10 w-10 overflow-hidden rounded-full flex justify-center items-center">
              <Image
                src={
                  row.original?.image?.url ?? "/images/default-user-profile.png"
                }
                alt="Profile Picture"
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200  flex justify-center items-center">
              <PersonIcon className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    id: "driver_id",
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Driver ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        className="truncate w-44 hover:underline"
        href={`/dashboard/orders/${row.original.id}`}
      >
        <div className="truncate w-44 ">{row.original.id}</div>
      </Link>
    ),
  },
  {
    id: "driver",
    accessorKey: "user.name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Driver
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original?.name ?? "N/A"}</div>,
    enableHiding: false,
  },
  {
    id: "phone_email",
    accessorKey: "user.phone",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Phone/Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>{row.original?.phone || row.original?.email || "N/A"}</div>
    ),
  },
  {
    id: "kyc_status",
    accessorKey: "kycStatus",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        KYC Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge
        className={`bg-white text-black rounded-full border hover:bg-transparent ${
          row.original?.driverProfile?.kycStatus === "APPROVED"
            ? "border-green-500"
            : row.original?.driverProfile?.kycStatus === "PENDING"
            ? "border-gray-500 text-gray-500"
            : "border-red-500 text-red-500"
        }`}
      >
        {row.original?.driverProfile?.kycStatus === "APPROVED"
          ? "Approved"
          : row.original?.driverProfile?.kycStatus === "PENDING"
          ? "Pending"
          : "Rejected"}
      </Badge>
    ),
  },
  {
    id: "license",
    accessorKey: "license",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        License
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>{row.original?.driverProfile?.license ?? "N/A"}</div>
    ),
  },
  {
    id: "number_plate",
    accessorKey: "numberPlate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Number Plate
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>{row.original?.driverProfile?.numberPlate ?? "N/A"}</div>
    ),
  },
  {
    id: "Address",
    accessorKey: "address",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Address
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.address}</div>,
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
              Copy Driver ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/drivers/${data.id}`}>View Driver</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
