"use client";
import { useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { MapPin, Package, Clock, ArrowLeft, User2, Phone } from "lucide-react";
import Link from "next/link";
import { useGetOrder } from "@/service/orders";
import { Driver, Order, User } from "@prisma/client";
import Image from "next/image";

type OrderItem = {
  id: string;
  parcelId: string;
  pieces: number;
  Parcel: {
    name: string;
    unit: string;
  };
};

type UserType = User & {
  image: { id: string; url: string } | null;
};

type OrderType = Order & {
  customer?: UserType;
  driver?: Driver & {
    user?: UserType;
  };
  items?: OrderItem[];
  imageOne?: { id: string; url: string } | null;
  imageTwo?: { id: string; url: string } | null;
  imageThree?: { id: string; url: string } | null;
};

const SingleOrder = () => {
  const id = useParams().id;
  const { data: orderData } = useGetOrder((id as string) || "");
  const order: OrderType = orderData?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between w-full border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/orders">
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
          </div>
          <PageHeader
            title="Order Details"
            subtitle="View and manage delivery information"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="bg-white border-red-500 text-red-500  hover:text-red-500"
          >
            Cancel Order
          </Button>
          <Button
            asChild
            className="bg-primaryColor text-white hover:bg-primaryColor/90"
          >
            <Link href={`/dashboard/orders/${id}/edit`}>Edit Order</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-10 divide-x">
        <section className="col-span-2">
          <div className="flex items-center justify-between border-b pb-4">
            <p className="text-xl font-bold">Delivery Information</p>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Reference Number</p>
                {/* <p className="font-medium">{order?.referenceNumber}</p> */}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Payment Method</p>
                {/* <p className="font-medium">{order?.paymentMethod}</p> */}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Payment Status</p>
                {/* <Badge>{order?.isPaid ? "Paid" : "Unpaid"}</Badge> */}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Delivery Type</p>
                {/* <p className="font-medium">{order?.deliveryType}</p> */}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <MapPin className="text-green-500" />
                  <div className="">
                    <p className="">Pick-Up Location</p>
                    <p className="text-sm text-gray-500">
                      {order?.pickUpPoint}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className=" text-red-500" />
                  <div className="">
                    <p className="">Drop-Off Location</p>
                    <p className="text-sm text-gray-500">
                      {order?.dropOffPoint}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <User2 className=" text-gray-500" />
                  <div>
                    <p className="">Receipient Name</p>
                    <p className="text-sm text-gray-500">
                      {order?.recepientName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className=" text-gray-500" />
                  <div>
                    <p className="">Receipient Number</p>
                    <p className="text-sm text-gray-500">
                      {order?.recepientNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Parcel Details */}
            <div>
              <h3 className="mb-3">Parcel Information</h3>
              <div className="space-y-3 grid grid-cols-3 gap-4">
                {order?.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Package className="h-7 w-7" />
                    <div>
                      <p className="">{item?.Parcel.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item?.pieces}
                      </p>
                      <p className="text-sm text-gray-500">
                        Unit: {item?.Parcel.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Images */}
            {(order?.imageOne || order?.imageTwo || order?.imageThree) && (
              <>
                <Separator />
                <div className="space-y-3 pb-4">
                  <h3 className="">Order Images</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {order?.imageOne && (
                      <Image
                        src={order?.imageOne?.url}
                        alt="Order Image 1"
                        className="rounded-lg object-cover h-32 w-full"
                        width={320}
                        height={320}
                      />
                    )}
                    {order?.imageTwo && (
                      <Image
                        src={order?.imageTwo?.url}
                        alt="Order Image 2"
                        className="rounded-lg object-cover h-32 w-full"
                        width={320}
                        height={320}
                      />
                    )}
                    {order?.imageThree && (
                      <Image
                        src={order?.imageThree?.url}
                        alt="Order Image 3"
                        className="rounded-lg object-cover h-32 w-full"
                        width={320}
                        height={320}
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-3 mt-3 pb-4">
            <h3 className="">Additional Information</h3>
            <p className="text-sm text-gray-500">{order?.additionalInfo}</p>
          </div>
        </section>

        <div className="space-y-6 pl-10">
          {/* Customer Info */}
          <section className="space-y-2">
            <div>
              <p className="">Customer</p>
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={order?.customer?.image?.url} />
                  <AvatarFallback>
                    {order?.customer?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="">{order?.customer?.name}</p>
                  <p className="text-sm text-gray-500">
                    {order?.customer?.phone}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator />
          {/* Driver Info */}
          <section className="space-y-2">
            <div>
              <p className="text-lg">Driver</p>
            </div>
            <div className="text-sm">
              {order?.driver ? (
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={order.driver.user?.image?.url} />
                    <AvatarFallback>
                      {order.driver.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="">{order.driver.user?.name}</p>
                    <p className="text-sm text-gray-500">
                      {order.driver.user?.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No driver assigned yet</p>
              )}
            </div>
          </section>

          <Separator />
          {/* Order Timeline */}
          <div className="space-y-2">
            <div>
              <p className="">Order Timeline</p>
            </div>
            <div>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 mt-0.5 text-gray-500" />
                  <div>
                    <p className="">Order Created</p>
                    <p className="text-sm text-gray-500">
                      {order?.createdAt &&
                        format(new Date(order.createdAt), "PPP p")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleOrder;
