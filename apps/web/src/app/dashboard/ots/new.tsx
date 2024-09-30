"use client";

import { useRef } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { OtTypeEnum, OtTypeText } from "~/server/utils/ot_types";
import { api } from "~/trpc/react";

export default function OtNew({
  orgId,
  templates,
  equipos,
  usersAsignables,
  eqTypes,
}: {
  orgId: string;
  templates: {
    Id: string;
    name: string;
  }[];
  equipos: {
    Id: string;
    name: string;
  }[];
  usersAsignables: {
    Id: string;
    name: string;
  }[];
  eqTypes: {
    Id: string;
    name: string;
  }[];
}) {
  const refName = useRef<HTMLInputElement>(null);
  const refDaysPeriod = useRef<HTMLInputElement>(null);
  const refDaysLimit = useRef<HTMLInputElement>(null);
  const refTipo = useRef<HTMLSelectElement>(null);
  const refEquipo = useRef<HTMLSelectElement>(null);
  const refTemplate = useRef<HTMLSelectElement>(null);
  const refAsignado = useRef<HTMLSelectElement>(null);
  const refTipoEquipoTemplate = useRef<HTMLSelectElement>(null);

  const mut = api.ots.create.useMutation();

  return (
    <>
      <h1>Crear orden de trabajo</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          (async () => {
            if (
              !refName.current ||
              !refDaysPeriod.current ||
              !refDaysLimit.current ||
              !refTipo.current ||
              !refAsignado.current ||
              !refTipoEquipoTemplate.current ||
              !refEquipo.current ||
              !refTemplate.current
            ) {
              throw "!ref*.current";
            }

            await mut.mutateAsync({
              name: refName.current.value,
              orgId,
              daysLimit: Number(refDaysLimit.current.value),
              daysPeriod: Number(refDaysPeriod.current.value),
              equipoId: refEquipo.current.value === "null" ? null : refEquipo.current.value,
              fromTemplate: refTemplate.current.value === "null" ? null : refTemplate.current.value,
              interventionUserId: refAsignado.current.value === "null" ? null : refAsignado.current.value,
              templateEqType: refTipoEquipoTemplate.current.value === "null" ? null : refTipoEquipoTemplate.current.value,
              type: refTipo.current.value,
            });

            window.history.back();
          })();
        }}
      >
        <Label>Nombre:</Label>
        <br></br>
        <Input ref={refName} type="text" id="oname" name="oname" />
        <br></br>
        <Label>Días límite:</Label>
        <br></br>
        <Input ref={refDaysLimit} type="text" id="dlim" name="dlim" />
        <br></br>
        <Label>Período (días):</Label>
        <br></br>
        <Input ref={refDaysPeriod} type="text" id="dper" name="dper" />
        <br></br>
        <Label>Tipo:</Label>
        <br></br>
        <select ref={refTipo}>
          {OtTypeEnum.map((v) => (
            <option key={`opt-${v}`} value={v}>
              {OtTypeText[v]}
            </option>
          ))}
        </select>
        <br></br>
        <Label>Equipo:</Label>
        <br></br>
        <select ref={refEquipo}>
          <option value={"null"}>Ninguno (template)</option>
          {equipos.map((v) => (
            <option key={`opt-${v}`} value={v.Id}>
              {v.name} ({v.Id})
            </option>
          ))}
        </select>
        <br></br>
        <Label>Template:</Label>
        <br></br>
        <select ref={refTemplate}>
          <option value={"null"}>Ninguna</option>
          {templates.map((v) => (
            <option key={`opt-${v}`} value={v.Id}>
              {v.name} ({v.Id})
            </option>
          ))}
        </select>
        <br></br>
        <Label>(Crear template) Categoría de equipo:</Label>
        <br></br>
        <select ref={refTipoEquipoTemplate}>
          <option value={"null"}>Ninguno (No crear template)</option>
          {eqTypes.map((v) => (
            <option key={`opt-${v}`} value={v.Id}>
              {v.name} ({v.Id})
            </option>
          ))}
        </select>
        <br></br>
        <Label>(Si no es template) Usuario asignado:</Label>
        <br></br>
        <select ref={refAsignado}>
          <option value={"null"}>Ninguno (Template)</option>
          {usersAsignables.map((v) => (
            <option key={`opt-${v}`} value={v.Id}>
              {v.name} ({v.Id})
            </option>
          ))}
        </select>
        <br></br>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
