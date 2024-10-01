import { nanoid } from "nanoid";
import { relations, sql } from "drizzle-orm";
import { int, integer, real, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

const createTable = sqliteTableCreator((name) => `maintrack_${name}`);

function uuid(name: string) {
  return text(name, { length: 36 });
}

function ts(name: string) {
  return int(name, { mode: "timestamp" });
}

export const users = createTable("user", {
  Id: text("id").notNull().primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  hash: text("hash").notNull(),
  imageUrl: text("imageUrl"),
  orgSel: uuid("orgSel"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  orgSel: one(organizaciones, {
    fields: [users.orgSel],
    references: [organizaciones.Id],
  }),
  usuariosOrganizaciones: many(usuariosOrganizaciones),
}));

export const usuariosOrganizaciones = createTable("organizacion_usuarios", {
  userId: text("userId")
    .notNull()
    .references(() => users.Id),
  rol: text("rol", { length: 256 }),
  orgId: uuid("orgId")
    .notNull()
    .references(() => organizaciones.Id),
});

export const organizaciones = createTable("organizacion", {
  Id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  nombre: text("nombre"),
});

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

export const equipment = createTable("equipment", {
  Id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  model: text("model").notNull(),
  manufacturer: text("manufacturer").notNull(),
  serial: text("serial"),
  purchaseDate: ts("purchaseDate"),
  warrantyExpiration: ts("warrantyExpiration"),
  locationLat: real("locationLon").notNull(),
  locationLon: real("locationLat").notNull(),
  status: text("status").notNull(),
  createdAt: ts("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  categoryId: uuid("categoryId")
    .notNull()
    .references(() => equipmentCategories.Id),
  orgId: uuid("orgId")
    .notNull()
    .references(() => organizaciones.Id),
});

export const equiposRelations = relations(equipment, ({ one, many }) => ({
  categoryId: one(equipmentCategories, {
    fields: [equipment.categoryId],
    references: [equipmentCategories.Id],
  }),
  orgId: one(organizaciones, {
    fields: [equipment.orgId],
    references: [organizaciones.Id],
  }),
  photos: many(equipmentPhotos),
  ots: many(ots),
  documents: many(documents),
}));

export const equipmentCategories = createTable("equipmentCategories", {
  Id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  orgId: uuid("orgId")
    .notNull()
    .references(() => organizaciones.Id),
});

export const equipmentCategoriesRelations = relations(equipmentCategories, ({ one, many }) => ({
  orgId: one(organizaciones, {
    fields: [equipmentCategories.orgId],
    references: [organizaciones.Id],
  }),
  ots: many(ots),
}));

export const equipmentPhotos = createTable("equipmentPhotos", {
  Id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  equipmentId: uuid("equipmentId")
    .notNull()
    .references(() => equipment.Id),
  photoUrl: text("photoUrl").notNull(),
  uploadedAt: ts("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  description: text("description").notNull(),
  orgId: uuid("orgId")
    .notNull()
    .references(() => organizaciones.Id),
});

export const equipmentPhotosRelations = relations(equipmentPhotos, ({ one }) => ({
  equipmentId: one(equipment, {
    fields: [equipmentPhotos.equipmentId],
    references: [equipment.Id],
  }),
}));

export const documentTypes = createTable("documentTypes", {
  Id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  typeName: text("typeName").notNull(),
  description: text("description").notNull(),
  correlatedWith: text("correlatedWith").notNull(),
  orgId: uuid("orgId")
    .notNull()
    .references(() => organizaciones.Id),
});

export const documentTypesRelations = relations(documentTypes, ({ one }) => ({
  orgId: one(organizaciones, {
    fields: [documentTypes.orgId],
    references: [organizaciones.Id],
  }),
}));

export const documents = createTable("documents", {
  Id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  docType: text("docType").notNull(),
  docUrl: text("docUrl").notNull(),
  uploadedAt: ts("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  comment: text("comment"),
  equipmentId: uuid("equipmentId"), // sin .references por la nulabilidad
  equCategoryId: uuid("equCategoryId"), // sin .references por la nulabilidad
  orgId: uuid("orgId")
    .notNull()
    .references(() => organizaciones.Id),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  equipmentId: one(equipment, {
    fields: [documents.equipmentId],
    references: [equipment.Id],
  }),
  equCategoryId: one(equipmentCategories, {
    fields: [documents.equCategoryId],
    references: [equipmentCategories.Id],
  }),
  orgId: one(organizaciones, {
    fields: [documents.orgId],
    references: [organizaciones.Id],
  }),
}));

export const ots = createTable("ots", {
  Id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  isTemplate: int("isTemplate", { mode: "boolean" }).default(false),
  name: text("name").notNull(),
  otType: text("otType").notNull(),
  date: ts("date")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  templateLastUsed: ts("templateLastUsed"),
  daysLimit: integer("daysLimit").notNull(),
  daysPeriod: integer("daysPeriod"),
  // solo si es template
  tipoEquipoId: uuid("tipoEquipoId"),
  equipoId: uuid("equipoId"),
  templateId: uuid("templateId"),
  orgId: uuid("orgId")
    .notNull()
    .references(() => organizaciones.Id),
});

export const otsRelations = relations(ots, ({ one, many }) => ({
  tipoEquipoId: one(equipmentCategories, {
    fields: [ots.tipoEquipoId],
    references: [equipmentCategories.Id],
  }),
  equipoId: one(equipment, {
    fields: [ots.equipoId],
    references: [equipment.Id],
  }),
  templateId: one(ots, {
    fields: [ots.templateId],
    references: [ots.Id],
  }),
  interventions: many(interventions),
}));

export const interventions = createTable("interventions", {
  Id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: uuid("userId")
    .notNull()
    .references(() => users.Id),
  otId: uuid("otId")
    .notNull()
    .references(() => ots.Id),
  limitDate: ts("limitDate")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  status: text("status").notNull(),
  orgId: uuid("orgId")
    .notNull()
    .references(() => organizaciones.Id),
});

export const intervencionesRelations = relations(interventions, ({ one }) => ({
  otId: one(ots, {
    fields: [interventions.otId],
    references: [ots.Id],
  }),
  userId: one(users, {
    fields: [interventions.userId],
    references: [users.Id],
  }),
}));
