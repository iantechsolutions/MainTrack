import { InferSelectModel } from "drizzle-orm";
import { schema } from "./db";

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
    nombre: string,
    rol: string | null,
    orgSeleccionada: string | null
}

export function getUserPublic(user: InferSelectModel<typeof schema.users>): UserPublic {
    return {
        Id: user.Id,
        nombre: user.nombre,
        orgSeleccionada: user.orgSeleccionada,
        rol: user.rol
    }
}
