import { and, eq, InferSelectModel } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { userInOrg } from "~/server/utils/organization";
import { OtTypeEnum } from "~/server/utils/ot_types";
import { UserRoles } from "~/server/utils/roles";
import { IntStatus } from "~/server/utils/intervention_status";

// varios campos se heredan del template
export const otCreateSchema = z.object({
  fromTemplate: z.string().min(1).max(1023).nullable(),
  // si no es null, es template
  templateEqType: z.string().min(1).max(1023).nullable(),
  equipoId: z.string().min(1).max(1023).nullable(),
  name: z.string().min(1).max(1023),
  type: z.enum(OtTypeEnum),
  daysLimit: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
  daysPeriod: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER).nullable(),
  orgId: z.string().min(1).max(1023),
  interventionUserId: z.string().min(1).max(1023).nullable(),
});

export const otEditSchema = z.object({
  id: z.string().min(1).max(1023),
  name: z.string().min(1).max(1023),
  daysLimit: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
  daysPeriod: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER).nullable(),
});

export const otsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        Id: z.string().min(1).max(1023),
      }),
    )
    .query(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const ot = await db.query.ots.findFirst({
        with: {
          interventions: true,
          templateId: true,
        },
        where: eq(schema.ots.Id, input.Id),
      });

      if (!ot) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, ot.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ot;
    }),
  listOrg: protectedProcedure.input(z.object({ orgId: z.string().min(1).max(1023) })).query(async ({ ctx, input }) => {
    const selfId = ctx.session.user.id;
    const userOrgEntry = await userInOrg(selfId, input.orgId);
    if (!userOrgEntry) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const ots = await db.query.ots.findMany({
      with: {
        templateId: true,
      },
      where: eq(schema.ots.orgId, userOrgEntry.orgId),
    });

    return ots;
  }),
  listEqType: protectedProcedure
    .input(
      z.object({
        eqTypeId: z.string().min(1).max(1023),
      }),
    )
    .query(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const eqType = await db.query.equipmentCategories.findFirst({
        with: {
          ots: {
            with: {
              templateId: true,
            },
          },
        },
        where: eq(schema.equipmentCategories.Id, input.eqTypeId),
      });

      if (!eqType) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, eqType.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return eqType.ots;
    }),
  listEquipo: protectedProcedure
    .input(
      z.object({
        equipId: z.string().min(1).max(1023),
      }),
    )
    .query(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const equip = await db.query.equipment.findFirst({
        with: {
          ots: {
            with: {
              templateId: true,
            },
          },
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

      return equip.ots;
    }),
  create: protectedProcedure.input(otCreateSchema).mutation(async ({ ctx, input }) => {
    const selfId = ctx.session.user.id;
    const userOrgEntry = await userInOrg(selfId, input.orgId);

    let template: InferSelectModel<typeof schema.ots> | null = null;
    let equipo: InferSelectModel<typeof schema.equipment> | null = null;
    let eqType: InferSelectModel<typeof schema.equipmentCategories> | null = null;

    if (!userOrgEntry) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No userOrgEntry" });
    }

    if (typeof input.fromTemplate === "string" && typeof input.templateEqType === "string") {
      throw new TRPCError({ code: "BAD_REQUEST" });
    } else if (typeof input.fromTemplate === "string" && typeof input.equipoId !== "string") {
      throw new TRPCError({ code: "BAD_REQUEST" });
    } else if (typeof input.templateEqType === "string" && typeof input.equipoId === "string") {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    // no es template, usa template
    if (typeof input.fromTemplate === "string") {
      template =
        (await db.query.ots.findFirst({
          where: eq(schema.ots.Id, input.fromTemplate),
        })) ?? null;

      if (template === null) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      input.templateEqType = null;
      if (template.orgId !== userOrgEntry.orgId || !template.isTemplate) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
    } else if (typeof input.templateEqType === "string") {
      // es template
      eqType =
        (await db.query.equipmentCategories.findFirst({
          where: eq(schema.equipmentCategories.Id, input.templateEqType),
        })) ?? null;

      if (eqType === null) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (eqType.orgId !== userOrgEntry.orgId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
    } // else no es template ni usa template

    const isTemplate = eqType !== null;
    if (typeof input.equipoId === "string") {
      if (isTemplate) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      equipo =
        (await db.query.equipment.findFirst({
          where: eq(schema.equipment.Id, input.equipoId),
        })) ?? null;

      if (equipo === null) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (equipo.orgId !== userOrgEntry.orgId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
    } else if (!isTemplate) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    let userIntOrgEntry: null | InferSelectModel<typeof schema.usuariosOrganizaciones> = null;
    if (!isTemplate) {
      if (typeof input.interventionUserId !== "string") {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      userIntOrgEntry = (await userInOrg(input.interventionUserId, input.orgId)) ?? null;
      if (!userIntOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No userIntOrgEntry" });
      }
    }

    const res = await db
      .insert(schema.ots)
      .values({
        daysLimit: template?.daysLimit ?? input.daysLimit,
        name: template?.name ?? input.name,
        orgId: userOrgEntry.orgId,
        otType: template?.otType ?? input.type,
        daysPeriod: template?.daysPeriod ?? input.daysPeriod,
        equipoId: equipo?.Id,
        isTemplate,
        templateId: template?.Id,
        tipoEquipoId: eqType?.Id,
        date: new Date(),
      })
      .returning();

    if (res.length < 1 || !res[0]) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    const ot = res[0];
    let intervention: null | InferSelectModel<typeof schema.interventions> = null;

    if (userIntOrgEntry !== null) {
      try {
        const intDate = new Date();
        intDate.setDate(intDate.getDate() + ot.daysLimit);

        const interventions = await db
          .insert(schema.interventions)
          .values({
            otId: ot.Id,
            orgId: ot.orgId,
            userId: userIntOrgEntry.userId,
            status: IntStatus.Pending,
            limitDate: intDate,
          })
          .returning();

        // si, esto cae en el catch
        if (interventions.length < 1 || !interventions[0]) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "failed to insert interv" });
        }

        intervention = interventions[0];
      } catch (e) {
        console.error("inserting intervention failed (ot create):", e);
        await db.delete(schema.ots).where(eq(schema.ots.Id, ot.Id));
      }
    }

    if (template !== null) {
      await db
        .update(schema.ots)
        .set({
          templateLastUsed: new Date(),
        })
        .where(eq(schema.ots.Id, template.Id));
    }

    return {
      ot: res[0],
      intervention,
    };
  }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const ot = await db.query.ots.findFirst({
        where: eq(schema.ots.Id, input.id),
      });

      if (!ot) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, ot.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (userOrgEntry.rol !== UserRoles.orgAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const interventions = await db.query.interventions.findMany({
        where: and(eq(schema.interventions.orgId, ot.orgId), eq(schema.interventions.otId, ot.Id)),
      });

      for (const interv of interventions) {
        if (interv.status !== IntStatus.Pending) {
          throw new TRPCError({ code: "CONFLICT" });
        }
      }

      if (ot.isTemplate) {
        await db.transaction(async (tx) => {
          await tx.delete(schema.interventions).where(and(eq(schema.interventions.orgId, ot.orgId), eq(schema.interventions.otId, ot.Id)));
          await tx.delete(schema.ots).where(and(eq(schema.ots.orgId, ot.orgId), eq(schema.ots.templateId, ot.Id)));
          await tx.delete(schema.ots).where(eq(schema.ots.Id, ot.Id));
        });
      } else {
        await db.transaction(async (tx) => {
          await tx.delete(schema.interventions).where(and(eq(schema.interventions.orgId, ot.orgId), eq(schema.interventions.otId, ot.Id)));
          await tx.delete(schema.ots).where(eq(schema.ots.Id, ot.Id));
        });
      }

      return "ok";
    }),
  edit: protectedProcedure.input(otEditSchema).mutation(async ({ ctx, input }) => {
    const selfId = ctx.session.user.id;
    const ot = await db.query.ots.findFirst({
      where: eq(schema.ots.Id, input.id),
    });

    if (!ot) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const userOrgEntry = await userInOrg(selfId, ot.orgId);
    if (!userOrgEntry) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (userOrgEntry.rol !== UserRoles.orgAdmin) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const res = await db
      .update(schema.ots)
      .set({
        daysLimit: input.daysLimit ?? ot.daysLimit,
        daysPeriod: input.daysPeriod ?? ot.daysPeriod,
        name: input.name ?? ot.name,
      })
      .where(eq(schema.ots.Id, ot.Id))
      .returning();

    if (res.length < 1 || !res[0]) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return res[0];
  }),
});
