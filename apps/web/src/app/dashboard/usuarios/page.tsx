import React from 'react';
import { getApi } from '~/trpc/server';
import UserList from './list';

export default async function Usuarios() {
    const api = await getApi();
    const profile = await api.user.get();
    if (!profile.orgSel) {
        return <h1>Org no seleccionada</h1>;
    }

    const users = await api.org.listUsers({orgId: profile.orgSel});

    return <div style={{
        'width': '100%',
        'height': '100%',
        'alignItems': 'center',
        'justifyContent': 'center'
    }}>
        <UserList users={users} />
    </div>;
}
