import test from "ava";
import createWebGLHeatmap from "../lib/index.js";

test("Test WebGL support", (t) => {
	try {
		const canvas = document.createElement("canvas");
		createWebGLHeatmap({ canvas, width: 100, height: 100 });
		t.pass();
	} catch (error) {
		t.is(error, "WebGL not supported");
	}
});
