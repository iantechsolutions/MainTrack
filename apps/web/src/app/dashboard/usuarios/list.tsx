"use client";

import React from "react";
import { InferSelectModel } from "drizzle-orm";
import { schema } from "~/server/db";
import { UserPublic } from "~/server/utils/other";
import Image from "next/image";

export default function UserList({
  users,
}: {
  users: ({
    profile: UserPublic;
    orgUser: InferSelectModel<typeof schema.usuariosOrganizaciones>;
  } | null)[];
}) {
  return (
    <>
      {users.map((u) => (
        <div key={`ou-${u?.profile.Id}`}>
          <p> Id: {u?.profile.Id}</p>
          <p> Nombre: {u?.profile.username}</p>
          {typeof u?.profile.imageUrl === "string" && u?.profile.imageUrl.length > 0 ? (
            <Image src={u.profile.imageUrl} width={32} height={32} alt="no img" />
          ) : (
            <></>
          )}
          <p> rol: {u?.orgUser.rol}</p>
        </div>
      ))}
    </>
  );
}
