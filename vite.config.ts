// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const rpcWebsocketsBrowserEntry = fileURLToPath(
  new URL("./node_modules/rpc-websockets/dist/index.browser.mjs", import.meta.url),
);

export default defineConfig({
  vite: {
    plugins: [
      nodePolyfills({ include: ["buffer", "process"] }),
    ],
  },
  nitro: {
    // @solana/web3.js pulls in rpc-websockets via Connection. Nothing in this app calls
    // Connection server-side (it's only used from browser-only, IndexedDB-gated code), but
    // Nitro's Cloudflare Workers build still needs to resolve the import graph. rpc-websockets'
    // package.json exports map only declares "browser"/"node" conditions — neither matches
    // Nitro's workerd resolve conditions — so resolution fails with "'.' is not exported".
    // Aliasing straight to the browser build file bypasses exports-map validation entirely.
    alias: {
      "rpc-websockets": rpcWebsocketsBrowserEntry,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});