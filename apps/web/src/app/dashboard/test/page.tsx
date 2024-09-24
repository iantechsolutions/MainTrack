import React from 'react';
import { getBaseUrl } from '~/server/utils/other';
import { getApi } from '~/trpc/server';

import ProfEdit from './profedit';
import OrgNew from './orgnew';
import OrgEdit from './orgedit';
import OrgInv from './orginv';
import OrgInvA from './orginva';
import OrgSel from './orgsel';
import Orgs from './orgs';
import { getServerSession } from 'next-auth';

export default async function Home() {
    const api = await getApi();
    const testQuery = await api.test.test();
    const auth = await getServerSession();

    const url = `${getBaseUrl()}/api/app/v1/p/test`;
    console.log(url);

    // const testHono = await (await fetch(url, { headers: [['Authorization', `Bearer ${await auth.()}`]] })).text();
    const perfil = await api.user.get();
    const orgs = await api.org.list();
    const orgData = typeof perfil.orgSel === 'string' ? {
        org: await api.org.get({ orgId: perfil.orgSel }),
        users: await api.org.listUsers({ orgId: perfil.orgSel })
    } : null;

    return (
        <div>
            <p>tRPC Test {testQuery}</p>
            <div>
                <h1>
                    Perfil
                </h1>
                <p>Id: {perfil.Id}</p>
                <p>Org Seleccionada: {perfil.orgSel}</p>
                <p>Email: {perfil.email}</p>
                <p>Name: {perfil.username}</p>
            </div>
            <div>
                <h1>
                    Editar Perfil
                </h1>
                <ProfEdit></ProfEdit>
            </div>
            <div>
                <h1>
                    Mis Organizaciones
                </h1>
                <Orgs orgs={orgs} selfId={perfil.Id}></Orgs>
            </div>
            <div>
                <h1>
                    Organización seleccionada
                </h1>
                {orgData !== null ? (<div>
                    <p>Id: {orgData.org.Id}</p>
                    <p>Name: {orgData.org.nombre}</p>
                    <p>Users length: {orgData.users.length}</p>
                    <h3>Users:</h3>
                    {orgData.users.map(u => <div key={`ou-${u?.profile.Id}`}>
                        <p> Id: {u?.profile.Id}</p>
                        <p> Nombre: {u?.profile.username}</p>
                        <p> imageUrl: {u?.profile.imageUrl}</p>
                        {typeof u?.profile.imageUrl === 'string' && u?.profile.imageUrl.length > 0 ? (
                            <img src={u.profile.imageUrl} width={32} height={32}></img>
                        ) : <></>}
                        <p> rol: {u?.orgUser.rol}</p>
                    </div>)}
                </div>) : <h2>Ninguna seleccionada</h2>}
            </div>
            <div>
                <h1>
                    Selector Org
                </h1>
                {orgs.length > 0 ? <OrgSel orgs={orgs} orgSel={perfil.orgSel}></OrgSel> : <h6>No hay orgs disponibles para seleccionar</h6>}
            </div>
            <div>
                <h1>
                    Crear Org
                </h1>
                <OrgNew></OrgNew>
            </div>
            <div>
                <h1>
                    Editar Org
                </h1>
                <OrgEdit></OrgEdit>
            </div>
            <div>
                <h1>
                    Cambiar Rol de Usuario en Org
                </h1>
                <OrgEdit></OrgEdit>
            </div>
            <div>
                <h1>
                    Invitar a Org
                </h1>
                <OrgInv></OrgInv>
            </div>
            <div>
                <h1>
                    Aceptar invitación
                </h1>
                <OrgInvA></OrgInvA>
            </div>
        </div>
    );
}
