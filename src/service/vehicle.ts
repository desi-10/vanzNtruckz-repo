import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchVehicles } from "./query/vehicle";
import axios from "axios";

export const useGetVehicles = () => {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: () => fetchVehicles(),
  });
};

export const useAddVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      await axios.post("/api/v1/web/vehicles", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};
