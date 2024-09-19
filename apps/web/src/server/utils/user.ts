import { clerkClient } from "@clerk/nextjs/server";
import type { User } from '@clerk/backend';
import { db, schema } from "../db";
import { eq, InferSelectModel } from "drizzle-orm";

export type UserMulti = {
    clerkUser: User,
    user: InferSelectModel<typeof schema.users>
};

export const getUser = async (id: string): Promise<UserMulti | null> => {
    const clerkUser = await clerkClient.users.getUser(id);
    let user = await db.query.users.findFirst({
        where: eq(schema.users.Id, id)
    });

    if (!clerkUser) {
        return null;
    }

    if (!user && !clerkUser) {
        return null;
    } else if (!user) {
        user = (await db.insert(schema.users).values({
            Id: clerkUser.id,
        }).returning())[0];

        if (!user) {
            console.error('getUser db.insert !user');
            return null;
        }
    }

    return {
        clerkUser,
        user
    }
}

export const getUserByEmail = async (email: string): Promise<UserMulti | null> => {
    const users = await clerkClient.users.getUserList({
        emailAddress: [email]
    });

    const clerkUser = users.data.at(0);
    if (!clerkUser) {
        return null;
    }

    let user = await db.query.users.findFirst({
        where: eq(schema.users.Id, clerkUser.id)
    });

    if (!user && !clerkUser) {
        return null;
    } else if (!user) {
        user = (await db.insert(schema.users).values({
            Id: clerkUser.id,
        }).returning())[0];

        if (!user) {
            console.error('getUser db.insert !user');
            return null;
        }
    }

    return {
        clerkUser,
        user
    }
}