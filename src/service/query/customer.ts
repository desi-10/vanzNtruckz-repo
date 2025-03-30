export const fetchCustomers = async () => {
  const response = await fetch("/api/v1/web/customers");
  const data = await response.json();
  return data;
};
