import axios from "axios";

export const fetchParcels = async () => {
  const { data } = await axios.get("/api/v1/web/parcels");
  return data;
};
