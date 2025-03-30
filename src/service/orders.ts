import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrders } from "./query/order";
import axios from "axios";

export const useGetOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(),
  });
};

export const useAddOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      await axios.post("/api/v1/web/orders", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
