import { User } from "@prisma/client";

export type CustomerType = User & { image: { id: string; url: string } | null };
