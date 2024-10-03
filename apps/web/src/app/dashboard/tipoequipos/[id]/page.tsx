// import { getApi } from "~/trpc/server";
// import OrgEdit from "./edit";

import { DashScreen } from "~/components/screen";
import { getApi } from "~/trpc/server";
import { DocCorrelatedWith } from "~/server/utils/doc_types_correlation";
import TipoEquipoDocUpload from "./docupload";

export default async function Page({ params }: { params: { id: string } }) {
  const api = await getApi();
  const user = await api.user.get();
  if (!user.orgSel) {
    // esto nunca debería pasar
    return <h1>No hay org seleccionada</h1>;
  }

  const category = await api.eqType.get({ id: params.id });
  const doctypes = await api.docType.list({ orgId: user.orgSel });
  const docs = await api.doc.listFiltered({
    orgId: user.orgSel,
    equipmentId: null,
    docType: null,
    equCategoryId: params.id,
    uploadedAfter: null,
    uploadedBefore: null
  });

  return (
    <DashScreen>
      <p>Tipo de equipo: {category.name}</p>
      <p>Descripción: {category.description}</p>
      <div className="p-4">
        {docs.map(v => <p key={v.Id}>
          Documento tipo &apos;{v.docType}&apos;: <a>{v.docUrl}</a>
        </p>)}
      </div>
      <TipoEquipoDocUpload eqTypeId={params.id} orgId={user.orgSel} doctypes={doctypes.filter(k => k.correlatedWith === DocCorrelatedWith.EquipmentType)}/>
    </DashScreen>
  );
}
