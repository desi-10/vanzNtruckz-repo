"use client";
import PageHeader from "@/components/page-header";
import TableLoader from "@/components/table-loader";
import { columns } from "@/components/table/columns/vehicle";
import { DataTable } from "@/components/table/data-table";
import AddVehicleAction from "@/components/vehicles/add-vehicle";
import { useGetVehicles } from "@/service/vehicle";

const VehiclesPage = () => {
  const { data, isLoading } = useGetVehicles();
  return (
    <div>
      <div className="flex items-center justify-between w-full border-b pb-4 mb-6">
        <PageHeader title="Vehicles" subtitle="Manage and track vehicles." />
        <AddVehicleAction />
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

export default VehiclesPage;
