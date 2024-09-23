import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { hash, verify } from "argon2";
import { nanoid } from "nanoid";
import { getUserSelf } from "~/server/utils/other";

export const authLoginSchema = z.object({
    email: z.string().min(6).max(1024).email(),
    password: z.string().min(8).max(1024)
});

export const authSignupSchema = z.object({
    username: z.string().min(3).max(1024),
    email: z.string().min(6).max(1024).email(),
    password: z.string().min(8).max(1024)
});

export const authRouter = createTRPCRouter({
    signUp: publicProcedure
        .input(authSignupSchema)    
        .mutation(async ({ input, ctx }) => {
            const { username, email, password } = input;

            const exists = await db.query.users.findFirst({
                where: eq(schema.users.email, email),
            });

            if (exists) {
                throw new TRPCError({
                    code: "CONFLICT",
                });
            }

            const hashedPassword = await hash(password);
            const user = await db.insert(schema.users)
                .values({
                    email,
                    hash: hashedPassword,
                    username,
                    Id: nanoid()
                })
                .returning();

            if (user.length === 0 || !user[0]) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                });
            }

            return getUserSelf(user[0]);
        }),
});