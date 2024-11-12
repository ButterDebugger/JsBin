import * as esbuild from "https://deno.land/x/esbuild@v0.24.0/mod.js";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.11.0";

// Create esbuild context
const ctx: esbuild.BuildContext = await esbuild.context({
    plugins: [...denoPlugins()],
    entryPoints: ["./src/index.ts"],
    outdir: "./dist/",
    bundle: true,
    platform: "browser",
    format: "esm",
    target: "esnext",
    minify: true,
    sourcemap: true,
    treeShaking: true,
});

if (Deno.args.includes("--watch")) {
    // Enable rebuild watcher
    await ctx.watch();
    console.log("[Bundler] Watching source code for changes...");
} else {
    // Bundle source code
    await ctx.rebuild();
    console.log("[Bundler] Built successfully!");

    // Dispose of esbuild instance
    await ctx.dispose();
    Deno.exit(0);
}
