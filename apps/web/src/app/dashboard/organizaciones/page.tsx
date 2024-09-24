import React from 'react';
import OrgsInfo from './info';
import { getApi } from '~/trpc/server';
import OrgNew from './new';
import { getServerSession } from 'next-auth';

export default async function Organizaciones() {
    const api = await getApi();
    let orgs = await api.org.list();
    let selfId = (await getServerSession())?.user.id;

    return <div style={{
        'width': '100%',
        'height': '100%',
        'alignItems': 'center',
        'justifyContent': 'center'
    }}>
        {/* esto probablemente no vaya acá */}
        <OrgNew />
        <OrgsInfo orgs={orgs} selfId={selfId ?? ''}/>
    </div>;
}
