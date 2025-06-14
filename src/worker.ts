export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      
      // Check if static content bindings exist
      if (!env.__STATIC_CONTENT_MANIFEST || !env.__STATIC_CONTENT) {
        console.error('Static content bindings are not available');
        return new Response('Configuration Error', { status: 500 });
      }

      // Serve index.html for the root path
      if (url.pathname === '/') {
        return env.__STATIC_CONTENT.fetch(new Request(`${url.origin}/index.html`));
      }

      // Try to serve the requested asset
      try {
        return await env.__STATIC_CONTENT.fetch(request);
      } catch (assetError) {
        console.error('Error fetching asset:', assetError);
        return new Response('Not Found', { status: 404 });
      }
    } catch (e) {
      console.error('Error handling request:', e);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
}; 