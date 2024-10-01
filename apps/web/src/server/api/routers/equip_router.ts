import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { userInOrg } from "~/server/utils/organization";
import { db, schema } from "~/server/db";
import { and, eq, ilike, inArray, SQLWrapper } from "drizzle-orm";
import { EquipmentStatusEnum } from "~/server/utils/equipment_status";
import { ilikeSanitizedContains } from "~/server/utils/ilike";
import { UserRoles } from "~/server/utils/roles";

export const equipListSchema = z.object({
  orgId: z.string().min(1).max(1023),
  nameLike: z.string().min(1).max(1023).optional(),
  modelLike: z.string().min(1).max(1023).optional(),
  manufacturerLike: z.string().min(1).max(1023).optional(),
  serialLike: z.string().min(1).max(1023).optional(),
  status: z.enum(EquipmentStatusEnum),
});

export const equipCreateSchema = z.object({
  orgId: z.string().min(1).max(1023),
  name: z.string().min(1).max(1023),
  model: z.string().min(1).max(1023),
  manufacturer: z.string().min(1).max(1023),
  serial: z.string().min(1).max(1023),
  purchaseDate: z.date().nullable(),
  warrantyExpiration: z.date().nullable(),
  location: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  categoryId: z.string().min(1).max(1023),
  status: z.enum(EquipmentStatusEnum),
});

export const equipEditStatusSchema = z.object({
  id: z.string().min(1).max(1023),
  status: z.enum(EquipmentStatusEnum),
});

export const equipEditLocationSchema = z.object({
  id: z.string().min(1).max(1023),
  location: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
});

export const equipPhotoPutSchema = z.object({
  id: z.string().min(1).max(1023),
  imgUrl: z.string().min(1).max(1023),
  description: z.string().max(4096),
});

export const equipRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        equipId: z.string().min(1).max(1023),
      }),
    )
    .query(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const equip = await db.query.equipment.findFirst({
        with: {
          documents: true,
          photos: true
        },
        where: eq(schema.equipment.Id, input.equipId),
      });

      if (!equip) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, equip.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return equip;
    }),
  list: protectedProcedure
    .input(
      z.object({
        orgId: z.string().min(1).max(1023),
      }),
    )
    .query(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const userOrgEntry = await userInOrg(selfId, input.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const eqTypes = await db.query.equipment.findMany({
        where: eq(schema.equipment.orgId, userOrgEntry.orgId),
      });

      return eqTypes;
    }),
  listFiltered: protectedProcedure.input(equipListSchema).query(async ({ ctx, input }) => {
    const selfId = ctx.session.user.id;
    const userOrgEntry = await userInOrg(selfId, input.orgId);
    if (!userOrgEntry) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const conditions: SQLWrapper[] = [eq(schema.equipment.orgId, userOrgEntry.orgId)];
    if (input.nameLike) {
      conditions.push(ilike(schema.equipment.name, ilikeSanitizedContains(input.nameLike)));
    }

    if (input.modelLike) {
      conditions.push(ilike(schema.equipment.model, ilikeSanitizedContains(input.modelLike)));
    }

    if (input.manufacturerLike) {
      conditions.push(ilike(schema.equipment.manufacturer, ilikeSanitizedContains(input.manufacturerLike)));
    }

    if (input.serialLike) {
      conditions.push(ilike(schema.equipment.serial, ilikeSanitizedContains(input.serialLike)));
    }

    if (input.status) {
      conditions.push(eq(schema.equipment.status, input.status));
    }

    return await db.query.equipment.findMany({
      where: and(...conditions),
    });
  }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const equipment = await db.query.equipment.findFirst({
        where: eq(schema.equipment.Id, input.id),
      });

      if (!equipment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, equipment.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (userOrgEntry.rol !== UserRoles.orgAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const allInterventions = new Set<string>();
      const ots = await db.query.ots.findMany({
        with: {
          interventions: true,
        },
        where: and(eq(schema.ots.orgId, equipment.orgId), eq(schema.ots.equipoId, equipment.Id)),
      });

      for (const interv of ots.map((k) => k.interventions).flat()) {
        if (!allInterventions.has(interv.Id)) {
          allInterventions.add(interv.Id);
        }
      }

      await db.transaction(async (tx) => {
        await tx
          .delete(schema.equipmentPhotos)
          .where(and(eq(schema.equipmentPhotos.orgId, equipment.orgId), eq(schema.equipmentPhotos.equipmentId, equipment.Id)));
        await tx
          .delete(schema.documents)
          .where(and(eq(schema.documents.orgId, equipment.orgId), eq(schema.documents.equipmentId, equipment.Id)));
        await tx
          .delete(schema.interventions)
          .where(and(eq(schema.interventions.orgId, equipment.orgId), inArray(schema.interventions.Id, Array.from(allInterventions))));
        await tx.delete(schema.ots).where(and(eq(schema.ots.orgId, equipment.orgId), eq(schema.ots.equipoId, equipment.Id)));
        await tx.delete(schema.equipment).where(eq(schema.equipment.Id, equipment.Id));
      });

      return "ok";
    }),
  create: protectedProcedure.input(equipCreateSchema).mutation(async ({ ctx, input }) => {
    const selfId = ctx.session.user.id;
    const userOrgEntry = await userInOrg(selfId, input.orgId);
    if (!userOrgEntry) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({code: 'FORBIDDEN'});
            } */

    const category = await db.query.equipmentCategories.findFirst({
      where: and(eq(schema.equipmentCategories.Id, input.categoryId), eq(schema.equipmentCategories.orgId, userOrgEntry.orgId)),
    });

    if (!category) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const res = await db
      .insert(schema.equipment)
      .values({
        categoryId: category.Id,
        manufacturer: input.manufacturer,
        model: input.model,
        name: input.name,
        orgId: userOrgEntry.orgId,
        status: input.status,
        serial: input.serial,
        warrantyExpiration: input.warrantyExpiration,
        purchaseDate: input.purchaseDate,
        locationLon: input.location.lon,
        locationLat: input.location.lat,
      })
      .returning();

    if (res.length < 1 || !res[0]) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return res[0];
  }),
  editStatus: protectedProcedure.input(equipEditStatusSchema).mutation(async ({ ctx, input }) => {
    const selfId = ctx.session.user.id;
    const equipment = await db.query.equipment.findFirst({
      where: eq(schema.equipment.Id, input.id),
    });

    if (!equipment) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const userOrgEntry = await userInOrg(selfId, equipment.orgId);
    if (!userOrgEntry) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
        throw new TRPCError({code: 'FORBIDDEN'});
    } */

    const res = await db
      .update(schema.equipment)
      .set({
        status: input.status,
      })
      .where(eq(schema.equipment.Id, equipment.Id))
      .returning();

    if (res.length < 1 || !res[0]) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return res[0];
  }),
  editLoc: protectedProcedure.input(equipEditLocationSchema).mutation(async ({ ctx, input }) => {
    const selfId = ctx.session.user.id;
    const equipment = await db.query.equipment.findFirst({
      where: eq(schema.equipment.Id, input.id),
    });

    if (!equipment) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const userOrgEntry = await userInOrg(selfId, equipment.orgId);
    if (!userOrgEntry) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
        throw new TRPCError({code: 'FORBIDDEN'});
    } */

    const res = await db
      .update(schema.equipment)
      .set({
        locationLat: input.location.lat,
        locationLon: input.location.lon,
      })
      .where(eq(schema.equipment.Id, equipment.Id))
      .returning();

    if (res.length < 1 || !res[0]) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return res[0];
  }),
  photoPut: protectedProcedure.input(equipPhotoPutSchema).mutation(async ({ ctx, input }) => {
    const selfId = ctx.session.user.id;
    const equipment = await db.query.equipment.findFirst({
      where: eq(schema.equipment.Id, input.id),
    });

    if (!equipment) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const userOrgEntry = await userInOrg(selfId, equipment.orgId);
    if (!userOrgEntry) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
          throw new TRPCError({code: 'FORBIDDEN'});
      } */

    const res = await db
      .insert(schema.equipmentPhotos)
      .values({
        description: input.description,
        equipmentId: equipment.Id,
        orgId: equipment.orgId,
        photoUrl: input.imgUrl,
      })
      .returning();

    if (res.length < 1 || !res[0]) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return res[0];
  }),
  photoDel: protectedProcedure
    .input(
      z.object({
        photoId: z.string().min(1).max(1023),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const eqPhoto = await db.query.equipmentPhotos.findFirst({
        with: {
          equipmentId: true,
        },
        where: eq(schema.equipmentPhotos.Id, input.photoId),
      });

      if (!eqPhoto) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, eqPhoto.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
          throw new TRPCError({code: 'FORBIDDEN'});
      } */

      await db.delete(schema.equipmentPhotos).where(eq(schema.equipmentPhotos.Id, eqPhoto.Id));

      return "ok";
    }),
  photoList: protectedProcedure
    .input(
      z.object({
        equipId: z.string().min(1).max(1023),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const equipment = await db.query.equipment.findFirst({
        with: {
          photos: true,
        },
        where: eq(schema.equipment.Id, input.equipId),
      });

      if (!equipment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, equipment.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return equipment.photos;
    }),
});
