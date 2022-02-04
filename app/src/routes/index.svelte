<script lang="ts">
	import { browser } from '$app/env';
	import MuxVideo from '$lib/components/MuxVideo.svelte';

	let duration = 0;
	let currentTime = 0;
</script>

{#if browser}
	<div>
		<MuxVideo bind:duration bind:currentTime />
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
