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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useAddDriver } from "@/service/driver";
import { Plus } from "lucide-react";
import Loader from "../loader";
import { addUserSchema } from "@/types/driver";

const AddDriverAction = () => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, setValue, reset } = useForm({
    resolver: zodResolver(addUserSchema),
  });

  const { mutateAsync: addDriverAsync, isPending: isAddingDriver } =
    useAddDriver();
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

  const onSubmit = async (data: z.infer<typeof addUserSchema>) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("identifier", data.identifier);
    formData.append("password", data.password);
    formData.append("address", data.address);
    formData.append("role", "DRIVER");
    if (data.image) {
      formData.append("image", data.image);
    }

    console.log(
      formData.forEach((value, key) => {
        console.log(key, value);
      }),
      "Form data"
    );

    await addDriverAsync(formData);
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
            Add Driver
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Driver</DialogTitle>
            <DialogDescription>
              Add a new driver to your account.
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
              </div>
              <Button
                type="button"
                className="flex justify-center items-center bg-primaryColor hover:bg-primaryColor/90"
                onClick={triggerFileInput}
              >
                <Plus className="mr-2" />
                Upload a profile picture
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
            <div>
              <Label>Email / Phone number</Label>
              <Input
                {...register("identifier")}
                type="text"
                placeholder="Enter email or phone number"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                {...register("address")}
                type="text"
                placeholder="Enter address"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                {...register("password")}
                type="password"
                placeholder="Enter password"
              />
            </div>
            <div className="flex justify-end items-center space-x-3">
              <DialogClose asChild>
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={isAddingDriver}
                type="submit"
                className="bg-primaryColor hover:bg-primaryColor/90 text-white"
              >
                {isAddingDriver ? <Loader /> : "Add Driver"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddDriverAction;
