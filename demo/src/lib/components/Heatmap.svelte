<script lang="ts">
	import { onMount } from 'svelte';
	import generateHeatPoints from '$lib/utils/generateHeatPoints';
	import createWebGLHeatmap, { type WebGLHeatmap } from 'webgl-heatmap-plus';

	export let videoDuration: number = 60;
	export let videoTime: number = 0;
	export let videoWidth: number = 0;
	export let videoHeight: number = 0;

	let canvasEl: HTMLCanvasElement | undefined;
	let heatmap: WebGLHeatmap | null = null;
	const SIZE = 100;
	const INTENSITY = SIZE / 100;

	onMount(() => {
		try {
			if (canvasEl) {
				heatmap = createWebGLHeatmap({ canvas: canvasEl });
				heatmap.addPoint(0, 0, 0);
				heatmap.update();
				heatmap.display();
				heatmap.blur();
			}
		} catch (e) {
			console.log(e);
		}
	});

	$: metadataloaded = videoDuration * videoWidth * videoHeight;
	$: heatpoints = metadataloaded && generateHeatPoints(videoDuration, videoWidth, videoHeight);
	$: if (heatmap && heatpoints) {
		heatmap.multiply(0.85);
		heatmap.blur();

		const points = heatpoints[Math.floor(videoTime)];
		if (points) {
			const { width, height } = heatmap;
			for (const point of points) {
				heatmap.addPoint(point.x * width, point.y * height, SIZE, INTENSITY);
			}
		}

		heatmap.update();
		heatmap.display();
	}
</script>

<heatmap>
	<canvas bind:this={canvasEl} />
</heatmap>

<style>
	heatmap {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
		pointer-events: none;
	}
	canvas {
		width: 100%;
		height: 100%;
		position: relative;
		border: 1px solid rgba(144, 144, 144, 0.5);
	}
</style>
