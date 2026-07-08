/**
 * Cloudflare Pages Middleware
 * 
 * 1. Redirects freemarketingcalculator.pages.dev → freemarketingcalculator.com (301)
 *    This prevents Google indexing the dev subdomain as duplicate content.
 *
 * 2. Adds security headers to all responses on production.
 */

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // ── Block dev subdomain — redirect to production ─────────────────────────
  if (url.hostname.endsWith('.pages.dev')) {
    const productionUrl = `https://freemarketingcalculator.com${url.pathname}${url.search}`;
    return Response.redirect(productionUrl, 301);
  }

  // ── Serve the page normally ──────────────────────────────────────────────
  const response = await next();

  // ── Add security + SEO headers on production ─────────────────────────────
  const newHeaders = new Headers(response.headers);

  // Prevent clickjacking
  newHeaders.set('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME sniffing
  newHeaders.set('X-Content-Type-Options', 'nosniff');

  // Referrer policy
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy — restrict unnecessary browser APIs
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS — force HTTPS for 1 year
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
