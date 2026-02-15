<script>
  import '$lib/styles/core.css';
  import '$lib/styles/print-core.css';
  import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
