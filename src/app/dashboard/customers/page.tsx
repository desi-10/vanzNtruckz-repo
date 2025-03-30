"use client";
import AddCustomerAction from "@/components/customers/add-customer";
import PageHeader from "@/components/page-header";
import ServerError from "@/components/server-error";
import TableLoader from "@/components/table-loader";
import { columns } from "@/components/table/columns/customers";
import { DataTable } from "@/components/table/data-table";
import { useGetCustomers } from "@/service/customer";
import React from "react";

const CustomersPage = () => {
  const { data, isLoading, isError } = useGetCustomers();

  if (isError) {
    return <ServerError />;
  }

  return (
    <div>
      <div className="flex items-center justify-between w-full border-b pb-4 mb-6">
        <PageHeader title="Customers" subtitle="Manage and track customers." />
        <AddCustomerAction />
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

export default CustomersPage;
