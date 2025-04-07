import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ["notification"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/web/notifications");
      return data;
    },
  });
};
