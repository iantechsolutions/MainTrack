import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userInOrg } from "~/server/utils/organization";
import { TRPCError } from "@trpc/server";
import { db, schema } from "~/server/db";
import { and, eq, ilike } from "drizzle-orm";
import { UserRoles } from "~/server/utils/roles";
import { ilikeSanitizedContains } from "~/server/utils/ilike";

export const eqTypeCreateSchema = z.object({
    name: z.string().min(1).max(1023),
    description: z.string().min(0).max(4096),
    orgId: z.string().min(1).max(1024),
});

export const eqTypeListSchema = z.object({
    orgId: z.string().min(1).max(1023),
    nameLike: z.string().min(1).max(1023),
});

export const eqTypeRouter = createTRPCRouter({
    create: protectedProcedure
        .input(eqTypeCreateSchema)
        .mutation(async ({ ctx, input }) => {
            const selfId = ctx.session.user.id;
            const userOrgEntry = await userInOrg(selfId, input.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({code: 'FORBIDDEN'});
            } */

            const res = await db.insert(schema.equipmentCategories)
                .values({
                    description: input.description,
                    name: input.name,
                    orgId: userOrgEntry.orgId,
                })
                .returning();
            
            if (res.length < 1 || !res[0]) {
                throw new TRPCError({code: 'INTERNAL_SERVER_ERROR'});
            }

            return res[0];
        }),
    delete: protectedProcedure
        .input(z.object({
            id: z.string().min(1).max(1023),
        }))
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            const eqType = await db.query.equipmentCategories.findFirst({
                where: eq(schema.equipmentCategories.Id, input.id),
            });

            if (!eqType) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            const userOrgEntry = await userInOrg(selfId, eqType.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }
        
            if (userOrgEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({code: 'FORBIDDEN'});
            }

            await db.delete(schema.equipmentCategories)
                .where(eq(schema.equipmentCategories.Id, eqType.Id));

            return "ok";
        }),
    list: protectedProcedure
        .input(z.object({
            orgId: z.string().min(1).max(1023),
        }))
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            const userOrgEntry = await userInOrg(selfId, input.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            const eqTypes = await db.query.equipmentCategories.findMany({
                where: eq(schema.equipmentCategories.orgId, userOrgEntry.orgId),
            });

            return eqTypes;
        }),
    listFiltered: protectedProcedure
        .input(eqTypeListSchema)
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            const userOrgEntry = await userInOrg(selfId, input.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            const docTypes = await db.query.equipmentCategories.findMany({
                where: and(
                    eq(schema.equipmentCategories.Id, userOrgEntry.orgId),
                    ilike(schema.equipmentCategories.name, ilikeSanitizedContains(input.nameLike))
                )
            });

            return docTypes;
        }),
});