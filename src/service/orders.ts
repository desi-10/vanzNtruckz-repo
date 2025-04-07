import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrder, fetchOrders } from "./query/order";
import axios from "axios";

export const useGetOrder = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
  });
};

export const useGetOrders = (page: number) => {
  return useQuery({
    queryKey: ["orders", page],
    queryFn: () => fetchOrders(page),
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
