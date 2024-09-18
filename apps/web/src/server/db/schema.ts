import { relations } from "drizzle-orm";
import { boolean, integer, pgTableCreator, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

const createTable = pgTableCreator((name) => `maintrack_${name}`)

export const users = createTable(
    "user",
    {
        Id: text("id")
            .notNull()
            .primaryKey(),
        email: varchar("email", { length: 256 }).notNull(),
        nombre: text("nombre").notNull(),
        rol: varchar("rol", { length: 256 }),
        orgSeleccionada: uuid("orgSeleccionada").references(() => organizaciones.Id, {
            onDelete: 'set null'
        })
    },
);

export const usersRelations = relations(users, ({ one }) => ({
    orgSeleccionada: one(organizaciones, {
        fields: [users.orgSeleccionada],
        references: [organizaciones.Id],
    }),
}));

export const organizaciones = createTable(
    "organizacion",
    {
        Id: uuid("id")
            .notNull()
            .primaryKey()
            .$default(() => crypto.randomUUID()),
        nombre: text("nombre"),
    },
);

export const organizacionesRelations = relations(organizaciones, ({ many }) => ({
    users: many(users),
}));

export const equipos = createTable(
    "equipos",
    {
        Id: uuid("id")
            .notNull()
            .primaryKey()
            .$default(() => crypto.randomUUID()),
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
            .$default(() => crypto.randomUUID()),
        nombreCategoria: text("nombreCategoria").notNull(),
    },
);

export const ots = createTable(
    "ots",
    {
        Id: uuid("id")
            .notNull()
            .primaryKey()
            .$default(() => crypto.randomUUID()),
        isTemplate: boolean("isTemplate").default(false),
        nombre: text("nombre").notNull(),
        tipo: text("tipo").notNull(),
        fecha: timestamp("fecha").defaultNow(),
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
            .$default(() => crypto.randomUUID()),
        idUsuario: uuid("idUsuario").notNull().references(() => users.Id),
        idOT: uuid("idOT").notNull().references(() => ots.Id),
        fechaLimite: timestamp("fecha").notNull(),
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
