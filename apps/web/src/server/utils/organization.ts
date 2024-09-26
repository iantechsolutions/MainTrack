import { and, eq, InferSelectModel } from "drizzle-orm";
import { db, schema } from "../db";
import { TRPCError } from "@trpc/server";

export const userSelectedOrg = async (id: string): Promise<[
    InferSelectModel<typeof schema.users>,
    InferSelectModel<typeof schema.organizaciones>,
    InferSelectModel<typeof schema.usuariosOrganizaciones>
] | null> => {
    const selfUser = await db.query.users.findFirst({
        where: eq(schema.users.Id, id)
    });

    if (!selfUser) {
        throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (selfUser.orgSel === null) {
        return null;
    }

    const orgSelfEntry = await db.query.usuariosOrganizaciones.findFirst({
        with: {
            organizacion: true,
        },
        where: and(
            eq(schema.usuariosOrganizaciones.orgId, selfUser.orgSel),
            eq(schema.usuariosOrganizaciones.userId, selfUser.Id)
        )
    });

    if (orgSelfEntry === undefined) {
        return null;
    } else {
        return [
            selfUser,
            orgSelfEntry.organizacion,
            orgSelfEntry
        ];
    }
}

export const userInOrg = async (userId: string, orgId: string): Promise<InferSelectModel<typeof schema.usuariosOrganizaciones> | null> => {
    const orgSelfEntry = await db.query.usuariosOrganizaciones.findFirst({
        where: and(
            eq(schema.usuariosOrganizaciones.orgId, orgId),
            eq(schema.usuariosOrganizaciones.userId, userId)
        )
    });

    if (orgSelfEntry === undefined) {
        return null;
    } else {
        return orgSelfEntry;
    }
}
