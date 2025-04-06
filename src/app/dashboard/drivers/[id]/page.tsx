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
import Link from "next/link";
import { DriverType } from "@/types/driver";

// Update the ProfileImageWithOverlay component props and input id
const ProfileImageWithOverlay = ({
  src,
  alt,
  onImageChange,
}: {
  src: string;
  alt: string;
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
      <div className="relative w-32 h-32 rounded-full shadow-md overflow-hidden group">
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
      <p className="text-sm text-gray-500">{alt}</p>
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
  const [kycStatus, setKycStatus] = useState("PENDING");

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

  const { mutateAsync: handleUpdate, isPending: isUpdatingKyc } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      formData.append("name", driver?.user.name);
      formData.append("phone", driver?.user.phone as string);
      formData.append("email", driver?.user.email as string);
      formData.append("address", driver?.user.address as string);
      formData.append("licenseNumber", driver?.license as string);
      formData.append("vehicleType", driver.vehicleId as string);
      formData.append("plateNumber", driver.numberPlate as string);
      formData.append("roadworthyNumber", driver?.roadworthyNumber as string);
      formData.append("licenseExpiry", licenseExpiry?.toISOString() || "");
      formData.append("insuranceExpiry", insuranceExpiry?.toISOString() || "");
      formData.append(
        "roadworthyExpiry",
        roadworthyExpiry?.toISOString() || ""
      );
      formData.append("kycStatus", kycStatus);

      // Append images to formData
      Object.entries(selectedImages).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      await axios.patch(`/api/v1/web/drivers/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

  if (isError) {
    return <ServerError />;
  }

  return (
    <div className="space-y-6">
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
            variant="outline"
            className="border-red-500 text-red-500 hover:text-red-500"
          >
            <DeleteDialog data={driver} />
          </Button>
          <Button
            onClick={async () => await handleUpdate()}
            disabled={isUpdatingKyc}
            className="bg-primaryColor text-white hover:bg-primaryColor/90"
          >
            {isUpdatingKyc ? <Loader /> : "Save Changes"}
          </Button>
        </div>
      </div>

      <Button asChild variant="outline">
        <Link href={`/dashboard/drivers/${id}/orders`}>View Orders</Link>
      </Button>
      {/* Images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 lg:grid-cols-7 gap-4">
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
              alt={key}
              onImageChange={(file) => handleImageChange(key, file)}
            />
          );
        })}
      </div>
      {/* Driver Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium">Driver Name</label>
          <input
            type="text"
            value={driver?.user?.name ?? ""}
            className="border p-2 rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium">Phone Number</label>
          <input
            type="text"
            value={driver?.user?.phone ?? ""}
            className="border p-2 rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={driver?.user?.email ?? ""}
            className="border p-2 rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium">Address</label>
          <input
            type="text"
            value={driver?.user?.address ?? ""}
            className="border p-2 rounded-md"
          />
        </div>
      </div>
      {/* Other Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* License Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">License Number</label>
          <input
            type="text"
            value={driver?.license ?? ""}
            className="border p-2 rounded-md"
          />
        </div>

        {/* Vehicle Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Vehicle Type</label>
          <input
            type="text"
            value={driver?.vehicle.name ?? ""}
            className="border p-2 rounded-md"
          />
        </div>

        {/* Plate Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Number Plate</label>
          <input
            type="text"
            value={driver?.numberPlate ?? ""}
            className="border p-2 rounded-md"
          />
        </div>
        {/* Roadworthy Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Roadworthy Number</label>
          <input
            type="text"
            value={driver?.roadworthyNumber ?? ""}
            className="border p-2 rounded-md"
          />
        </div>
      </div>
      {/* Document Expiry Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {/* License Expiry */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">License Expiry</label>
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
          <label className="text-sm font-medium">Insurance Expiry</label>
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
          <label className="text-sm font-medium">Roadworthy Expiry</label>
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
        <label className="text-sm font-medium">KYC Status</label>
        <Select value={kycStatus} onValueChange={setKycStatus}>
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
    </div>
  );
};

export default SingleDriver;
