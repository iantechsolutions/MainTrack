import { api } from "~/trpc/server";
import OrgEdit from "./edit";

export default async function Page(props: { params: { orgId: string } }) {
    const user = await api.user.get();
    if (!user.user.orgSeleccionada) {
        // esto nunca debería pasar
        return <h1>No hay org seleccionada</h1>;
    }

    const orgData = {
        org: await api.org.get({orgId: user.user.orgSeleccionada}),
        users: await api.org.listUsers({orgId: user.user.orgSeleccionada})
    };

    return <div style={{
        'width': '100%',
        'height': '100%',
        'alignItems': 'center',
        'justifyContent': 'center'
    }}>
        <p>Id: {orgData.org.Id}</p>
        <p>Name: {orgData.org.nombre}</p>
        <p>Users length: {orgData.users.length}</p>
        <h3>Users:</h3>
        {orgData.users.map(u => <div key={`ou-${u?.profile.Id}`}>
            <p> Id: {u?.profile.Id}</p>
            <p> Nombre: {u?.profile.nombre}</p>
            {typeof u?.profile.imageUrl === 'string' && u?.profile.imageUrl.length > 0 ? (
                <img src={u.profile.imageUrl} width={32} height={32}></img>
            ) : <></>}
            <p> rol: {u?.orgUser.rol}</p>
        </div>)}
        <h3>Editar</h3>
        <OrgEdit />
    </div>;
}