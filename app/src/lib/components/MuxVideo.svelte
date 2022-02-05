<script lang="ts" context="module">
	function isVideo(el: HTMLElement | undefined): el is HTMLVideoElement {
		return el?.tagName.toLowerCase() === 'mux-video';
	}
</script>

<script lang="ts">
	import '@mux-elements/mux-video';

	export let duration: number | undefined;
	export let currentTime: number | undefined;
	export let videoWidth: number | undefined;
	export let videoHeight: number | undefined;

	let videoEl: HTMLElement | HTMLVideoElement | undefined;
	const onloadedmetadata = () => {
		if (isVideo(videoEl)) {
			duration = videoEl.duration;
			videoWidth = videoEl.videoWidth;
			videoHeight = videoEl.videoHeight;
		}
	};
	const ontimeupdate = () => {
		if (isVideo(videoEl)) currentTime = videoEl.currentTime;
	};
</script>

<mux-video
	src="https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/high.mp4"
	controls
	preload="metadata"
	playsinline
	stream-type="on-demand"
	prefer-mse
	on:loadedmetadata={onloadedmetadata}
	on:timeupdate={ontimeupdate}
	bind:this={videoEl}
/>

<style>
	mux-video {
		width: 100%;
		height: 100%;
		margin: 0 auto;
	}
</style>
