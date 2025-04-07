import axios from "axios";

export const fetchDrivers = async (page = 1) => {
  const { data } = await axios.get("/api/v1/web/drivers?page=" + page);
  return data;
};

export const fetchDriver = async (id: string) => {
  const { data } = await axios.get(`/api/v1/web/drivers/${id}`);
  return data;
};
