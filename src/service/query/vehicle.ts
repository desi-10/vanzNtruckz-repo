import axios from "axios";

export const fetchVehicles = async () => {
  const { data } = await axios.get("/api/v1/web/vehicles");
  return data;
};
