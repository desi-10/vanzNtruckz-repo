import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { fetchCustomers } from "./query/customer";

export const useGetCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });
};

export const useAddCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      await axios.post("/api/v1/web/customers", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(`❌ ${error.response?.data.error}` || error.response?.data.error);
        return;
      }
      console.log("An unexpected error occurred:", error);
    },
  });
};
