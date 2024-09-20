import React from 'react';
import { api } from '~/trpc/server';
import { auth } from '@clerk/nextjs/server';
import UserList from './list';

export default async function Usuarios() {
    let profile = await api.user.get();
    if (!profile.user.orgSeleccionada) {
        return <h1>Org no seleccionada</h1>;
    }

    let users = await api.org.listUsers({orgId: profile.user.orgSeleccionada});

    return <div style={{
        'width': '100%',
        'height': '100%',
        'alignItems': 'center',
        'justifyContent': 'center'
    }}>
        <UserList users={users} />
    </div>;
}
