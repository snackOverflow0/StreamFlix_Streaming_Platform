export function developmentSecurity(): {
 name: string;
 apply: 'serve';
 transformIndexHtml(html: string): string;
 configureServer(server: {middlewares: {use(handler: (req: unknown, res: {setHeader(name: string, value: string): unknown}, next: () => void) => void): unknown}}): void;
};
