"use client";
import PageHeader from "@/components/page-header";

const SingleOrder = () => {
  return (
    <div>
      <div className="flex items-center justify-between w-full border-b pb-4 mb-6">
        <PageHeader
          title="Delievery Orders"
          subtitle="Manage and track customer orders."
        />
        {/* <AddCustomerAction /> */}
      </div>

      <div className="p-6 space-y-4"></div>
    </div>
  );
};

export default SingleOrder;
