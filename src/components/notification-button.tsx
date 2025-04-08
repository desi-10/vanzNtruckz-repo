"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMarkNotificationAsRead } from "@/service/notification";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { PopoverClose } from "@radix-ui/react-popover";
import { useSocket } from "@/hooks/useSocket";

const NotificationPopver = () => {
  const { allNotifications } = useSocket();

  const { mutateAsync: handleIsRead } = useMarkNotificationAsRead();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative cursor-pointer"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
            {
              allNotifications.filter((notification) => !notification.isRead)
                .length
            }
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 shadow-lg rounded-lg">
        <div className="border-b px-4 py-2 font-semibold">Notification</div>
        <ScrollArea className="h-64">
          {allNotifications?.map((notification) => (
            <Link
              href={`/dashboard/orders/${notification.order.id}`}
              key={notification.id}
              onClick={() =>
                !notification.isRead && handleIsRead(notification.id)
              }
            >
              <PopoverClose
                asChild
                className={`${
                  notification.isRead ? "" : "bg-primaryColor/10"
                } `}
              >
                <div className="px-4 py-3 border-b flex flex-col text-xs">
                  <span className="text-xs">
                    <strong>{notification.message}</strong>
                  </span>
                  <span className="text-gray-500 text-xs">
                    {format(
                      new Date(notification.createdAt),
                      "MMM dd, yyyy 'at' hh:mm a"
                    )}
                  </span>
                </div>
              </PopoverClose>
            </Link>
          ))}
        </ScrollArea>
        <div className="flex justify-between items-center p-3 text-muted-foreground text-sm border-t">
          <div className="flex items-center">
            {/* <Link href="/workspace/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link> */}

            <Button variant="link" className="flex items-center">
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </Button>
          </div>
          <Button
            asChild
            className="bg-primaryColor text-white hover:bg-primaryColor/90"
          >
            <Link href="/workspace/settings/notification">
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopver;
