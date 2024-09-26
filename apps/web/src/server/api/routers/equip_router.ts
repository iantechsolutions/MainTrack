import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { userInOrg } from "~/server/utils/organization";
import { db, schema } from "~/server/db";
import { and, eq, ilike, SQLWrapper } from "drizzle-orm";
import { EquipmentStatus, EquipmentStatusEnum } from "~/server/utils/equipment_status";
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
        lon: z.number()
    }),
    categoryId: z.string().min(1).max(1023),
    status: z.enum(EquipmentStatusEnum)
});

export const equipEditStatusSchema = z.object({
    id: z.string().min(1).max(1023),
    status: z.enum(EquipmentStatusEnum)
});

export const equipEditLocationSchema = z.object({
    id: z.string().min(1).max(1023),
    location: z.object({
        lat: z.number(),
        lon: z.number()
    }),
});

export const equipRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({
            equipId: z.string().min(1).max(1023)
        }))
        .query(async ({ ctx, input }) => {
            const selfId = ctx.session.user.id;
            const equip = await db.query.equipment.findFirst({
                where: eq(schema.equipment.Id, input.equipId),
            });

            if (!equip) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            const userOrgEntry = await userInOrg(selfId, equip.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            return equip;
        }),
    list: protectedProcedure
        .input(z.object({
            orgId: z.string().min(1).max(1023)
        }))
        .query(async ({ ctx, input }) => {
            const selfId = ctx.session.user.id;
            const userOrgEntry = await userInOrg(selfId, input.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            const eqTypes = await db.query.equipment.findMany({
                where: eq(schema.equipment.orgId, userOrgEntry.orgId),
            });

            return eqTypes;
        }),
    listFiltered: protectedProcedure
        .input(equipListSchema)
        .query(async ({ ctx, input }) => {
            const selfId = ctx.session.user.id;
            const userOrgEntry = await userInOrg(selfId, input.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
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
                where: and(...conditions)
            });
        }),
    delete: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const selfId = ctx.session.user.id;
            const equipment = await db.query.equipment.findFirst({
                where: eq(schema.equipment.Id, input.id),
            });

            if (!equipment) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            const userOrgEntry = await userInOrg(selfId, equipment.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }
        
            if (userOrgEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({code: 'FORBIDDEN'});
            }

            await db.delete(schema.equipment)
                .where(eq(schema.equipment.Id, equipment.Id));

            return "ok";
        }),
    create: protectedProcedure
        .input(equipCreateSchema)
        .mutation(async ({ ctx, input }) => {
            const selfId = ctx.session.user.id;
            const userOrgEntry = await userInOrg(selfId, input.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({code: 'FORBIDDEN'});
            } */

            const category = await db.query.equipmentCategories.findFirst({
                where: and(
                    eq(schema.equipmentCategories.Id, input.categoryId),
                    eq(schema.equipmentCategories.orgId, userOrgEntry.orgId)
                )
            });

            if (!category) {
                throw new TRPCError({code: 'BAD_REQUEST'});
            }

            const res = await db.insert(schema.equipment)
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
                throw new TRPCError({code: 'INTERNAL_SERVER_ERROR'});
            }

            return res[0];
        }),
    editStatus: protectedProcedure
        .input(equipEditStatusSchema)
        .mutation(async ({ ctx, input }) => {
            const selfId = ctx.session.user.id;
            const equipment = await db.query.equipment.findFirst({
                where: eq(schema.equipment.Id, input.id),
            });

            if (!equipment) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            const userOrgEntry = await userInOrg(selfId, equipment.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }
        
            /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({code: 'FORBIDDEN'});
            } */

            const res = await db.update(schema.equipment)
                .set({
                    status: input.status
                })
                .where(eq(schema.equipment.Id, equipment.Id))
                .returning();

            if (res.length < 1 || !res[0]) {
                throw new TRPCError({code: 'INTERNAL_SERVER_ERROR'});
            }

            return res[0];
        }),
    editLoc: protectedProcedure
        .input(equipEditLocationSchema)
        .mutation(async ({ ctx, input }) => {
            const selfId = ctx.session.user.id;
            const equipment = await db.query.equipment.findFirst({
                where: eq(schema.equipment.Id, input.id),
            });

            if (!equipment) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            const userOrgEntry = await userInOrg(selfId, equipment.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }
        
            /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({code: 'FORBIDDEN'});
            } */

            const res = await db.update(schema.equipment)
                .set({
                    locationLat: input.location.lat,
                    locationLon: input.location.lon,
                })
                .where(eq(schema.equipment.Id, equipment.Id))
                .returning();

            if (res.length < 1 || !res[0]) {
                throw new TRPCError({code: 'INTERNAL_SERVER_ERROR'});
            }

            return res[0];
        }),
});
