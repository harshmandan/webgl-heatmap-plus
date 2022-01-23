require("browser-env")();

let init = false;
/**
 *
 * @param {"2d" | "webgl"} contextId
 * @param {CanvasRenderingContext2DSettings | WebGLRenderingContext} options
 *
 * @returns {CanvasRenderingContext2D | WebGLRenderingContext | null}
 */
HTMLCanvasElement.prototype.getContext = function () {
	if (init) return;
	init = true;
	return document.createElement("canvas").getContext.call(this, ...arguments);
};
