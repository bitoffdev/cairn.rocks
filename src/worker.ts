export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Try to fetch the asset first
      const assetResponse = await env.ASSETS.fetch(request);
      
      // If the asset exists, return it
      if (assetResponse.status === 200) {
        return assetResponse;
      }

      // For all other routes, serve index.html
      // This enables client-side routing
      return env.ASSETS.fetch(new Request(`${url.origin}/index.html`));
    } catch (e) {
      // If there's an error, return a 404
      return new Response('Not Found', { status: 404 });
    }
  },
}; 