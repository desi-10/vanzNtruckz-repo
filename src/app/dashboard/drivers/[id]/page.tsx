"use client";
import ServerError from "@/components/server-error";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/drivers/delete-driver";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/loader";
import { useGetDriver } from "@/service/driver";
import { DriverType, UpdateDriverSchema } from "@/types/driver";

// Add to imports at the top
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { KycStatus } from "@prisma/client";
import { Label } from "@/components/ui/label";

// Update the ProfileImageWithOverlay component props and input id
const ProfileImageWithOverlay = ({
  src,
  alt,
  onImageChange,
}: {
  src: string;
  alt: ProfileImageKey;
  onImageChange: (file: File) => void;
}) => {
  const inputId = `profile-image-input-${alt}`; // Create unique ID for each input

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file) {
        onImageChange(file);
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative w-28 h-28 rounded-full shadow-md overflow-hidden group">
        <label htmlFor={inputId} className="cursor-pointer">
          {" "}
          {/* Use unique ID here */}
          <Image
            src={src || "/images/default-user-profile.png"}
            alt={alt}
            width={150}
            height={150}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        {alt === "profilePicture"
          ? "Profile Picture"
          : alt === "carPicture"
          ? "Car Picture"
          : alt === "numberPlatePicture"
          ? "Number Plate Picture"
          : alt === "licensePicture"
          ? "License Picture"
          : alt === "roadworthySticker"
          ? "Roadworthy Sticker"
          : alt === "insuranceSticker"
          ? "Insurance Sticker"
          : "Ghana Card Picture"}
      </p>
    </div>
  );
};

type ProfileImageKey =
  | "carPicture"
  | "profilePicture"
  | "licensePicture"
  | "numberPlatePicture"
  | "ghanaCardPicture"
  | "roadworthySticker"
  | "insuranceSticker";

const SingleDriver = () => {
  const id = useParams().id;
  const queryClient = useQueryClient();
  const {
    data: driverData,
    isLoading,
    isError,
  } = useGetDriver((id as string) || "");
  const driver: DriverType = driverData?.data || null;
  // Initialize dates properly
  const [licenseExpiry, setLicenseExpiry] = useState<Date | undefined>(
    undefined
  );
  const [insuranceExpiry, setInsuranceExpiry] = useState<Date | undefined>(
    undefined
  );
  const [roadworthyExpiry, setRoadworthyExpiry] = useState<Date | undefined>(
    undefined
  );
  const [kycStatus, setKycStatus] = useState<string | undefined>(undefined);

  // Update dates when data is available
  useEffect(() => {
    if (!isLoading && driver) {
      if (driver.licenseExpiry) {
        setLicenseExpiry(new Date(driver.licenseExpiry));
      }
      if (driver.insuranceExpiry) {
        setInsuranceExpiry(new Date(driver.insuranceExpiry));
      }
      if (driver.roadworthyExpiry) {
        setRoadworthyExpiry(new Date(driver.roadworthyExpiry));
      }
      setKycStatus(driver.kycStatus ?? "PENDING");
    }
  }, [driver, isLoading]);

  const [selectedImages, setSelectedImages] = useState({
    carPicture: null,
    profilePicture: null,
    licensePicture: null,
    numberPlatePicture: null,
    ghanaCardPicture: null,
    roadworthySticker: null,
    insuranceSticker: null,
  });

  const handleImageChange = (field: string, file: File | null) => {
    console.log(field, "field");
    console.log(file, "file");

    setSelectedImages((prev) => {
      const updatedImages = { ...prev, [field]: file };
      return updatedImages;
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof UpdateDriverSchema>>({
    resolver: zodResolver(UpdateDriverSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      address: "",
      license: "",
      numberPlate: "",
      roadworthyNumber: "",
    },
  });

  // Update useEffect to set form values when driver data loads
  useEffect(() => {
    if (driver) {
      reset({
        name: driver.user.name,
        phoneNumber: driver.user.phone,
        // email: driver.user.email,
        address: driver.user.address,
        license: driver.license,
        numberPlate: driver.numberPlate,
        roadworthyNumber: driver.roadworthyNumber,
      });
    }
  }, [driver, reset]);

  // Update the mutation to use form data
  const { mutateAsync: handleUpdate, isPending: isUpdatingKyc } = useMutation({
    mutationFn: async (data: z.infer<typeof UpdateDriverSchema>) => {
      const formData = new FormData();

      formData.append("name", data.name || "");

      formData.append("phone", data.phoneNumber || "");
      // formData.append("email", data.email || "");
      formData.append("address", data.address || "");
      formData.append("license", data.license || "");
      formData.append("vehicleType", driver.vehicleId || "");
      formData.append("numberPlate", data.numberPlate || "");
      formData.append("roadworthyNumber", data.roadworthyNumber || "");
      formData.append("licenseExpiry", licenseExpiry?.toISOString() || "");
      formData.append("insuranceExpiry", insuranceExpiry?.toISOString() || "");
      formData.append(
        "roadworthyExpiry",
        roadworthyExpiry?.toISOString() || ""
      );
      formData.append("kycStatus", kycStatus || "PENDING");

      Object.entries(selectedImages).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      return await axios.patch(`/api/v1/web/drivers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver", id] });
      toast.success("KYC updated successfully!");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(`Error: ${error.response?.data.error}`);
      } else {
        console.error(error);
      }
    },
  });

  const onSubmit = async (data: z.infer<typeof UpdateDriverSchema>) => {
    await handleUpdate(data);
  };

  if (isError) {
    return <ServerError />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between w-full border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Driver Details</h1>
          <p className="text-sm text-gray-600">
            View and manage driver details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-red-500 text-red-500 hover:text-red-500"
          >
            <DeleteDialog data={driver} />
          </Button>
          <Button
            type="submit"
            disabled={isUpdatingKyc}
            className="bg-primaryColor text-white hover:bg-primaryColor/90"
          >
            {isUpdatingKyc ? <Loader /> : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* <Button asChild variant="outline">
        <Link href={`/dashboard/drivers/${id}/orders`}>View Orders</Link>
      </Button> */}
      {/* Images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 lg:grid-cols-7 gap-4 py-5">
        {Object.entries(selectedImages).map(([key, value]) => {
          const typedKey = key as ProfileImageKey;

          return (
            <ProfileImageWithOverlay
              key={key}
              src={
                value
                  ? URL.createObjectURL(value)
                  : (driver?.[typedKey] as { url: string })?.url ??
                    "/images/default-user-profile.png"
              }
              alt={key as ProfileImageKey}
              onImageChange={(file) => handleImageChange(key, file)}
            />
          );
        })}
      </div>
      {/* Driver Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <Label>Driver Name</Label>
          <Input {...register("name")} />
          {errors.name && (
            <span className="text-sm text-red-500">{errors.name.message}</span>
          )}
        </div>
        <div className="flex flex-col">
          <Label>Phone Number</Label>
          <Input {...register("phoneNumber")} />
        </div>
        <div className="flex flex-col">
          <Label>Email</Label>
          <Input type="email" className="border p-2 rounded-md" />
        </div>
        <div className="flex flex-col">
          <Label>Address</Label>
          <Input className="border p-2 rounded-md" {...register("address")} />
        </div>
      </div>
      {/* Other Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* License Number */}
        <div className="flex flex-col">
          <Label>License</Label>
          <Input
            type="text"
            className="border p-2 rounded-md"
            {...register("license")}
          />
        </div>

        {/* Vehicle Type */}
        <div className="flex flex-col">
          <Label>Vehicle Type</Label>
          <Input type="text" className="border p-2 rounded-md" />
        </div>

        {/* Plate Number */}
        <div className="flex flex-col">
          <Label>Number Plate</Label>
          <Input
            type="text"
            className="border p-2 rounded-md"
            {...register("numberPlate")}
          />
        </div>
        {/* Roadworthy Number */}
        <div className="flex flex-col">
          <Label>Roadworthy Number</Label>
          <Input
            type="text"
            className="border p-2 rounded-md"
            {...register("roadworthyNumber")}
          />
        </div>
      </div>
      {/* Document Expiry Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {/* License Expiry */}
        <div className="flex flex-col">
          <Label>License Expiry</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full">
                {licenseExpiry ? format(licenseExpiry, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={licenseExpiry}
                onSelect={setLicenseExpiry}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Insurance Expiry */}
        <div className="flex flex-col">
          <Label>Insurance Expiry</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full">
                {insuranceExpiry
                  ? format(insuranceExpiry, "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={insuranceExpiry}
                onSelect={setInsuranceExpiry}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Roadworthy Expiry */}
        <div className="flex flex-col">
          <Label>Roadworthy Expiry</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full">
                {roadworthyExpiry
                  ? format(roadworthyExpiry, "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={roadworthyExpiry}
                onSelect={setRoadworthyExpiry}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {/* KYC Status Dropdown */}
      <div className="w-full sm:w-64">
        <Label>KYC Status</Label>
        <Select
          value={kycStatus}
          onValueChange={(value) => setKycStatus(value as KycStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select KYC Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  );
};

export default SingleDriver;
