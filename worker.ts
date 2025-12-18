export default {
  async fetch(request: Request, env: { D1: D1Database }): Promise<Response> {
    const result = await env.D1.prepare("SELECT 1 as test").first();
    return Response.json(result);
  },
};
