require("browser-env")();

let init = false;
/**
 *
 * @param {"2d" | "webgl"} contextId
 * @param {CanvasRenderingContext2DSettings | WebGLRenderingContext} options
 *
 * @returns {CanvasRenderingContext2D | WebGLRenderingContext | null}
 */
HTMLCanvasElement.prototype.getContext = (contextId, options = {}) => {
	if (init) return;
	init = true;

	switch (contextId) {
		case "2d":
			return document.createElement("canvas").getContext("2d", options);
		case "webgl":
		default:
			return document.createElement("canvas").getContext("webgl", options);
	}
};
