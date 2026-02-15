<script>
  import '$lib/styles/core.css';
  import '$lib/styles/print-core.css';
  import '$lib/styles/themes/gov.css';
  import '$lib/styles/themes/terminal.css';
  import '$lib/styles/themes/classic.css';
  import '$lib/styles/themes/editorial.css';
  import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
