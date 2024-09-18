import { auth } from '@clerk/nextjs/server';
import React from 'react';
import { getBaseUrl } from '~/server/utils';
import { api } from '~/trpc/server';

export default async function Home() {
    const testQuery = await api.test.test();
    let useAuth = auth();
    let token = await useAuth.getToken();

    const url = `${getBaseUrl()}/api/app/v1/p/test`;
    console.log(url);
    console.log(token);

    const testHono = await (await fetch(url, { headers: [['Authorization', `Bearer ${await useAuth.getToken()}`]] })).text();

    return (
        <div>
            <p>tRPC Test {testQuery}</p>
            <p>Hono Test {testHono}</p>
        </div>
    );
}
  