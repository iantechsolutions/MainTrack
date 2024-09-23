import { nanoid } from "nanoid";
import { relations, sql } from "drizzle-orm";
import { int, integer, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

const createTable = sqliteTableCreator((name) => `maintrack_${name}`)

function uuid(name:string) {
    return text(name, { length: 36 });
}

export const users = createTable(
    "user",
    {
        Id: text("id")
            .notNull()
            .primaryKey(),
        username: text("username").notNull(),
        email: text("email").notNull().unique(),
        hash: text("hash").notNull(),
        imageUrl: text("imageUrl"),
        orgSel: uuid("orgSel")
    },
);

export const usersRelations = relations(users, ({ one, many }) => ({
    orgSel: one(organizaciones, {
        fields: [users.orgSel],
        references: [organizaciones.Id],
    }),
    usuariosOrganizaciones: many(usuariosOrganizaciones)
}));

export const usuariosOrganizaciones = createTable(
    "organizacion_usuarios",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.Id),
        rol: text("rol", { length: 256 }),
        orgId: uuid("orgId")
            .notNull()
            .references(() => organizaciones.Id)
    },
);

export const organizaciones = createTable(
    "organizacion",
    {
        Id: uuid("id")
            .notNull()
            .primaryKey()
            .$defaultFn(() => nanoid()),
        nombre: text("nombre"),
    },
);

export const organizacionesRelations = relations(organizaciones, ({ many }) => ({
    usuariosOrganizaciones: many(usuariosOrganizaciones),
}));

export const usuariosOrganizacionesRelations = relations(usuariosOrganizaciones, ({ one }) => ({
    organizacion: one(organizaciones, {
        fields: [usuariosOrganizaciones.orgId],
        references: [organizaciones.Id],
    }),
    user: one(users, {
        fields: [usuariosOrganizaciones.userId],
        references: [users.Id],
    }),
}));

export const equipos = createTable(
    "equipos",
    {
        Id: uuid("id")
            .notNull()
            .primaryKey()
            .$defaultFn(() => nanoid()),
        nombre: text("nombre"),
        codigo: text("codigo"),
        tipoEquipoId: uuid("tipoEquipoId").references(() => tiposEquipos.Id)
    },
);

export const equiposRelations = relations(equipos, ({ one }) => ({
    tipoEquipoId: one(tiposEquipos, {
        fields: [equipos.tipoEquipoId],
        references: [tiposEquipos.Id],
    }),
}));

export const tiposEquipos = createTable(
    "tiposEquipos",
    {
        Id: uuid("id")
            .notNull()
            .primaryKey()
            .$defaultFn(() => nanoid()),
        nombreCategoria: text("nombreCategoria").notNull(),
    },
);

export const ots = createTable(
    "ots",
    {
        Id: uuid("id")
            .notNull()
            .primaryKey()
            .$defaultFn(() => nanoid()),
        isTemplate: int("isTemplate",{mode: "boolean"}).default(false),
        nombre: text("nombre").notNull(),
        tipo: text("tipo").notNull(),
        fecha: int("fecha",{mode:"timestamp"}).default(sql`CURRENT_TIMESTAMP`).notNull(),
        daysLimit: integer("daysLimit").notNull(),
        daysPeriod: integer("daysPeriod"),
        // solo si es template
        tipoEquipoId: uuid("tipoEquipoId").references(() => tiposEquipos.Id)
    },
);

export const otsRelations = relations(ots, ({ one }) => ({
    tipoEquipoId: one(tiposEquipos, {
        fields: [ots.tipoEquipoId],
        references: [tiposEquipos.Id],
    }),
}));

export const tipoEquiposRelations = relations(tiposEquipos, ({ many }) => ({
    ots: many(ots),
}));

export const intervenciones = createTable(
    "intervenciones",
    {
        Id: uuid("id")
            .notNull()
            .primaryKey()
            .$defaultFn(() => nanoid()),
        idUsuario: uuid("idUsuario").notNull().references(() => users.Id),
        idOT: uuid("idOT").notNull().references(() => ots.Id),
        fechaLimite: int("fecha",{mode:"timestamp"}).default(sql`CURRENT_TIMESTAMP`).notNull(),
        status: text("status"),
    },
);

export const intervencionesRelations = relations(intervenciones, ({ one }) => ({
    idOT: one(ots, {
        fields: [intervenciones.idOT],
        references: [ots.Id],
    }),
    idUsuario: one(users, {
        fields: [intervenciones.idUsuario],
        references: [users.Id],
    }),
}));
