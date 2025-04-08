"use client";
import PageHeader from "@/components/page-header";
import AddParcelAction from "@/components/parcels/add-parcel";
import ServerError from "@/components/server-error";
import TableLoader from "@/components/table-loader";
import { columns } from "@/components/table/columns/parcels";
import { DataTable } from "@/components/table/data-table";
import { useGetParcels } from "@/service/parcels";

const ParcelsPage = () => {
  const { data, isLoading, isError } = useGetParcels();

  if (isError) {
    return <ServerError />;
  }

  return (
    <div>
      <div className="flex items-center justify-between w-full border-b pb-4 mb-6">
        <PageHeader title="Goods" subtitle="Manage and track goods." />
        <AddParcelAction />
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

export default ParcelsPage;
