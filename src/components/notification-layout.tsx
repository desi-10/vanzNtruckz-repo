"use client";

import useFcmToken from "@/hooks/use-fcm-token";

const NotificationLayout = ({ children }: { children: React.ReactNode }) => {
  const { token, notificationPermissionStatus } = useFcmToken();
  console.log("🚀 Notification token:", token);
  console.log(
    "🚀 Notification permission status:",
    notificationPermissionStatus
  );

  return <div>{children}</div>;
};

export default NotificationLayout;
