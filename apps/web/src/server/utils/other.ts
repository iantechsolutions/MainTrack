import { UserMulti } from "./user";

export function getBaseUrl() {
    if (typeof window !== 'undefined') {
        return window.location.origin
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

export type UserPublic = {
    Id: string,
    nombre: string | null,
    imageUrl: string | null,
}

export function getUserPublic(user: UserMulti): UserPublic {
    return {
        Id: user.user.Id,
        nombre: user.clerkUser.username,
        imageUrl: user.clerkUser.imageUrl,
    }
}
