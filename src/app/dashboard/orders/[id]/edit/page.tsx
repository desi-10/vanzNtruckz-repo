"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { useGetOrder } from "@/service/orders";
import { OrderSchema, OrderType } from "@/types/order";
import { useGetDrivers } from "@/service/driver";
import { DriverType } from "@/types/driver";
import { OrderStatus } from "@prisma/client";
import { DriverCombobox } from "@/components/drivers/drivers-combo-box";
import Image from "next/image";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/loader";

export default function EditOrderPage() {
  const id = useParams().id;
  const queryClient = useQueryClient();

  const { data: driversData } = useGetDrivers();
  const drivers: DriverType[] = driversData?.data || [];

  const { data: orderData } = useGetOrder(id as string);
  const order: OrderType | null = orderData?.data || null;
  const [driver, setDriver] = useState<DriverType | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [images, setImages] = useState<{
    imageOne: File | null;
    imageTwo: File | null;
    imageThree: File | null;
  }>({
    imageOne: null,
    imageTwo: null,
    imageThree: null,
  });

  const [previews, setPreviews] = useState<{
    imageOne: string | null;
    imageTwo: string | null;
    imageThree: string | null;
  }>({
    imageOne: null,
    imageTwo: null,
    imageThree: null,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof OrderSchema>>({
    resolver: zodResolver(OrderSchema),
    defaultValues: {
      status: "PENDING",
      pickUpPoint: "",
      dropOffPoint: "",
      vehicleId: "",
      recepientName: "",
      recepientNumber: "",
      additionalInfo: "",
      parcel: [],
      coupon: "",
    },
  });

  useEffect(() => {
    if (order) {
      setPreviews({
        imageOne: order.imageOne?.url || null,
        imageTwo: order.imageTwo?.url || null,
        imageThree: order.imageThree?.url || null,
      });
    }
  }, [order]);

  useEffect(() => {
    if (order) {
      reset({
        status: order.status,
        pickUpPoint: order.pickUpPoint,
        dropOffPoint: order.dropOffPoint,
        vehicleId: order.vehicleId,
        recepientName: order.recepientName,
        recepientNumber: order.recepientNumber,
        additionalInfo: order.additionalInfo || "",
        parcel: order.items || [],
        coupon: order.couponId || "",
      });

      setAmount(order.amount || 0);
      setDriver(order.driver || null);
      setScheduledDate(new Date(order.scheduledDate || "") || null);
    }
  }, [order, reset]);

  console.log(driver, "driver");

  const { mutate: updateOrder, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      return await axios.patch(`/api/v1/web/orders/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      toast.success("Order updated successfully");
    },
  });

  const onSubmit = async (data: z.infer<typeof OrderSchema>) => {
    const formData = new FormData();

    formData.append("status", data.status || "PENDING");
    formData.append("pickUpPoint", data.pickUpPoint);
    formData.append("dropOffPoint", data.dropOffPoint);
    formData.append("amount", amount.toString() || "0");
    formData.append("driverId", driver?.userId || "");
    formData.append("vehicleId", driver?.vehicleId || data.vehicleId);
    formData.append("recepientName", data.recepientName);
    formData.append("recepientNumber", data.recepientNumber);
    formData.append("additionalInfo", data.additionalInfo || "");
    formData.append("parcel", JSON.stringify(data.parcel));
    formData.append("coupon", data.coupon || "");
    formData.append("scheduledDate", scheduledDate?.toString() || "");

    if (images.imageOne) {
      formData.append("imageOne", images.imageOne);
    }
    if (images.imageTwo) {
      formData.append("imageTwo", images.imageTwo);
    }
    if (images.imageThree) {
      formData.append("imageThree", images.imageThree);
    }

    updateOrder(formData);
  };

  console.log(errors, "errors");
  // console.log(driverId, "driverId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <Button variant="ghost" asChild>
            <Link href={`/dashboard/orders/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Booking
            </Link>
          </Button>
          <h1 className="text-2xl font-bold mt-2">Edit Booking</h1>
          <p className="text-sm text-gray-600">Update booking information</p>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primaryColor text-white hover:bg-primaryColor/90"
        >
          {isPending ? <Loader /> : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-2 mb-5">
        <Label>Booking Images</Label>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((num) => {
            const imageKey = `image${
              ["One", "Two", "Three"][num - 1]
            }` as keyof typeof previews;
            return (
              <div key={num} className="relative">
                <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors flex justify-center items-center">
                  {previews[imageKey] ? (
                    <div className="relative w-[140px] h-[140px] rounded-lg">
                      <Image
                        src={previews[imageKey]}
                        alt={`Upload ${num}`}
                        className="w-full h-full object-cover rounded-lg"
                        width={300}
                        height={300}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviews((prev) => ({
                            ...prev,
                            [imageKey]: null,
                          }));
                          setImages((prev) => ({
                            ...prev,
                            [imageKey]: null,
                          }));
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="flex flex-col items-center justify-center py-4 w-[140px] h-[140px]">
                        <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center w-full">
                          Click to upload image
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPreviews((prev) => ({
                                ...prev,
                                [imageKey]: reader.result as string,
                              }));
                            };
                            reader.readAsDataURL(file);

                            setImages((prev) => ({
                              ...prev,
                              [imageKey]: file,
                            }));
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <section className="col-span-1">
          <div>
            <p>Booking Details</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Assign Driver</Label>
              <DriverCombobox
                drivers={drivers}
                value={driver}
                onChange={setDriver}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Booking Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(val) => setValue("status", val as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELED">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount (₵)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </section>

        <section className="col-span-2">
          <div>
            <p>Delivery Information</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              {/* Vehicle Type */}
              <div className="space-y-2">
                <Label>Vehicle Type</Label>
                <Input
                  type="text"
                  value={driver?.vehicle?.name || order?.vehicle?.name}
                  disabled
                />
              </div>

              {/* Scheduled Date */}
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input
                  type="datetime-local"
                  onChange={(e) => setScheduledDate(new Date(e.target.value))}
                />
                {errors.scheduledDate && (
                  <p className="text-sm text-red-500">
                    {errors.scheduledDate.message}
                  </p>
                )}
              </div>

              {/* Coupon */}
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input {...register("coupon")} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pickup Location</Label>
                <Input {...register("pickUpPoint")} />
                {errors.pickUpPoint && (
                  <p className="text-sm text-red-500">
                    {errors.pickUpPoint.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Recepient Name</Label>
                <Input {...register("recepientName")} />
                {errors.recepientName && (
                  <p className="text-sm text-red-500">
                    {errors.recepientName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Drop-off Location</Label>
                <Input {...register("dropOffPoint")} />
                {errors.dropOffPoint && (
                  <p className="text-sm text-red-500">
                    {errors.dropOffPoint.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Recepient Number</Label>
                <Input {...register("recepientNumber")} />
                {errors.recepientNumber && (
                  <p className="text-sm text-red-500">
                    {errors.recepientNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Additional Information</Label>
                <Textarea {...register("additionalInfo")} rows={4} />
                {errors.additionalInfo && (
                  <p className="text-sm text-red-500">
                    {errors.additionalInfo.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
