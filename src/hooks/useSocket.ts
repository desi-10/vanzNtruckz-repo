// hooks/useSocket.ts
import { useGetNotifications } from "@/service/notification";
import { NotificationType } from "@/types/notification";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

// Replace with your server URL
const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:4000";

export const useSocket = () => {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [allNotifications, setAllNotifications] = useState<NotificationType[]>(
    []
  );

  const { data: notificationsData } = useGetNotifications();

  useEffect(() => {
    if (notificationsData) {
      setAllNotifications(notificationsData.data);
    }
  }, [notificationsData]);

  useEffect(() => {
    // Connect to the socket server
    const socketIo = io(SOCKET_URL);

    socketIo.on("connect", () => {
      console.log("Connected to Socket.IO server");

      // Join the 'admins' room
      socketIo.emit("join:admin");
    });

    // Listen for notifications (e.g., order or bid creation)
    socketIo.on("order:created", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast("New order created", {
        duration: Infinity,
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });
    });

    socketIo.on("order:no-bids", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast("No bids were placed for the order", {
        duration: Infinity,
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });
    });

    setSocket(socketIo);

    // Clean up on component unmount
    return () => {
      socketIo.disconnect();
    };
  }, []);

  return { socket, allNotifications };
};
