<script lang="ts">
	import { browser } from '$app/env';
	import MuxVideo from '$lib/components/MuxVideo.svelte';
	import Heatmap from '$lib/components/Heatmap.svelte';

	let duration = 0;
	let currentTime = 0;
	let videoWidth = 0;
	let videoHeight = 0;
</script>

{#if browser}
	<div>
		<MuxVideo bind:duration bind:currentTime bind:videoWidth bind:videoHeight />
		<Heatmap videoDuration={duration} videoTime={currentTime} {videoWidth} {videoHeight} />
	</div>
{/if}

<style>
	div {
		width: 100%;
		height: 100%;
		margin: 0 auto;
		position: relative;
	}
</style>
