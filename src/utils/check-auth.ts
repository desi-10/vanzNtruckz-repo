import { auth } from "@/auth";

export const checkAuth = async () => {
  const session = await auth();
  if (
    !session ||
    !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
  ) {
    return null;
  }
  return session;
};
