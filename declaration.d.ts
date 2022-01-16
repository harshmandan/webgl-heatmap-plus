import type { SpecType, FloatExtensionProps } from "./types";

declare global {
	interface WebGLRenderingContext {
		getFloatExtension(spec: SpecType): FloatExtensionProps | null;
	}
	interface WebGL2RenderingContext {
		getFloatExtension(spec: SpecType): FloatExtensionProps | null;
	}
}
