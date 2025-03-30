"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { vechicleType } from "@/types/vehicle";

export const columns: ColumnDef<vechicleType>[] = [
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
    id: "vehicle_image",
    accessorKey: "image",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Vehicle Image</p>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="">
        {row.original?.image ? (
          <div className="h-10 w-10 overflow-hidden rounded-full flex justify-center items-center">
            <Image
              src={row.original?.image?.url ?? ""}
              alt="Car Picture"
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200  flex justify-center items-center overflow-hidden">
            <Image
              src="/images/truck.jpg"
              alt="Car Picture"
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
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
        <p>Vehicle Name</p>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => <div>{row.original?.name}</div>,
  },
  {
    id: "weight",
    accessorKey: "weight",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Weight</p>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => <div>{row.original?.weight}</div>,
  },
  {
    id: "isActive",
    accessorKey: "isActive",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <p>Status</p>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div>{row.original.isActive ? "Active" : "Inactive"}</div>
    ),
    enableHiding: false,
  },
];
