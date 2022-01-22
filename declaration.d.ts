import type { SpecType, FloatExtensionProps } from "./types";

declare global {
	// interface WebGLRenderingContext {
	// 	getFloatExtension(spec: SpecType): FloatExtensionProps | null;
	// }
	interface WebGLRenderingContext {
		getFloatExtension(spec: SpecType): FloatExtensionProps | null;
	}
	interface Window {
		WebGLDebugUtils: any;
	}
}
