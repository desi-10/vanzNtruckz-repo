import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { fetchDriver, fetchDrivers } from "./query/drivers";

export const useGetDrivers = (page?: number) => {
  return useQuery({
    queryKey: ["drivers", page],
    queryFn: () => fetchDrivers(page),
  });
};

export const useGetDriver = (id: string) => {
  return useQuery({
    queryKey: ["driver", id],
    queryFn: () => fetchDriver(id),
  });
};

export const useAddDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      await axios.post("/api/v1/web/drivers", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
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
