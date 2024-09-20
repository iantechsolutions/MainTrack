import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getUserPublic } from "~/server/utils/other";
import { UserRoles } from "~/server/utils/roles";
// import jwt from 'jsonwebtoken';
import { env } from "~/env";
import { getUser, getUserByEmail } from "~/server/utils/user";

export const orgRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({
            orgId: z.string()
        }))
        .query(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            const { orgId } = input;

            let selfUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });

            if (!selfUser) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            let orgUserEntry = await db.query.usuariosOrganizaciones.findFirst({
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, orgId),
                    eq(schema.usuariosOrganizaciones.userId, selfId)
                )
            });

            if (!orgUserEntry) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            let org = await db.query.organizaciones.findFirst({
                where: eq(schema.organizaciones.Id, orgId)
            });

            if (!org) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            return org;
        }),
    list: protectedProcedure
        .query(async ({ ctx }) => {
            const selfId = ctx.session.user.id;
            let selfUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });

            if (!selfUser) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            let orgs = await db.query.usuariosOrganizaciones.findMany({
                with: {
                    organizacion: {
                        
                    }
                },
                where: eq(schema.usuariosOrganizaciones.userId, selfId)
            });

            return orgs.map((v) => v.organizacion);
        }),
    listUsers: protectedProcedure
        .input(z.object({
            orgId: z.string()
        }))
        .query(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            let selfUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });

            if (!selfUser) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            let orgUserEntry = await db.query.usuariosOrganizaciones.findFirst({
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, input.orgId),
                    eq(schema.usuariosOrganizaciones.userId, selfId)
                )
            });

            if (!orgUserEntry) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            let orgUsers = await db.query.usuariosOrganizaciones.findMany({
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, input.orgId),
                ),
                with: {
                    user: true
                }
            });

            let usersDetailed = [];
            for (let user of orgUsers) {
                usersDetailed.push(await getUser(user.userId));
            }
    
            return usersDetailed.map((entry) => entry ? getUserPublic(entry) : null);
        }),
    inviteUser: protectedProcedure
        .input(
            z.object({
                userId: z.string().optional(),
                userEmail: z.string().optional(),
                orgId: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;

            let selfUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });

            if (!selfUser) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            let userId;
            if (input.userEmail) {
                const user = await getUserByEmail(input.userEmail);

                if (!user) {
                    throw new TRPCError({ code: "BAD_REQUEST" });
                }

                userId = user.user.Id;
            } else if (input.userId) {
                userId = input.userId;
            } else {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            let orgSelfEntry = await db.query.usuariosOrganizaciones.findFirst({
                with: {
                    organizacion: true,
                },
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, input.orgId),
                    eq(schema.usuariosOrganizaciones.userId, selfId)
                )
            });

            if (!orgSelfEntry) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            let orgUserEntry = await db.query.usuariosOrganizaciones.findFirst({
                with: {
                    user: true
                },
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, input.orgId),
                    eq(schema.usuariosOrganizaciones.userId, userId)
                )
            });

            if (orgUserEntry) {
                throw new TRPCError({ code: "CONFLICT" });
            }

            let targetUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, userId)
            });

            if (!targetUser) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            if (targetUser.Id === selfUser.Id) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            if (orgSelfEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            // let token = jwt.sign({
            //     orgId: orgSelfEntry.orgId,
            //     targetUserId: targetUser.Id,
            //     fromUserId: selfUser.Id
            // }, env.JWT_INVITE_KEY, {
            //     algorithm: 'ES256'
            // });

            return "token";
        }),
    join: protectedProcedure
        .input(
            z.object({
                token: z.string()
            })
        )
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            let selfUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });

            if (!selfUser) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            // let tokenClaims;
            // try {
            //     tokenClaims = jwt.verify(input.token, env.JWT_INVITE_KEY);
            // } catch (_) {
            //     throw new TRPCError({ code: "BAD_REQUEST" });
            // }

            // if (typeof tokenClaims !== 'object') {
            //     throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            // }

            // if (typeof tokenClaims.orgId !== 'string' || typeof tokenClaims.targetUserId !== 'string' || typeof tokenClaims.fromUserId !== 'string') {
            //     throw new TRPCError({ code: "BAD_REQUEST" });
            // }

            // if (tokenClaims.targetUserId !== selfId) {
            //     throw new TRPCError({ code: "BAD_REQUEST" });
            // }

            // let orgSelfEntry = await db.query.usuariosOrganizaciones.findFirst({
            //     with: {
            //         organizacion: true,
            //     },
            //     where: and(
            //         eq(schema.usuariosOrganizaciones.orgId, tokenClaims.orgId),
            //         eq(schema.usuariosOrganizaciones.userId, tokenClaims.fromUserId)
            //     )
            // });

            // if (!orgSelfEntry) {
            //     throw new TRPCError({ code: "NOT_FOUND" });
            // } else if (orgSelfEntry.rol !== UserRoles.orgAdmin) {
            //     throw new TRPCError({ code: "FORBIDDEN" });
            // }

            // let orgUserEntry = await db.query.usuariosOrganizaciones.findFirst({
            //     with: {
            //         user: true
            //     },
            //     where: and(
            //         eq(schema.usuariosOrganizaciones.orgId, tokenClaims.orgId),
            //         eq(schema.usuariosOrganizaciones.userId, tokenClaims.targetUserId)
            //     )
            // });

            // if (orgUserEntry) {
            //     throw new TRPCError({ code: "CONFLICT" });
            // }

            // let targetUser = await db.query.users.findFirst({
            //     where: eq(schema.users.Id, tokenClaims.targetUserId)
            // });

            // if (!targetUser) {
            //     throw new TRPCError({ code: "NOT_FOUND" });
            // }

            // await db.insert(schema.usuariosOrganizaciones).values({
            //     orgId: orgSelfEntry.organizacion.Id,
            //     userId: targetUser.Id,
            //     rol: UserRoles.none,
            // });

            return "ok";
        }),
    removeUser: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                orgId: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            let selfUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });

            if (!selfUser) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            /* if (selfId === input.userId) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            } */
            // Nota: puede sacarse a si mismo si es admin, solo que no puede ser el ultimo admin en salir

            let orgSelfEntry = await db.query.usuariosOrganizaciones.findFirst({
                with: {
                    organizacion: {
                        with: {
                            usuariosOrganizaciones: {
                                with: {
                                    user: true
                                }
                            }
                        }
                    },
                },
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, input.orgId),
                    eq(schema.usuariosOrganizaciones.userId, selfId)
                )
            });

            if (!orgSelfEntry) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            let orgUserEntry = await db.query.usuariosOrganizaciones.findFirst({
                with: {
                    user: true
                },
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, input.orgId),
                    eq(schema.usuariosOrganizaciones.userId, input.userId)
                )
            });

            if (!orgUserEntry) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }
            
            const otherUser = orgUserEntry.user;
            const org = orgSelfEntry.organizacion;

            if (otherUser.Id === selfUser.Id) {
                if (orgSelfEntry.rol !== UserRoles.orgAdmin) {
                    throw new TRPCError({ code: "FORBIDDEN" });
                }

                let adminCount = 0;
                for (let usuarioRol of org.usuariosOrganizaciones.map(v => v.rol)) {
                    if (usuarioRol === UserRoles.orgAdmin) {
                        adminCount++;
                    }
                }

                // si es el ultimo admin no puede salir
                if (adminCount <= 1) {
                    throw new TRPCError({ code: "CONFLICT" });
                }
            } else if (orgUserEntry.rol === UserRoles.orgAdmin || orgSelfEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            await db.delete(schema.usuariosOrganizaciones)
                .where(and(
                    eq(schema.usuariosOrganizaciones.orgId, org.Id),
                    eq(schema.usuariosOrganizaciones.userId, otherUser.Id)
                ));

            if (otherUser.orgSeleccionada === org.Id) {
                await db.update(schema.users).set({
                    orgSeleccionada: undefined
                }).where(eq(schema.users.Id, otherUser.Id));
            }

            return "ok";
        }),
});