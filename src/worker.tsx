import { defineApp } from "rwsdk/worker";
import { index, render, route } from "rwsdk/router";

import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { getAgentByName } from "agents";
import { env } from "cloudflare:workers";
import MoondreamPlayground from "./app/pages/Moondream";
export { Moondream } from "./durable/Moondream";

export type AppContext = {};

export default defineApp([
  setCommonHeaders(),
  route("/moondream/:endpoint", async ({ request, params }) => {
    const payload = await request.json<any>();
    const mooondream = await getAgentByName(env.MOONDREAM, "moondream");
    return Response.json(await mooondream.run(params.endpoint, payload));
  }),
  render(Document, [index([MoondreamPlayground])]),
]);
