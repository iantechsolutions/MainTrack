"use client";
import { InferSelectModel } from "drizzle-orm";
import { useRef, useState } from "react";
import FileUpload from "~/components/fileupload";
import { Combobox } from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { fileBase64 } from "~/lib/files";
import { schema } from "~/server/db";
import { DocCorrelatedWith } from "~/server/utils/doc_types_correlation";
import { getBaseUrl } from "~/server/utils/other";
import { api } from "~/trpc/react";

export default function EquipoDocUpload({ equipId, orgId, doctypes } : { equipId: string, orgId: string, doctypes: InferSelectModel<typeof schema.documentTypes>[] }) {
  const doctypeNewRef = useRef<HTMLInputElement>(null);
  const doctypeDescRef = useRef<HTMLInputElement>(null);
  const docCommentRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<FileList | null>(null);
  const [docType, setDocType] = useState<string | null>(null);
  const [docTypes, setDocTypes] = useState<InferSelectModel<typeof schema.documentTypes>[]>(doctypes);
  
  const labels = new Map<string, string>();
  for (const k of docTypes) {
    labels.set(k.Id, k.typeName);
  }

  const docTypeMut = api.docType.create.useMutation();
  const docMut = api.doc.create.useMutation();

  const doUpload = async () => {
    if (docs === null || docs.item(0) === null) {
      throw new Error("doc not selected");
    }

    const doc = docs.item(0);
    if (doc === null) {
      throw new Error("doc not selected");
    }

    let docTypeName = null;
    if (docType === null) {
      const newDT = await docTypeMut.mutateAsync({
        correlatedWith: DocCorrelatedWith.Equipment,
        description: doctypeDescRef.current?.value ?? '',
        orgId,
        typeName: doctypeNewRef.current?.value ?? ''
      });

      docTypeName = newDT.typeName;

      const k = docTypes;
      k.push(newDT);
      setDocTypes(k);
    } else {
      docTypeName = labels.get(docType) ?? '';
    }

    // todos estos chequeos pre-upload para que no falle
    const comment = docCommentRef.current?.value ?? null;
    if (docTypeName.length < 1 || docTypeName.length > 1023) {
      throw new Error("invalid docTypeName");
    } else if (comment !== null && (comment.length < 1 || comment.length > 1023)) {
      throw new Error("invalid doc comment");
    }

    const url = `${getBaseUrl()}/api/app/v1/p/file`;
    const body = {
      data64: await fileBase64(doc),
      filename: doc.name
    };

    const upload: {
      name?: string,
      url?: string
    }[] = await (await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    })).json();
    
    if (upload.length < 1 || typeof upload[0]?.url !== 'string') {
      throw new Error("invalid upload data: " + JSON.stringify(upload));
    }

    const newDoc = await docMut.mutateAsync({
      comment: docCommentRef.current?.value ?? '',
      docType: docTypeName,
      docUrl: upload[0].url,
      orgId,
      equipmentId: equipId,
      equCategoryId: null
    });

    console.log(newDoc);
  };

  return (
    <div>
      <p>Subir documento: </p>
      <FileUpload id="doc" onChange={(v) => setDocs(v.target.files)}/>
      <Label>Tipo de documento: </Label>
      <br></br>
      <Label>Comentario: </Label>
      <br></br>
      <Input ref={docCommentRef} type="text" id="dc" name="dc" />
      <br></br>
      <Combobox notfound="No existe tipo de documento"
        placeholder="Tipo de documento..."
        labels={labels}
        onChange={(v) => {
          setDocType(v);
        }} />
      <br></br>
      {docType === null ? <div className="p-4">
        <p>Nuevo tipo de documento: </p>
        <br></br>
        <Label>Nombre:</Label>
        <br></br>
        <Input ref={doctypeNewRef} type="text" id="dtn" name="dtn" />
        <br></br>
        <Label>Descripción:</Label>
        <br></br>
        <Input ref={doctypeDescRef} type="text" id="dtd" name="dtd" />
      </div> : <></>}
      <br></br>
      <button type="submit" onClick={doUpload}>Submit</button>
    </div>
  );
}
