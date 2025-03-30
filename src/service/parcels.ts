import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchParcels } from "./query/parcel";
import axios from "axios";
import { ParcelSchema } from "@/types/parcel";
import { z } from "zod";

export const useGetParcels = () => {
  return useQuery({
    queryKey: ["parcels"],
    queryFn: () => fetchParcels(),
  });
};

export const useAddParcel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof ParcelSchema>) => {
      await axios.post("/api/v1/web/parcels", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
    },
  });
};
