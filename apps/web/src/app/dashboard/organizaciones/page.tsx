import React from 'react';
import OrgsInfo from './info';
import { api } from '~/trpc/server';
import { auth } from '@clerk/nextjs/server';
import OrgNew from './new';

export default async function Organizaciones() {
    let orgs = await api.org.list();
    let selfId = auth().userId;

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
