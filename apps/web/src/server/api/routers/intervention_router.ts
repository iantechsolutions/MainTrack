import { and, eq, InferSelectModel } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { userInOrg } from "~/server/utils/organization";
import { IntStatusEnum } from "~/server/utils/intervention_status";

export const intervSetStatusSchema = z.object({
  intId: z.string().min(1).max(1023),
  state: z.enum(IntStatusEnum)
});

export const intervEditSchema = z.object({
  intId: z.string().min(1).max(1023),
  asignadoUserId: z.string().min(1).max(1023).nullable(),
  limitDate: z.date().min(new Date()).nullable()
});

export const interventionsRouter = createTRPCRouter({
  // el list de intervenciones por OT es con ots.get
  list: protectedProcedure
    .input(z.object({
      orgId: z.string().min(1).max(1023)
    }))
    .query(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const userOrgEntry = await userInOrg(selfId, input.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const interventions = await db.query.interventions.findMany({
        where: eq(schema.interventions.orgId, userOrgEntry.orgId)
      });

      return interventions;
    }),
  get: protectedProcedure
    .input(z.object({
      intId: z.string().min(1).max(1023)
    }))
    .query(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const interv = await db.query.interventions.findFirst({
        where: eq(schema.interventions.Id, input.intId),
      });

      if (!interv) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, interv.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return interv;
    }),
  setStatus: protectedProcedure
    .input(intervSetStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const interv = await db.query.interventions.findFirst({
        where: eq(schema.interventions.Id, input.intId),
      });

      if (!interv) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, interv.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // TODO: if interv.state ya es X, no poder cambiarlo a Y

      const res = await db.update(schema.interventions)
        .set({
          status: input.state
        })
        .where(eq(schema.interventions.Id, input.intId))
        .returning();
      
      if (res.length < 1 || !res[0]) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      return res[0];
    }),
  edit: protectedProcedure
    .input(intervEditSchema)
    .mutation(async ({ ctx, input }) => {
      const selfId = ctx.session.user.id;
      const interv = await db.query.interventions.findFirst({
        where: eq(schema.interventions.Id, input.intId),
      });

      if (!interv) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userOrgEntry = await userInOrg(selfId, interv.orgId);
      if (!userOrgEntry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      let asignado: InferSelectModel<typeof schema.usuariosOrganizaciones> | null = null;
      if (typeof input.asignadoUserId === 'string') {
        asignado = await db.query.usuariosOrganizaciones.findFirst({
          where: and(
            eq(schema.usuariosOrganizaciones.orgId, userOrgEntry.orgId),
            eq(schema.usuariosOrganizaciones.userId, input.asignadoUserId),
          )
        }) ?? null;

        if (asignado === null) {
          throw new TRPCError({ code: "NOT_FOUND", message: 'target asignado not found' });
        }
      }

      const res = await db.update(schema.interventions)
        .set({
          userId: asignado?.userId ?? interv.userId,
          limitDate: input.limitDate ?? interv.limitDate
        })
        .where(eq(schema.interventions.Id, input.intId))
        .returning();
      
      if (res.length < 1 || !res[0]) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      return res[0];
    })
});
