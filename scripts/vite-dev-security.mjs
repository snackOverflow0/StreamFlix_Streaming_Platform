// React Refresh injects an inline preamble and HMR uses a WebSocket in development.
// Production keeps its strict meta policy and HTTP headers.
export function developmentSecurity(){return{
 name:'streamflix-development-security',apply:'serve',
 transformIndexHtml(html){return html.replace(/<meta\b(?=[^>]*http-equiv=["']Content-Security-Policy["'])[^>]*>/gi,'');},
 configureServer(server){server.middlewares.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');next();});}
};}
