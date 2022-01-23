import test from "ava";
import { HTMLCanvasElement } from "@playcanvas/canvas-mock";
import createWebGLHeatmap from "../lib/index.js";

const width = 100;
const height = 100;

test.afterEach(() => {
	document.querySelectorAll("canvas").forEach((canvas) => {
		canvas.remove();
	});
});

test.serial("check WebGL support", (t) => {
	try {
		const canvas = new HTMLCanvasElement(width, height);
		createWebGLHeatmap({ canvas, width, height });
		t.pass("WebGL is supported");
	} catch (error) {
		t.is(error, "WebGL not supported", "cannot create WebGL context");
	}
});

test.serial("params are correctly passed", (t) => {
	const canvas = new HTMLCanvasElement(width, height);
	const heatmap = createWebGLHeatmap({ canvas, width, height });

	t.is(heatmap.height, height, "height is correct");
	t.is(heatmap.width, width, "width is correct");
});
