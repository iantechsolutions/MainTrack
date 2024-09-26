import { InferSelectModel } from "drizzle-orm";
import { schema } from "../db";

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NEXT_PUBLIC_TEST) {
    return `http://localhost:${process.env.PORT ?? 3000}`;
  } else {
    throw "getBaseUrl not configured";
    // return `https://maintrack.vercel.app/`
  }
}

export type UserSelf = {
  Id: string;
  username: string;
  imageUrl: string | null;
  email: string;
  orgSel: string | null;
};

export function getUserSelf(user: InferSelectModel<typeof schema.users>): UserSelf {
  return {
    Id: user.Id,
    username: user.username,
    imageUrl: user.imageUrl,
    email: user.email,
    orgSel: user.orgSel,
  };
}

export type UserPublic = {
  Id: string;
  username: string;
  imageUrl: string | null;
};

export function getUserPublic(user: InferSelectModel<typeof schema.users>): UserPublic {
  return {
    Id: user.Id,
    username: user.username,
    imageUrl: user.imageUrl,
  };
}
