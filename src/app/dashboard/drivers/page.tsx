"use client";
import AddDriverAction from "@/components/drivers/add-driver";
import PageHeader from "@/components/page-header";
import ServerError from "@/components/server-error";
import TableLoader from "@/components/table-loader";
import { columns } from "@/components/table/columns/drivers";
import { DataTable } from "@/components/table/data-table";
import { useGetDrivers } from "@/service/driver";
import React from "react";

const DriversPage = () => {
  const { data, isLoading, isError } = useGetDrivers();

  if (isError) {
    return <ServerError />;
  }

  return (
    <div>
      <div className="flex items-center justify-between w-full border-b pb-4 mb-6">
        <PageHeader title="Drivers" subtitle="Manage and track drivers." />
        <AddDriverAction />
      </div>
      {isLoading ? (
        <TableLoader />
      ) : (
        <div className="w-full">
          <DataTable data={data} columns={columns} />
        </div>
      )}
    </div>
  );
};

export default DriversPage;
