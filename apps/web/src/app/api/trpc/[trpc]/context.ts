import { getServerSession } from "next-auth";
import { nextAuthOptions } from "../../auth/[...nextauth]/next";
import { NextRequest } from "next/server";
import { db } from "~/server/db";

export const createContext = async (req: NextRequest) => {
    const session = await getServerSession(nextAuthOptions);
    return {
        db,
        session,
        headers: req.headers,
    };
};
