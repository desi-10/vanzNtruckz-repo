"use client";
import AddDriverAction from "@/components/drivers/add-driver";
import PageHeader from "@/components/page-header";
import ServerError from "@/components/server-error";
import TableLoader from "@/components/table-loader";
import { columns } from "@/components/table/columns/drivers";
import { DataTable } from "@/components/table/data-table";
import { DataTablePagination } from "@/components/table/pagination";
import { useGetDrivers } from "@/service/driver";
import React, { useState } from "react";

const DriversPage = () => {
  const [initialPage, setInitialPage] = useState(1);
  const { data, isLoading, isError } = useGetDrivers(initialPage);

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
          <DataTablePagination
            table={data?.data}
            pagination={data?.pagination}
            onPageChange={setInitialPage}
          />
        </div>
      )}
    </div>
  );
};

export default DriversPage;
