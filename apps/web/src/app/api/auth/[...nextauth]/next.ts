import { verify } from "argon2";
import { eq } from "drizzle-orm";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "~/env";
import { db, schema } from "~/server/db";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    /* GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }), */
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "juan@ejemplo.com",
        },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials /*, request */) => {
        const creds = await loginSchema.parseAsync(credentials);

        const user = await db.query.users.findFirst({
          where: eq(schema.users.email, creds.email),
        });

        if (!user) {
          return null;
        }

        const isValidPassword = await verify(user.hash, creds.password);
        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.Id,
          email: user.email,
          name: user.Id, // uso el name para almacenar el id
          user,
        };
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
};
