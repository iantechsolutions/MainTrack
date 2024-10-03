import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userInOrg } from "~/server/utils/organization";
import { TRPCError } from "@trpc/server";
import { UserRoles } from "~/server/utils/roles";
import { db, schema } from "~/server/db";
import { and, eq, gte, ilike, lte, SQLWrapper } from "drizzle-orm";
import { ilikeSanitizedContains } from "~/server/utils/ilike";

export const docCreateSchema = z.object({
  docType: z.string().min(1).max(1023),
  docUrl: z.string().min(1).max(1023),
  comment: z.string().min(1).max(1023).nullable(),
  equipmentId: z.string().min(1).max(1023).nullable(),
  equCategoryId: z.string().min(1).max(1023).nullable(),
  orgId: z.string().min(1).max(1023),
});

export const docListSchema = z.object({
  orgId: z.string().min(1).max(1023),
  docType: z.string().min(1).max(1023).nullable(),
  equCategoryId: z.string().nullable(),
  equipmentId: z.string().nullable(),
  uploadedAfter: z.number().nullable(),
  uploadedBefore: z.number().nullable(),
});

export const docRouter = createTRPCRouter({
  create: protectedProcedure.input(docCreateSchema).mutation(async ({ ctx, input }) => {
    const selfId = ctx.session.user.id;
    const userOrgEntry = await userInOrg(selfId, input.orgId);
    if (!userOrgEntry) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({code: 'FORBIDDEN'});
            } */

    // esto lo hago para que solo UN id no sea null
    // (porque sino el usuario podría introducir dos ids y sólo chequearía una)
    const ids: {
      equipmentId: string | null;
      equCategoryId: string | null;
    } = {
      equipmentId: null,
      equCategoryId: null,
    };

    if (input.equipmentId) {
      const equipment = await db.query.equipment.findFirst({
        where: and(eq(schema.equipment.Id, input.equipmentId), eq(schema.equipment.orgId, userOrgEntry.orgId)),
      });

      if (!equipment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      ids.equipmentId = equipment.Id;
    } else if (input.equCategoryId) {
      const equCat = await db.query.equipmentCategories.findFirst({
        where: and(eq(schema.equipmentCategories.Id, input.equCategoryId), eq(schema.equipmentCategories.orgId, userOrgEntry.orgId)),
      });

      if (!equCat) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      ids.equCategoryId = equCat.Id;
    } else {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    // TODO: validar docUrl

    const doc = await db
      .insert(schema.documents)
      .values({
        docType: input.docType,
        docUrl: input.docUrl,
        orgId: userOrgEntry.orgId,
        comment: input.comment,
        equCategoryId: ids.equCategoryId,
        equipmentId: ids.equipmentId,
      })
      .returning();

    if (doc.length < 1 || !doc[0]) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return doc[0];
  }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(1023),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const selfId = ctx.session.user.id;
      const doc = await db.query.documents.findFirst({
        where: eq(schema.documents.Id, input.id),
      });

      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, doc.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (userOrgEntry.rol !== UserRoles.orgAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.delete(schema.documents).where(eq(schema.documents.Id, doc.Id));

      return "ok";
    }),
  get: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(1023),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const selfId = ctx.session.user.id;
      const doc = await db.query.documents.findFirst({
        where: eq(schema.documents.Id, input.id),
      });

      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, doc.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({code: 'FORBIDDEN'});
            } */

      return doc;
    }),
  listFiltered: protectedProcedure.input(docListSchema).mutation(async ({ input, ctx }) => {
    const selfId = ctx.session.user.id;
    const userOrgEntry = await userInOrg(selfId, input.orgId);
    if (!userOrgEntry) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const conditions: SQLWrapper[] = [eq(schema.documents.orgId, userOrgEntry.orgId)];
    if (input.docType) {
      conditions.push(ilike(schema.documents.docType, ilikeSanitizedContains(input.docType)));
    }

    if (input.equCategoryId) {
      conditions.push(eq(schema.documents.equCategoryId, input.equCategoryId));
    }

    if (input.equipmentId) {
      conditions.push(eq(schema.documents.equipmentId, input.equipmentId));
    }

    if (typeof input.uploadedAfter === "number") {
      conditions.push(gte(schema.documents.uploadedAt, new Date(input.uploadedAfter)));
    }

    if (typeof input.uploadedBefore === "number") {
      conditions.push(lte(schema.documents.uploadedAt, new Date(input.uploadedBefore)));
    }

    const doc = await db.query.documents.findMany({
      where: and(...conditions),
    });

    return doc;
  }),
});
