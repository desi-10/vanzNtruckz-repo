import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DriverType } from "@/types/driver";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import Loader from "../loader";
import { useState } from "react";

export const DeleteDialog = ({ data }: { data: DriverType }) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync: deleteDriverAsync, isPending: isDeletingDriver } =
    useMutation({
      mutationFn: async (data: { id: string }) => {
        await axios.delete(`/api/v1/web/drivers/${data.id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["drivers"],
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
        <div className="text-red-600 cursor-pointer">Delete Driver</div>
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
            onClick={() => deleteDriverAsync(data)}
            disabled={isDeletingDriver}
          >
            {isDeletingDriver ? <Loader /> : "Delete Driver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
