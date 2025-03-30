"use client";
import React, { useRef, useState } from "react";
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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Plus } from "lucide-react";
import Loader from "../loader";
import { Checkbox } from "../ui/checkbox";
import { VehicleSchema } from "@/types/vehicle";
import { useAddVehicle } from "@/service/vehicle";

const AddVehicleAction = () => {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(VehicleSchema),
  });

  const { mutateAsync: addVehicleAsync, isPending: isAddingVehicle } =
    useAddVehicle();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onSubmit = async (data: z.infer<typeof VehicleSchema>) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("weight", data.weight.toString());
    formData.append("isActive", data.isActive.toString());
    formData.append("description", data.description || "");
    if (data.image) {
      formData.append("image", data.image);
    }

    console.log(
      formData.forEach((value, key) => {
        console.log(key, value);
      }),
      "Form data"
    );

    await addVehicleAsync(formData);
    setImagePreview(null);
    setOpen(false);
    reset();
  };

  const handleCancel = () => {
    setImagePreview(null);
    setOpen(false);
    reset();
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button className="bg-primaryColor text-white hover:bg-primaryColor/90">
            Add Vehicle
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
            <DialogDescription>
              Add a new vehicle to your account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col space-y-2 items-center">
              <div className="h-24 w-24 overflow-hidden rounded-full flex justify-center items-center border border-primaryColor border-dashed">
                <Image
                  src={imagePreview || "/images/default-user-profile.png"}
                  alt="Driver Profile Picture"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
                {errors.image && (
                  <p className="text-red-500">{errors.image.message}</p>
                )}
              </div>
              <Button
                type="button"
                className="flex justify-center items-center bg-primaryColor hover:bg-primaryColor/90"
                onClick={triggerFileInput}
              >
                <Plus className="mr-2" />
                Upload a vehicle picture
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                {...register("name")}
                type="text"
                placeholder="Enter name"
              />
            </div>
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
            <div>
              <Label>Weight</Label>
              <Input
                {...register("weight")}
                type="text"
                placeholder="Enter weight"
              />
              {errors.weight && (
                <p className="text-red-500">{errors.weight.message}</p>
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Input
                {...register("description")}
                type="text"
                placeholder="Enter description"
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
            </div>
            <div className="flex justify-end items-center space-x-3">
              <DialogClose asChild>
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={isAddingVehicle}
                type="submit"
                className="bg-primaryColor hover:bg-primaryColor/90 text-white"
              >
                {isAddingVehicle ? <Loader /> : "Add Vehicle"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddVehicleAction;
