# StreamFlix client prototype integration

`StreamFlix Client Prototype.html` is retained as the supplied design reference.

The live customer app is `client/`, implemented in React/TypeScript. The prototype's soft midnight palette and visual tokens have been applied to `client/src/client-v2.css`. The prototype's embedded sample catalog, generated sample posters, local-only authentication, simulated player progress, and buttons labelled “prototype” were intentionally not copied into the live app because they do not represent verified database records or real service actions.

Live features must use the React client services and the Express API. Supabase credentials, RLS/schema, Google OAuth configuration, and Stripe credentials must be configured in the deployment environment; a source archive cannot safely contain those secrets.
