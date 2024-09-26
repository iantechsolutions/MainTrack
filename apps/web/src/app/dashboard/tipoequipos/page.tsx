import React from 'react';
import { getApi } from '~/trpc/server';
import TipoEquipoNew from './new';

export default async function TipoEquipos() {
    const api = await getApi();
    const self = await api.user.get();

    // no debería pasar por el layout
    if (!self.orgSel) {
        return <h2>org no seleccionada</h2>;
    }
    
    const tipos = await api.eqType.list({ orgId: self.orgSel })
    console.log(self.orgSel);
    console.log(tipos);

    return <div style={{
        'width': '100%',
        'height': '100%',
        'alignItems': 'center',
        'justifyContent': 'center'
    }}>
        <h2>Tipos de Equipo</h2>
        <TipoEquipoNew orgId={self.orgSel} />
        {tipos.map(v => <div key={v.Id}>
            <p>Tipo de equipo: {v.name}</p>
            <p>Descripción: {v.description}</p>
        </div>)}
    </div>;
}
