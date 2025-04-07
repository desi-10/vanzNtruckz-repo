"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetNotifications } from "@/service/notification";
import { Inbox } from "@prisma/client";
import { Bell, CheckCheck, Settings } from "lucide-react";
import Link from "next/link";

const NotificationPopver = () => {
  const { data: notificationsData } = useGetNotifications();
  const notifications: Inbox[] = notificationsData?.data || [];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer border-gray-500 border-2 rounded-full p-1">
          <Bell className="w-6 h-6 text-gray-500" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
            {notifications?.length}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 shadow-lg rounded-lg">
        <div className="border-b px-4 py-2 font-semibold">Notification</div>
        <ScrollArea className="h-64">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className="px-4 py-3 border-b flex flex-col text-sm"
            >
              <span>
                <strong>{notification.userId}</strong> {notification.type}{" "}
                <strong>{notification.message}</strong>
              </span>
              <span className="text-gray-500 text-xs">
                {notification.createdAt.toDateString()}
              </span>
            </div>
          ))}
        </ScrollArea>
        <div className="flex justify-between items-center p-3 text-muted-foreground text-sm border-t">
          <div className="flex items-center">
            <Link href="/workspace/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>

            <Button variant="link" className="flex items-center">
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </Button>
          </div>
          <Link href="/workspace/settings/notification">
            <Button className="bg-primary-color text-white">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopver;
