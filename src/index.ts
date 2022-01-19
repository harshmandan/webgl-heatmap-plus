import nukeVendorPrefix from "./nukeVendorPrefix";
import textureFloatShims from "./textureFloatShims";
import WebGLHeatmap from "./WebGLHeatmap";

export default function createWebGLHeatmap(params: Record<string, any>) {
	nukeVendorPrefix();
	textureFloatShims();

	return new WebGLHeatmap(params);
}
