"use client";
import PageHeader from "@/components/page-header";
import TableLoader from "@/components/table-loader";
import { columns } from "@/components/table/columns/order";
import { DataTable } from "@/components/table/data-table";
import { useGetOrders } from "@/service/orders";

const OrdersPage = () => {
  const { data, isLoading } = useGetOrders();
  return (
    <div>
      <div className="flex items-center justify-between w-full border-b pb-4 mb-6">
        <PageHeader
          title="Delivery Orders"
          subtitle="Manage and track orders."
        />
        {/* <AddVehicleAction /> */}
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

export default OrdersPage;
