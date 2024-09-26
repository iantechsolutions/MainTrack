import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { getUserSelf } from "~/server/utils/other";

export const editSelfSchema = z.object({
  username: z.string().min(0).max(1024),
});

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const selfId = ctx.session.user.id;
    const user = await db.query.users.findFirst({
      where: eq(schema.users.Id, selfId),
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return getUserSelf(user);
  }),
  editSelf: protectedProcedure.input(editSelfSchema).mutation(async ({ input, ctx }) => {
    const selfId = ctx.session.user.id;
    const user = await db.query.users.findFirst({
      where: eq(schema.users.Id, selfId),
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const res = await db
      .update(schema.users)
      .set({
        username: input.username,
      })
      .where(eq(schema.users.Id, user.Id))
      .returning();

    if (res.length < 1 || !res[0]) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return getUserSelf(res[0]);
  }),
  // el list de usuarios lo hice dependiente de la org (ver org_router)
});
