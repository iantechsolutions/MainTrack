// import 'server-only';
import { Context, Hono } from "hono";
import { z, ZodSchema } from "zod";
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

async function zValidate<Out>(c: Context<{Variables: HonoVariables}>, schema: ZodSchema<Out>, cb: (data: Out) => Promise<void | Response>) {
  const json = await c.req.json();
  const result = await schema.safeParseAsync(json);
  if (!result.success) {
    return c.json(result, 400);
  } else {
    return await cb(result.data);
  }
}

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

app.post("/signup", async (c) => {
  return await zValidate(c, authSignupSchema, async (body) => {
    const api = await getApi();
    return c.json(api.auth.signUp(body));
  });
});

// Usar endpoints de nextauth
app.post("/login", async (c) => {
  return await zValidate(c, authLoginSchema, async (body) => {
    const api = await getApi();
    return c.json(api.auth.logIn(body));
  });
});

// users

app.get("/p/user", async (c) => {
  const api = await getApi();
  return c.json(await api.user.get());
});

app.post("/p/user", async (c) => {
  return await zValidate(c, editSelfSchema, async (body) => {
    const api = await getApi();
    return c.json(api.user.editSelf(body));
  });
});

// orgs
app.put("/p/org", async (c) => {
  return await zValidate(c, schemaOrgPut, async (body) => {
    const api = await getApi();
    return c.json(api.org.create(body));
  });
});

app.patch("/p/org", async (c) => {
  return await zValidate(c, schemaOrgPatch, async (body) => {
    const api = await getApi();
    return c.json(api.org.edit(body));
  });
});

const schemaOrgDel = z.object({
  orgId: z.string(),
});

app.delete("/p/org", async (c) => {
  return await zValidate(c, schemaOrgDel, async (body) => {
    const api = await getApi();
    return c.json(api.org.delete(body));
  });
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

app.post("/p/org/invite", async (c) => {
  return await zValidate(c, schemaOrgInvite, async (body) => {
    const api = await getApi();
    return c.json(api.org.inviteUser(body));
  });
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

app.post("/p/org/setrole", async (c) => {
  return await zValidate(c, schemaOrgSetRole, async (body) => {
    const api = await getApi();
    return c.json(api.org.setRole(body));
  });
});

app.get("/p/org/select/:orgId", async (c) => {
  const api = await getApi();
  return c.text(
    await api.org.select({
      orgId: c.req.param("orgId"),
    }),
  );
});

app.put("/p/doc", async (c) => {
  return await zValidate(c, docCreateSchema, async (body) => {
    const api = await getApi();
    return c.json(api.doc.create(body));
  });
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
app.post("/p/doc/list", async (c) => {
  return await zValidate(c, docListSchema, async (body) => {
    const api = await getApi();
    return c.json(api.doc.listFiltered(body));
  });
});

app.put("/p/doctype", async (c) => {
  return await zValidate(c, docTypeCreateSchema, async (body) => {
    const api = await getApi();
    return c.json(api.docType.create(body));
  });
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
app.post("/p/doctype/list", async (c) => {
  return await zValidate(c, docTypeListSchema, async (body) => {
    const api = await getApi();
    return c.json(api.docType.listFiltered(body));
  });
});

app.put("/p/eqtype", async (c) => {
  return await zValidate(c, eqTypeCreateSchema, async (body) => {
    const api = await getApi();
    return c.json(api.eqType.create(body));
  });
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
app.post("/p/eqtype/list", async (c) => {
  return await zValidate(c, eqTypeListSchema, async (body) => {
    const api = await getApi();
    return c.json(api.eqType.listFiltered(body));
  });
});

app.put("/p/equipment", async (c) => {
  return await zValidate(c, equipCreateSchema, async (body) => {
    const api = await getApi();
    return c.json(api.equip.create(body));
  });
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

app.patch("/p/equipment/status", async (c) => {
  return await zValidate(c, equipEditStatusSchema, async (body) => {
    const api = await getApi();
    return c.json(api.equip.editStatus(body));
  });
});

app.patch("/p/equipment/location", async (c) => {
  return await zValidate(c, equipEditLocationSchema, async (body) => {
    const api = await getApi();
    return c.json(api.equip.editLoc(body));
  });
});

// lista filtrada
// post porque los argumentos son un choclazo, para ponerlos en el body
app.post("/p/equipment/list", async (c) => {
  return await zValidate(c, equipListSchema, async (body) => {
    const api = await getApi();
    return c.json(api.equip.listFiltered(body));
  });
});

// ver /p/file
app.post("/p/equipment/photo", async (c) => {
  return await zValidate(c, equipPhotoPutSchema, async (body) => {
    const api = await getApi();
    return c.json(api.equip.photoPut(body));
  });
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

app.put("/p/ot", async (c) => {
  return await zValidate(c, otCreateSchema, async (body) => {
    const api = await getApi();
    return c.json(api.ots.create(body));
  });
});

// edit
app.post("/p/ot", async (c) => {
  return await zValidate(c, otEditSchema, async (body) => {
    const api = await getApi();
    return c.json(api.ots.edit(body));
  });
});

app.delete("/p/ot/:Id", async (c) => {
  const api = await getApi();
  return c.json(await api.ots.delete({ id: c.req.param("Id") }));
});

app.get("/p/intervention/:intId", async (c) => {
  const api = await getApi();
  return c.json(await api.interventions.get({ intId: c.req.param("intId") }));
});

app.post("/p/intervention/status", async (c) => {
  return await zValidate(c, intervSetStatusSchema, async (body) => {
    const api = await getApi();
    return c.json(api.interventions.setStatus(body));
  });
});

app.get("/p/intervention/list/:orgId", async (c) => {
  const api = await getApi();
  return c.json(await api.interventions.list({ orgId: c.req.param("orgId") }));
});

app.post("/p/intervention", async (c) => {
  return await zValidate(c, intervEditSchema, async (body) => {
    const api = await getApi();
    return c.json(api.interventions.edit(body));
  });
});

const putFileSchema = z.object({
  data64: z.string(),
  filename: z.string().nullable(),
});

// upload archivo generico base64
app.put("/p/file", async (c) => {
  return await zValidate(c, putFileSchema, async (data) => {
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
});

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
export const PATCH = app.fetch;
