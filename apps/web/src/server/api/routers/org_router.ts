import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getUserPublic } from "~/server/utils/other";
import { UserRoles } from "~/server/utils/roles";

export const orgRouter = createTRPCRouter({
    get: protectedProcedure
        .query(async ({ ctx }) => {
            const selfId = ctx.session.user.id;
            let selfUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });

            if (!selfUser) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            } else if (selfUser.orgSeleccionada === null) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            let org = await db.query.organizaciones.findFirst({
                where: eq(schema.organizaciones.Id, selfUser.orgSeleccionada)
            });
            
            if (!org) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            return org;
        }),
    listUsers: protectedProcedure
        .query(async ({ ctx }) => {
            const selfId = ctx.session.user.id;
            let selfUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });

            if (!selfUser) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            } else if (selfUser.orgSeleccionada === null) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            let org = await db.query.organizaciones.findFirst({
                where: eq(schema.organizaciones.Id, selfUser.orgSeleccionada)
            });
            
            if (!org) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            let usuariosOrg = await db.query.organizaciones.findFirst({
                with: {
                    users: true,
                },
                where: eq(schema.organizaciones.Id, org.Id)
            });

            if (!usuariosOrg) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }
    
            return usuariosOrg.users.map((user) => getUserPublic(user));
        }),
    removeUser: protectedProcedure
        .input(
            z.object({
                userId: z.string()
            })
        )
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;

            let selfUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });

            if (!selfUser) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            } else if (selfUser.orgSeleccionada === null) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            /* if (selfId === input.userId) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            } */
            // Nota: puede sacarse a si mismo si es admin, solo que no puede ser el ultimo admin en salir

            let org = await db.query.organizaciones.findFirst({
                with: {
                    users: true,
                },
                where: eq(schema.organizaciones.Id, selfUser.orgSeleccionada)
            });

            if (!org) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            let otherUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, input.userId)
            });

            if (!otherUser) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            // no hace falta .toLowerCase al comparar estos UUIDs
            if (otherUser.orgSeleccionada !== org.Id) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }
            
            if (otherUser.Id === selfUser.Id) {
                if (selfUser.rol !== UserRoles.orgAdmin) {
                    throw new TRPCError({ code: "FORBIDDEN" });
                }

                let adminCount = 0;
                for (let usuario of org.users) {
                    if (usuario.rol === UserRoles.orgAdmin) {
                        adminCount++;
                    }
                }

                // si es el ultimo admin no puede salir
                if (adminCount <= 1) {
                    throw new TRPCError({ code: "CONFLICT" });
                }
            } else if (otherUser.rol === UserRoles.orgAdmin || selfUser.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            await db.update(schema.users).set({
                orgSeleccionada: null
            }).where(eq(schema.users.Id, otherUser.Id));

            return "ok";
        }),
});