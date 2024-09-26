import React from 'react';
import OrgsInfo from './info';
import { getApi } from '~/trpc/server';
import OrgNew from './new';
import { getAuthId } from '~/lib/utils';

export default async function Organizaciones() {
    const api = await getApi();
    const orgs = await api.org.list();
    const selfId = await getAuthId();

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
