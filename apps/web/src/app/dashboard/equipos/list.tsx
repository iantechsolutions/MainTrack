"use client";

import React from "react";
import { InferSelectModel } from "drizzle-orm";
import { schema } from "~/server/db";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function EquipmentList({
  equipment,
  categories,
}: {
  equipment: InferSelectModel<typeof schema.equipment>[];
  categories: Map<string, InferSelectModel<typeof schema.equipmentCategories>>;
}) {
  return (
    <>
      {equipment.map((u) => (
        <div key={`ou-${u.Id}`}>
          <p> Id: {u.Id}</p>
          <p> Nombre: {u.name}</p>
          <p> Modelo: {u.model}</p>
          <p> Fabricante: {u.manufacturer}</p>
          <p> Numero de serie: {u.serial}</p>
          <p>
            {" "}
            Ubicación: {u.locationLat}, {u.locationLon}
          </p>
          <p>
            {" "}
            Categoría: {u.categoryId} ({categories.get(u.categoryId)?.name})
          </p>
          <p> Status: {u.status}</p>
          <p> Fecha de compra: {u.purchaseDate?.toLocaleDateString()}</p>
          <p> Fecha de expiración de garantía: {u.warrantyExpiration?.toLocaleDateString()}</p>
          <Link href={`/dashboard/equipos/${u.Id}`}>
            <Button>Ver</Button>
          </Link>
        </div>
      ))}
    </>
  );
}
