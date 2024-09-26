import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getUserPublic } from "~/server/utils/other";
import { UserRoles, UserRolesEnum } from "~/server/utils/roles";
import jwt from 'jsonwebtoken';
import { env } from "~/env";

export const schemaOrgSetRole = z.object({
    userId: z.string(),
    orgId: z.string(),
    role: z.enum(UserRolesEnum)
});

export const schemaOrgInvite = z.object({
    userId: z.string().optional(),
    userEmail: z.string().optional(),
    orgId: z.string(),
});

export const schemaOrgPatch = z.object({
    name: z.string().min(1).max(1024),
    orgId: z.string(),
});

export const schemaOrgPut = z.object({
    name: z.string().min(1).max(1024),
    // seleccionar: z.boolean().default(false),
});

export const orgRouter = createTRPCRouter({
    create: protectedProcedure
        .input(schemaOrgPut)
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;

            let selfUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });

            if (!selfUser) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            let orgs = await db.insert(schema.organizaciones)
                .values({
                    nombre: input.name
                })
                .returning();
            console.log(orgs);
            if (orgs.length < 1) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
            }

            let org = orgs[0];
            // redundante pero el linter se queja
            if (!org) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
            }

            let userOrg = await db.insert(schema.usuariosOrganizaciones)
                .values({
                    orgId: org.Id,
                    userId: selfUser.Id,
                    rol: UserRoles.orgAdmin
                })
                .returning();

            // raro que pase pero si pasa deshago todo
            if (userOrg.length < 1) {
                await db.delete(schema.organizaciones)
                    .where(eq(schema.organizaciones.Id, org.Id));
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
            }

            // if (input.seleccionar) {
                await db.update(schema.users)
                    .set({
                        orgSel: org.Id,
                    })
                    .where(eq(schema.users.Id, selfUser.Id));
            // }

            return org;
        }),
    edit: protectedProcedure
        .input(schemaOrgPatch)
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            const { orgId } = input;

            let selfUserB = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });
            if (!selfUserB) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            let org = await db.query.organizaciones.findFirst({
                where: eq(schema.organizaciones.Id, orgId)
            });

            if (!org) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            let orgUserEntry = await db.query.usuariosOrganizaciones.findFirst({
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, org.Id),
                    eq(schema.usuariosOrganizaciones.userId, selfId)
                )
            });

            if (!orgUserEntry) {
                throw new TRPCError({ code: "NOT_FOUND" });
            } else if (orgUserEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return await db.update(schema.organizaciones)
                .set({
                    nombre: input.name
                })
                .where(eq(schema.organizaciones.Id, org.Id))
                .returning();
        }),
    delete: protectedProcedure
        .input(z.object({
            orgId: z.string()
        }))
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            const { orgId } = input;

            let selfUserB = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });

            if (!selfUserB) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            let org = await db.query.organizaciones.findFirst({
                with: {
                    usuariosOrganizaciones: true,
                },
                where: eq(schema.organizaciones.Id, orgId)
            });

            if (!org) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            let adminCount = 0;
            for (let usuarioRol of org.usuariosOrganizaciones.map(v => v.rol)) {
                if (usuarioRol === UserRoles.orgAdmin) {
                    adminCount++;
                }
            }

            if (adminCount > 1) {
                throw new TRPCError({ code: 'CONFLICT', message: 'Many admins left' });
            }

            let orgUserEntry = await db.query.usuariosOrganizaciones.findFirst({
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, org.Id),
                    eq(schema.usuariosOrganizaciones.userId, selfId)
                )
            });

            if (!orgUserEntry) {
                throw new TRPCError({ code: "NOT_FOUND" });
            } else if (orgUserEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            let orgUserEntries = await db.query.usuariosOrganizaciones.findMany({
                with: {
                    user: true
                },
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, org.Id),
                )
            });

            // saca a todos los usuarios
            await db.delete(schema.usuariosOrganizaciones)
                .where(eq(schema.usuariosOrganizaciones.orgId, org.Id));

            // esto no necesita recorrer la tabla entera
            // cosa que un update para todos los orgSel === org.Id sí haría
            for (let orgUser of orgUserEntries) {
                if (orgUser.user.orgSel === org.Id) {
                    await db.update(schema.users)
                        .set({
                            orgSel: null
                        })
                        .where(eq(schema.users.Id, orgUser.userId));
                }
            }

            // borra la org
            await db.transaction(async (tx) => {
                await tx.delete(schema.usuariosOrganizaciones)
                    .where(eq(schema.usuariosOrganizaciones.orgId, org.Id));
                await tx.delete(schema.equipmentCategories)
                    .where(eq(schema.equipmentCategories.orgId, org.Id));
                await tx.delete(schema.equipmentPhotos)
                    .where(eq(schema.equipmentPhotos.orgId, org.Id));
                await tx.delete(schema.equipment)
                    .where(eq(schema.equipment.orgId, org.Id));
                await tx.delete(schema.documentTypes)
                    .where(eq(schema.documentTypes.orgId, org.Id));
                await tx.delete(schema.documents)
                    .where(eq(schema.documents.orgId, org.Id));
                await tx.delete(schema.ots)
                    .where(eq(schema.ots.orgId, org.Id));
                await tx.delete(schema.interventions)
                    .where(eq(schema.interventions.orgId, org.Id));
                await tx.delete(schema.organizaciones)
                    .where(eq(schema.organizaciones.Id, org.Id));
            });

            return "ok";
        }),
    get: protectedProcedure
        .input(z.object({
            orgId: z.string()
        }))
        .query(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            const { orgId } = input;

            let selfUserB = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });
            if (!selfUserB) {
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
            let selfUserB = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });
            if (!selfUserB) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            let orgs = await db.query.usuariosOrganizaciones.findMany({
                with: {
                    organizacion: {
                        with: {
                            usuariosOrganizaciones: {
                                with: {
                                    user: true
                                }
                            }
                        }
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
            let selfUserB = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });
            if (!selfUserB) {
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
            });

            let usersDetailed = [];
            for (let user of orgUsers) {
                usersDetailed.push({
                    profile: await db.query.users.findFirst({
                        where: eq(schema.users.Id, user.userId)
                    }),
                    orgUser: user
                });
            }
    
            return usersDetailed.map((entry) => entry.profile ? {
                profile: getUserPublic(entry.profile),
                orgUser: entry.orgUser
            } : null);
        }),
    inviteUser: protectedProcedure
        .input(schemaOrgInvite)
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
                const user = await db.query.users.findFirst({
                    where: eq(schema.users.email, input.userEmail)
                });

                if (!user) {
                    throw new TRPCError({ code: "BAD_REQUEST" });
                }

                userId = user.Id;
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

            let token = jwt.sign({
                orgId: orgSelfEntry.orgId,
                targetUserId: targetUser.Id,
                fromUserId: selfUser.Id
            }, env.JWT_INVITE_KEY, {
                algorithm: 'ES256'
            });

            return token;
        }),
    join: protectedProcedure
        .input(
            z.object({
                token: z.string()
            })
        )
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            let selfUserB = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });
            if (!selfUserB) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            let tokenClaims;
            try {
                tokenClaims = jwt.verify(input.token, env.JWT_INVITE_KEY);
            } catch (_) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            if (typeof tokenClaims !== 'object') {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }

            if (typeof tokenClaims.orgId !== 'string' || typeof tokenClaims.targetUserId !== 'string' || typeof tokenClaims.fromUserId !== 'string') {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            if (tokenClaims.targetUserId !== selfId) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            let orgSelfEntry = await db.query.usuariosOrganizaciones.findFirst({
                with: {
                    organizacion: true,
                },
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, tokenClaims.orgId),
                    eq(schema.usuariosOrganizaciones.userId, tokenClaims.fromUserId)
                )
            });

            if (!orgSelfEntry) {
                throw new TRPCError({ code: "NOT_FOUND" });
            } else if (orgSelfEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            let orgUserEntry = await db.query.usuariosOrganizaciones.findFirst({
                with: {
                    user: true
                },
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, tokenClaims.orgId),
                    eq(schema.usuariosOrganizaciones.userId, tokenClaims.targetUserId)
                )
            });

            if (orgUserEntry) {
                throw new TRPCError({ code: "CONFLICT" });
            }

            let targetUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, tokenClaims.targetUserId)
            });

            if (!targetUser) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            await db.insert(schema.usuariosOrganizaciones).values({
                orgId: orgSelfEntry.organizacion.Id,
                userId: targetUser.Id,
                rol: UserRoles.none,
            });

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

            if (otherUser.orgSel === org.Id) {
                await db.update(schema.users).set({
                    orgSel: null
                }).where(eq(schema.users.Id, otherUser.Id));
            }

            return "ok";
        }),
    setRole: protectedProcedure
        .input(schemaOrgSetRole)
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
                throw new TRPCError({ code: "CONFLICT" });
            } else if (orgSelfEntry.rol !== UserRoles.orgAdmin) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return await db.update(schema.usuariosOrganizaciones)
                .set({
                    rol: input.role // validación con zod en el input
                })
                .where(and(
                    eq(schema.usuariosOrganizaciones.orgId, org.Id),
                    eq(schema.usuariosOrganizaciones.userId, otherUser.Id)
                ))
                .returning();
        }),
    select: protectedProcedure
        .input(z.object({
            orgId: z.string()
        }))
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            const { orgId } = input;

            let selfUser = await db.query.users.findFirst({
                where: eq(schema.users.Id, selfId)
            });
            if (!selfUser) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            let org = await db.query.organizaciones.findFirst({
                where: eq(schema.organizaciones.Id, orgId)
            });

            if (!org) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            let orgUserEntry = await db.query.usuariosOrganizaciones.findFirst({
                where: and(
                    eq(schema.usuariosOrganizaciones.orgId, org.Id),
                    eq(schema.usuariosOrganizaciones.userId, selfUser.Id)
                )
            });

            if (!orgUserEntry) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            await db.update(schema.users)
                .set({
                    orgSel: org.Id
                })
                .where(eq(schema.users.Id, selfUser.Id));

            return "ok";
        }),
});