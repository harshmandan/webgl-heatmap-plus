import nukeVendorPrefix from "./src/nukeVendorPrefix";
import textureFloatShims from "./src/textureFloatShims";
import WebGLHeatmap from "./src/WebGLHeatmap";

export default function createWebGLHeatmap(params: Record<string, any>) {
	nukeVendorPrefix();
	textureFloatShims();

	return new WebGLHeatmap(params);
}
