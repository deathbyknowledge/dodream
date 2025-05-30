import { Agent } from "agents";
import { env } from "cloudflare:workers";

// Moondream inference URL, make sure to properly set up networking
// if running locally. I use Cloudflare Tunnels to expose my home server.
const INFERENCE_URL = env.INFERENCE_URL ?? 'https://api.moondream.ai/v1' ;
const MOONDREAM_ENDPOINTS = ["query", "point", "detect", "caption"];

// This could just be a standard DO or called directly from the worker,
// but I'm planning on building extra features later anyway, or building
// the vision capabilities into the Agent. Take it as example usage :)
export class Moondream extends Agent<Env> {
  async run(endpoint: string, payload: Record<string, unknown>) {
    try {
      if (!MOONDREAM_ENDPOINTS.includes(endpoint)) {
        return { error: "Invalid endpoint" };
      }
      const res = await fetch(`${INFERENCE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Moondream-Auth": this.env.MOONDREAM_API_KEY ?? "none", // only matters when using cloud provider
        },
        body: JSON.stringify({
          ...payload,
          stream: false,
        }),
      });
      return await res.json();
    } catch (e: any) {
      console.error(`Error happened while calling /${endpoint}`, e);
      return { error: e.message };
    }
  }
}
