export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    try {
      // Get the URL from the request
      const url = new URL(request.url);
      
      // Serve index.html for the root path
      if (url.pathname === '/') {
        return env.ASSETS.fetch(new Request(`${url.origin}/index.html`));
      }

      // Serve other assets
      return env.ASSETS.fetch(request);
    } catch (e) {
      // If there's an error, return a 404
      return new Response('Not Found', { status: 404 });
    }
  },
}; 