import axios from "axios";

export const fetchOrder = async (id: string) => {
  const { data } = await axios.get(`/api/v1/web/orders/${id}`);
  return data;
};

export const fetchOrders = async (page: number) => {
  const { data } = await axios.get("/api/v1/web/orders?page=" + page);
  return data;
};
