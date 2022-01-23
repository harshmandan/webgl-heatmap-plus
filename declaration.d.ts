import type { SpecType, FloatExtensionProps } from "./src/types";

declare global {
	interface WebGLRenderingContext {
		getFloatExtension(spec: SpecType): FloatExtensionProps | null;
	}
	interface Window {
		WebGLDebugUtils: any;
	}
}
