import axios from "axios";

export const fetchCustomer = async (id: string) => {
  const { data } = await axios.get(`/api/v1/web/customers/${id}`);
  return data;
};

export const fetchCustomers = async () => {
  const { data } = await axios.get("/api/v1/web/customers");
  return data;
};
