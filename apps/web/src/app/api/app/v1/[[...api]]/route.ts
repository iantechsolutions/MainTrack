// import 'server-only';
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getApi } from "~/trpc/server";
import { authLoginSchema, authSignupSchema } from "~/server/api/routers/auth";
import { editSelfSchema } from "~/server/api/routers/user_router";
import { getServerSession } from "next-auth";
import { docCreateSchema, docListSchema } from "~/server/api/routers/doc_router";
import { docTypeCreateSchema, docTypeListSchema } from "~/server/api/routers/doctype_router";
import { schemaOrgInvite, schemaOrgPatch, schemaOrgPut, schemaOrgSetRole } from "~/server/api/routers/org_router";
import { eqTypeCreateSchema, eqTypeListSchema } from "~/server/api/routers/eq_type_roouter";
import {
  equipCreateSchema,
  equipEditLocationSchema,
  equipEditStatusSchema,
  equipListSchema,
  equipPhotoPutSchema,
} from "~/server/api/routers/equip_router";
import { nextAuthOptions } from "~/app/api/auth/[...nextauth]/next";
import { utapi } from "~/server/uploadthing";
import { UTFile } from "uploadthing/server";
import { nanoid } from "nanoid";
import { otCreateSchema, otEditSchema } from "~/server/api/routers/ots_router";
import { intervEditSchema, intervSetStatusSchema } from "~/server/api/routers/intervention_router";

type HonoVariables = {
  uid: string;
};

// export const runtime = 'edge';
const app = new Hono<{ Variables: HonoVariables }>().basePath("/api/app/v1");

app.use("/p/*", async (c, next) => {
  const session = await getServerSession(nextAuthOptions);
  if (!session) {
    return c.status(400);
  } else {
    c.set("uid", session.user.id);
    await next();
  }
});

app.get("/test", async (c) => {
  return c.text("'hono test'");
});

app.get("/p/test", async (c) => {
  return c.text("'hono test'");
});

app.post("/signup", zValidator("json", authSignupSchema), async (c) => {
  const api = await getApi();
  return c.json(api.auth.signUp(c.req.valid("json")));
});

// Usar endpoints de nextauth
app.post("/login", zValidator("json", authLoginSchema), async (c) => {
  const api = await getApi();
  return c.json(api.auth.logIn(c.req.valid("json")));
});

// users

app.get("/p/user", async (c) => {
  const api = await getApi();
  return c.json(await api.user.get());
});

app.post("/p/user", zValidator("json", editSelfSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.user.editSelf(c.req.valid("json")));
});

// orgs
app.put("/p/org", zValidator("json", schemaOrgPut), async (c) => {
  const api = await getApi();
  return c.json(await api.org.create(c.req.valid("json")));
});

app.patch("/p/org", zValidator("json", schemaOrgPatch), async (c) => {
  const api = await getApi();
  return c.json(await api.org.edit(c.req.valid("json")));
});

const schemaOrgDel = z.object({
  orgId: z.string(),
});

app.delete("/p/org", zValidator("json", schemaOrgDel), async (c) => {
  const api = await getApi();
  return c.text(await api.org.delete(c.req.valid("json")));
});

app.get("/p/org/:orgId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.org.get({
      orgId: c.req.param("orgId"),
    }),
  );
});

app.get("/p/org/list", async (c) => {
  const api = await getApi();
  return c.json(await api.org.list());
});

app.get("/p/org/usuario/:orgId/:userId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.org.getUser({
      orgId: c.req.param("orgId"),
      userId: c.req.param("userId"),
    }),
  );
});

app.get("/p/org/usuarios/:orgId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.org.listUsers({
      orgId: c.req.param("orgId"),
    }),
  );
});

app.post("/p/org/invite", zValidator("json", schemaOrgInvite), async (c) => {
  const api = await getApi();
  return c.text(await api.org.inviteUser(c.req.valid("json")));
});

app.get("/p/org/join/:token", async (c) => {
  const api = await getApi();
  return c.text(
    await api.org.join({
      token: c.req.param("token"),
    }),
  );
});

app.get("/p/org/remove/:userId/:orgId", async (c) => {
  const api = await getApi();
  return c.text(
    await api.org.removeUser({
      userId: c.req.param("userId"),
      orgId: c.req.param("orgId"),
    }),
  );
});

app.post("/p/org/setrole", zValidator("json", schemaOrgSetRole), async (c) => {
  const api = await getApi();
  return c.json(await api.org.setRole(c.req.valid("json")));
});

app.get("/p/org/select/:orgId", async (c) => {
  const api = await getApi();
  return c.text(
    await api.org.select({
      orgId: c.req.param("orgId"),
    }),
  );
});

app.put("/p/doc", zValidator("json", docCreateSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.doc.create(c.req.valid("json")));
});

app.delete("/p/doc/:docId", async (c) => {
  const api = await getApi();
  return c.text(
    await api.doc.delete({
      id: c.req.param("docId"),
    }),
  );
});

app.get("/p/doc/:docId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.doc.get({
      id: c.req.param("docId"),
    }),
  );
});

// post porque los argumentos son un choclazo
app.post("/p/doc/list", zValidator("json", docListSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.doc.listFiltered(c.req.valid("json")));
});

app.put("/p/doctype", zValidator("json", docTypeCreateSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.docType.create(c.req.valid("json")));
});

app.delete("/p/doctype/:docTypeId", async (c) => {
  const api = await getApi();
  return c.text(
    await api.docType.delete({
      id: c.req.param("docTypeId"),
    }),
  );
});

// lista de doctypes de orgId
app.get("/p/doctype/:orgId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.docType.list({
      orgId: c.req.param("orgId"),
    }),
  );
});

// lista filtrada
// post porque los argumentos son un choclazo
app.post("/p/doctype/list", zValidator("json", docTypeListSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.docType.listFiltered(c.req.valid("json")));
});

app.put("/p/eqtype", zValidator("json", eqTypeCreateSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.eqType.create(c.req.valid("json")));
});

app.delete("/p/eqtype/:eqTypeId", async (c) => {
  const api = await getApi();
  return c.text(
    await api.eqType.delete({
      id: c.req.param("eqTypeId"),
    }),
  );
});

app.get("/p/eqtype/:eqTypeId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.eqType.get({
      id: c.req.param("eqTypeId"),
    }),
  );
});

app.get("/p/eqtype/list/:orgId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.eqType.list({
      orgId: c.req.param("orgId"),
    }),
  );
});

// lista filtrada
// post porque los argumentos son un choclazo, para ponerlos en el body
app.post("/p/eqtype/list", zValidator("json", eqTypeListSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.eqType.listFiltered(c.req.valid("json")));
});

app.put("/p/equipment", zValidator("json", equipCreateSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.equip.create(c.req.valid("json")));
});

app.delete("/p/equipment/:eqId", async (c) => {
  const api = await getApi();
  return c.text(
    await api.equip.delete({
      id: c.req.param("eqId"),
    }),
  );
});

app.get("/p/equipment/:equipId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.equip.get({
      equipId: c.req.param("equipId"),
    }),
  );
});

app.get("/p/equipment/list/:orgId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.equip.list({
      orgId: c.req.param("orgId"),
    }),
  );
});

app.patch("/p/equipment/status", zValidator("json", equipEditStatusSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.equip.editStatus(c.req.valid("json")));
});

app.patch("/p/equipment/location", zValidator("json", equipEditLocationSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.equip.editLoc(c.req.valid("json")));
});

// lista filtrada
// post porque los argumentos son un choclazo, para ponerlos en el body
app.post("/p/equipment/list", zValidator("json", equipListSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.equip.listFiltered(c.req.valid("json")));
});

// ver /p/file
app.post("/p/equipment/photo", zValidator("json", equipPhotoPutSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.equip.photoPut(c.req.valid("json")));
});

app.delete("/p/equipment/photo/:Id", async (c) => {
  const api = await getApi();
  return c.json(
    await api.equip.photoDel({
      photoId: c.req.param("Id"),
    }),
  );
});

app.get("/p/equipment/photos/:equipId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.equip.photoList({
      equipId: c.req.param("equipId"),
    }),
  );
});

app.get("/p/ot/:Id", async (c) => {
  const api = await getApi();
  return c.json(
    await api.ots.get({
      Id: c.req.param("Id"),
    }),
  );
});

app.get("/p/ot/list/org/:orgId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.ots.listOrg({
      orgId: c.req.param("orgId"),
    }),
  );
});

app.get("/p/ot/list/eqtype/:eqTypeId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.ots.listEqType({
      eqTypeId: c.req.param("eqTypeId"),
    }),
  );
});

app.get("/p/ot/list/equip/:equipId", async (c) => {
  const api = await getApi();
  return c.json(
    await api.ots.listEquipo({
      equipId: c.req.param("equipId"),
    }),
  );
});

app.put("/p/ot", zValidator("json", otCreateSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.ots.create(c.req.valid("json")));
});

// edit
app.post("/p/ot", zValidator("json", otEditSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.ots.edit(c.req.valid("json")));
});

app.delete("/p/ot/:Id", async (c) => {
  const api = await getApi();
  return c.json(await api.ots.delete({ id: c.req.param("Id") }));
});

app.get("/p/intervention/:intId", async (c) => {
  const api = await getApi();
  return c.json(await api.interventions.get({ intId: c.req.param("intId") }));
});

app.post("/p/intervention/status", zValidator('json', intervSetStatusSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.interventions.setStatus(c.req.valid('json')));
});

app.get("/p/intervention/list/:orgId", async (c) => {
  const api = await getApi();
  return c.json(await api.interventions.list({ orgId: c.req.param("orgId") }));
});

app.post("/p/intervention", zValidator('json', intervEditSchema), async (c) => {
  const api = await getApi();
  return c.json(await api.interventions.edit(c.req.valid('json')));
});

const putFileSchema = z.object({
  data64: z.string(),
  filename: z.string().nullable(),
});

// upload archivo generico base64
app.put("/p/file", zValidator("json", putFileSchema), async (c) => {
  const data = c.req.valid("json");

  const decoded = atob(data.data64);
  /* const byteArray = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    byteArray[i] = decoded.charCodeAt(i);
  } */

  const file = new UTFile([decoded], data.filename ?? `${nanoid()}.file`);
  const res = await utapi.uploadFiles([file]);
  return c.json(
    res.map((file) => {
      return {
        name: file.data?.name,
        url: file.data?.url,
        size: file.data?.size,
        type: file.data?.type,
        error_code: file.error?.code,
      };
    }),
  );
});

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
export const PATCH = app.fetch;
