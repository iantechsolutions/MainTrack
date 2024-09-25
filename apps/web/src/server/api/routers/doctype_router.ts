import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { DocCorrelatedWithEnum } from "~/server/utils/doc_types_correlation";
import { db, schema } from "~/server/db";
import { userInOrg, userSelectedOrg } from "~/server/utils/organization";
import { TRPCError } from "@trpc/server";
import { UserRoles } from "~/server/utils/roles";
import { and, eq, ilike } from "drizzle-orm";

export const docTypeCreateSchema = z.object({
    typeName: z.string().min(1).max(1023),
    description: z.string().min(1).max(1023),
    correlatedWith: z.enum(DocCorrelatedWithEnum),
    orgId: z.string().min(1).max(1023),
});

export const docTypeListSchema = z.object({
    orgId: z.string().min(1).max(1023),
    nameLike: z.string().min(1).max(1023),
});

export const docTypeRouter = createTRPCRouter({
    create: protectedProcedure
        .input(docTypeCreateSchema)
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            const userOrgEntry = await userInOrg(selfId, input.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            /* if (userOrgEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({code: 'FORBIDDEN'});
            } */

            const res = await db.insert(schema.documentTypes)
                .values({
                    correlatedWith: input.correlatedWith, // enum chequeado por zod
                    description: input.description,
                    orgId: userOrgEntry.orgId,
                    typeName: input.typeName,
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
            const docType = await db.query.documentTypes.findFirst({
                where: eq(schema.documentTypes.Id, input.id),
            });

            if (!docType) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            const userOrgEntry = await userInOrg(selfId, docType.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }
        
            if (userOrgEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({code: 'FORBIDDEN'});
            }

            await db.delete(schema.documentTypes)
                .where(eq(schema.documentTypes.Id, docType.Id));

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

            const docTypes = await db.query.documentTypes.findMany({
                where: eq(schema.documentTypes.Id, userOrgEntry.orgId),
            });

            return docTypes;
        }),
    listFiltered: protectedProcedure
        .input(docTypeListSchema)
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            const userOrgEntry = await userInOrg(selfId, input.orgId);
            if (!userOrgEntry) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            const ilikeQuery = `%${input.nameLike.replace('%', '').replace('_', '')}%`;
            const docTypes = await db.query.documentTypes.findMany({
                where: and(
                    eq(schema.documentTypes.Id, userOrgEntry.orgId),
                    ilike(schema.documentTypes.typeName, ilikeQuery)
                )
            });

            return docTypes;
        }),
});
