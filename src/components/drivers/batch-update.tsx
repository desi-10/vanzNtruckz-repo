"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../loader";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { FormEvent, useState } from "react";

type TRows = {
  [key: number]: boolean;
};

interface DataTableProps<TData> {
  data: {
    data: TData[];
    pagination: {
      page: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  rowSelection: TRows;
}

const BatchUpdate = <TData,>({ data, rowSelection }: DataTableProps<TData>) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { mutateAsync: batchUpdating, isPending: isLoading } = useMutation({
    mutationFn: async (data: { id: string; status: string }[]) => {
      await axios.patch("/api/v1/drivers/kyc/batch-approve", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["drivers"],
      });
      toast("✅ Data updated successfully");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(`❌ Error: ${error.response?.data.error}`);
        return;
      }
      console.error(error);
    },
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Get only selected rows
    const selectedRows = data?.data?.filter((_, index) => rowSelection[index]);

    if (!selectedRows || selectedRows.length === 0) {
      toast("No row selected");
      return;
    }

    // Map selected rows to required format
    const newData = selectedRows.map((item) => ({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      id: item.id,
      status: "APPROVED",
    }));

    await batchUpdating(newData);
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button
            variant={"outline"}
            className="border border-primaryColor text-primaryColor hover:bg-primaryColor/90 hover:text-white"
          >
            {isLoading ? <Loader color="#f77f1e" /> : "Batch Update"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit}>
            <Button>Submit</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchUpdate;
