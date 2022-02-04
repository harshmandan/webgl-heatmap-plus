<script lang="ts">
	import '@mux-elements/mux-video';
</script>

<mux-video
	src="https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/high.mp4"
	controls
	preload="metadata"
	playsinline
	stream-type="on-demand"
	prefer-mse
/>

<style>
	mux-video {
		width: 100%;
		height: 100%;
		margin: 0 auto;
	}
</style>
