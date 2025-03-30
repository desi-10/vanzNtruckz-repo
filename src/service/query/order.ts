export const fetchOrders = async () => {
  const response = await fetch("/api/v1/web/orders");
  const data = await response.json();
  return data;
};
