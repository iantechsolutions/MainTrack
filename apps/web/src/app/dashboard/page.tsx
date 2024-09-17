import React from 'react';
import { getBaseUrl } from '~/server/utils';
import { api } from '~/trpc/server';

export default async function Home() {
    const testQuery = await api.test.test();
    const url = `${getBaseUrl()}/api/app/v1/test`;
    console.log(url);
    const testHono = await (await fetch(url)).text();

    return (
        <div>
            <p>tRPC Test {testQuery}</p>
            <p>Hono Test {testHono}</p>
        </div>
    );
}
  