import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, patchNotification } from "./query/notification";

export const useGetNotifications = (page = 1) => {
  return useQuery({
    queryKey: ["notifications", page],
    queryFn: () => fetchNotifications(page),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patchNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
