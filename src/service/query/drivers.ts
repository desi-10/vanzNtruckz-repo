import axios from "axios";

export const fetchDrivers = async () => {
  const { data } = await axios.get("/api/v1/web/drivers");
  return data;
};

export const fetchDriver = async (id: string) => {
  const { data } = await axios.get(`/api/v1/web/drivers/${id}`);
  return data;
};
