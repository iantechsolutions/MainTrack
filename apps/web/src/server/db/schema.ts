import { pgTableCreator } from "drizzle-orm/pg-core";

const createTable = pgTableCreator((name) => `maintrack_${name}`)

// export const tabla = createTable(...);