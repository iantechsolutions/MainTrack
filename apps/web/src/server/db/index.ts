import { env } from "~/env";
import * as schema from "./schema";

// import { drizzle } from 'drizzle-orm/neon-http';

// const nqf = neon(env.DATABASE_URL);
// export const db = drizzle(
//   nqf,
//   { schema }
// );

// import postgres from "postgres";
// const queryClient = postgres(env.DATABASE_URL);
// import type { ExtractTablesWithRelations } from "drizzle-orm";
// import type { PgTransaction } from "drizzle-orm/pg-core";
// import {
//   type PostgresJsQueryResultHKT,
//   drizzle,
// } from "drizzle-orm/postgres-js";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN });

export const db = drizzle(client, { schema });

// export const db = drizzle(queryClient, { schema });

// export type TXType = PgTransaction<
//   PostgresJsQueryResultHKT,
//   typeof schema,
//   ExtractTablesWithRelations<typeof schema>
// >;

// export type DBType = typeof db; // PlanetScaleDatabase<typeof schema>
// export type DBTX = DBType | TXType;

export { schema };
