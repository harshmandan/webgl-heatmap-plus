import { defineConfig } from "tsup";

export default defineConfig({
	sourcemap: false,
	clean: true,
	minify: true,
	entryPoints: ["index.ts"],
	format: ["esm", "cjs"],
	outDir: "lib",
	target: "node12",
});
