"use client";

import { InferSelectModel } from "drizzle-orm";
import { useRef } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { schema } from "~/server/db";
import { EquipmentStatusEnum, EquipmentStatusText } from "~/server/utils/equipment_status";
import { api } from "~/trpc/react";

export default function EquipmentNew({
  orgId,
  categories,
}: {
  orgId: string;
  categories: InferSelectModel<typeof schema.equipmentCategories>[];
}) {
  const refName = useRef<HTMLInputElement>(null);
  const refModel = useRef<HTMLInputElement>(null);
  const refManufacturer = useRef<HTMLInputElement>(null);
  const refSerial = useRef<HTMLInputElement>(null);
  const refStatus = useRef<HTMLSelectElement>(null);
  const refCategory = useRef<HTMLSelectElement>(null);

  // TODO: selector con mapa
  const refLocLat = useRef<HTMLInputElement>(null);
  const refLocLon = useRef<HTMLInputElement>(null);

  const mut = api.equip.create.useMutation();

  return (
    <>
      <h1>Crear organización</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          (async () => {
            if (
              !refName.current ||
              !refLocLat.current ||
              !refLocLon.current ||
              !refModel.current ||
              !refManufacturer.current ||
              !refSerial.current ||
              !refStatus.current ||
              !refCategory.current
            ) {
              throw "!ref*.current";
            }

            await mut.mutateAsync({
              name: refName.current.value,
              location: {
                lat: Number(refLocLat.current.value ?? 0) ?? 0,
                lon: Number(refLocLon.current.value ?? 0) ?? 0,
              },
              manufacturer: refManufacturer.current.value,
              serial: refSerial.current.value,
              model: refModel.current.value,
              orgId,
              status: refStatus.current.value,
              categoryId: refCategory.current.value,
              purchaseDate: null,
              warrantyExpiration: null,
            });

            window.history.back();
          })();
        }}
      >
        <Label>Nombre:</Label>
        <br></br>
        <Input ref={refName} type="text" id="oname" name="oname" />
        <br></br>
        <Label>Modelo:</Label>
        <br></br>
        <Input ref={refModel} type="text" id="model" name="model" />
        <br></br>
        <Label>Fabricante:</Label>
        <br></br>
        <Input ref={refManufacturer} type="text" id="manuf" name="manuf" />
        <br></br>
        <Label>Numero de serie:</Label>
        <br></br>
        <Input ref={refSerial} type="text" id="serial" name="serial" />
        <br></br>
        <Label>[TODO selector mapa] Ubicación (lat):</Label>
        <br></br>
        <Input ref={refLocLat} type="text" id="lat" name="lat" />
        <br></br>
        <Label>[TODO selector mapa] Ubicación (lon):</Label>
        <br></br>
        <Input ref={refLocLon} type="text" id="lon" name="lon" />
        <br></br>
        <Label>Status:</Label>
        <br></br>
        <select ref={refStatus}>
          {EquipmentStatusEnum.map((v) => (
            <option key={`opt-${v}`} value={v}>
              {EquipmentStatusText[v]}
            </option>
          ))}
        </select>
        <br></br>
        <Label>Categoría:</Label>
        <br></br>
        <select ref={refCategory}>
          {categories.map((v) => (
            <option key={`opt-${v.Id}`} value={v.Id}>
              {v.name}
            </option>
          ))}
        </select>
        <br></br>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
