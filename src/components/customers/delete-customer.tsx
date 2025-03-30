import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import Loader from "../loader";
import { useState } from "react";
import { CustomerType } from "@/types/customer";

export const DeleteDialog = ({ data }: { data: CustomerType }) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync: deleteCustomerAsync, isPending: isDeletingCustomer } =
    useMutation({
      mutationFn: async (data: { id: string }) => {
        await axios.delete(`/api/v1/web/customers/${data.id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["customers"],
        });
        toast("✅ Driver deleted successfully");
        setOpen(false);
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          toast(`❌ Error: ${error.response?.data.error}`);
          return;
        }
        console.error(error);
      },
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="text-red-600 cursor-pointer">Delete Customer</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">This action cannot be undone.</p>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => deleteCustomerAsync(data)}
            disabled={isDeletingCustomer}
          >
            {isDeletingCustomer ? <Loader /> : "Delete Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
