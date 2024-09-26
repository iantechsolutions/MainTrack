import { type ClassValue, clsx } from 'clsx'
import { getServerSession } from 'next-auth';
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getAuthId = async (): Promise<string | null | undefined> => {
    let auth = await getServerSession();
    if (auth) {
        return auth.user.name; // sí, uso el name de next-auth para los ids
    } else {
        return null;
    }
}
