"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "../ui/input";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Loader from "../loader";
import { ParcelSchema } from "@/types/parcel";
import { useAddParcel } from "@/service/parcels";
import { Checkbox } from "../ui/checkbox";

const AddParcelAction = () => {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control, // Added for controlled components
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ParcelSchema),
    defaultValues: {
      isActive: false, // Ensuring it starts as a boolean
    },
  });

  const { mutateAsync: addParcelAsync, isPending: isAddingParcel } =
    useAddParcel();

  const onSubmit = async (data: z.infer<typeof ParcelSchema>) => {
    await addParcelAsync(data);
    setOpen(false);
    reset();
  };

  const handleCancel = () => {
    setOpen(false);
    reset();
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button className="bg-primaryColor text-white hover:bg-primaryColor/90">
            Add Parcel
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Parcel</DialogTitle>
            <DialogDescription>
              Add a new parcel to your account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                {...register("name")}
                type="text"
                placeholder="Enter name"
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Input
                {...register("description")}
                type="text"
                placeholder="Enter email or phone number"
              />
              {errors.description && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    className="border-primaryColor data-[state=checked]:bg-primaryColor data-[state=checked]:text-white"
                  />
                )}
              />
              <Label>Is Active</Label>
              {errors.isActive && (
                <p className="text-red-500">{errors.isActive.message}</p>
              )}
            </div>

            <div className="flex justify-end items-center space-x-3">
              <DialogClose asChild>
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={isAddingParcel}
                type="submit"
                className="bg-primaryColor hover:bg-primaryColor/90 text-white"
              >
                {isAddingParcel ? <Loader /> : "Add Parcel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddParcelAction;
