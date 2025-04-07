import axios from "axios";

export const fetchNotifications = async (page?: number) => {
  const { data } = await axios.get(`/api/v1/web/notifications?page=${page}`);
  return data;
};

export const fetchNotification = async (id: string) => {
  const { data } = await axios.get(`/api/v1/web/notifications/${id}`);
  return data;
};

export const patchNotification = async (id: string) => {
  const { data } = await axios.patch(`/api/v1/web/notifications/${id}`);
  return data;
};
