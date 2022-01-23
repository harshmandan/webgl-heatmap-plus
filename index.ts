import nukeVendorPrefix from "./src/nukeVendorPrefix";
import textureFloatShims from "./src/textureFloatShims";
import WebGLHeatmap from "./src/WebGLHeatmap";
import { WebGLHeatmapOptions } from "./src/types";

export default function createWebGLHeatmap(options: WebGLHeatmapOptions) {
	nukeVendorPrefix();
	textureFloatShims();

	return new WebGLHeatmap(options);
}
