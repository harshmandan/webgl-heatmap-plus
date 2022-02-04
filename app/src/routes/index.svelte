<script lang="ts">
	import '@mux-elements/mux-video';

	const video = {
		src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
		poster: 'https://image.mux.com/DZmOWg4VQcGbOgjWyU9zT01VauCJrAPYW/thumbnail.jpg'
	};
</script>

<mux-video
	src={video.src}
	poster={video.poster}
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
