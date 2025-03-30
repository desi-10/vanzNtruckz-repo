import axios from "axios";

export const sendTokenToServer = async (token: string) => {
  try {
    await axios.post("/api/v1/web/fcm-token", { token });
  } catch (error) {
    console.log("Error sending token to server:", error);
    throw error;
  }
};
