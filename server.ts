export default {
    fetch: async (req: Request) => {
        const url = new URL(req.url);
        const pathname = decodeURIComponent(url.pathname);

        try {
            // Serve files from dist folder
            if (pathname.startsWith("/dist/")) {
                const filepath = `${Deno.cwd()}/dist/${pathname.substring(6)}`;
                const file = await Deno.open(filepath, {
                    read: true,
                });

                return new Response(file.readable, {
                    headers: createHeaders(filepath),
                });
            }

            // Serve static files
            const filepath = pathname.endsWith("/")
                ? `${Deno.cwd()}/public/${pathname}/index.html`
                : `${Deno.cwd()}/public/${pathname}`;

            const file = await Deno.open(filepath, {
                read: true,
            });

            return new Response(file.readable, {
                headers: createHeaders(filepath),
            });
        } catch {
            return new Response("404 Not Found", { status: 404 });
        }
    },
};

function createHeaders(filepath: string): Headers {
    if (filepath.endsWith(".js")) {
        return new Headers({ "content-type": "text/javascript" });
    }
    if (filepath.endsWith(".js.map")) {
        return new Headers({ "content-type": "application/json" });
    }
    return new Headers();
}
