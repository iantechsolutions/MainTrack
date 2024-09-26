import 'server-only'

import { headers } from 'next/headers'
import { createCaller } from '~/server/api/root'
import { getServerSession } from 'next-auth'
import { nextAuthOptions } from '~/app/api/auth/[...nextauth]/next'
import { db } from '~/server/db'

export const serverClient = async () => {
    const session = await getServerSession(nextAuthOptions);
    const heads = new Headers(headers());
    heads.set('x-trpc-source', 'rsc');

    return createCaller({
        db,
        session,
        headers: heads,
    });
};

export const getApi = async () => await serverClient();
