<script lang="ts">
	interface Post {
		href: string;
		title: string;
		topic: string;
		topicClass: string;
		readingTime: string;
		date: string;
	}
	interface Props {
		posts: Post[];
		topics: string[];
	}
	let { posts, topics }: Props = $props();

	let active = $state('all');
</script>

<div class="filters">
	<button class="chip" class:active={active === 'all'} type="button" onclick={() => (active = 'all')}>
		All posts
	</button>
	{#each topics as t}
		<button class="chip" class:active={active === t} type="button" onclick={() => (active = t)}>
			{t}
		</button>
	{/each}
</div>

<div class="index-list">
	{#each posts as post, i}
		{#if active === 'all' || post.topic === active}
			<a class="post-row" href={post.href}>
				<span class="num">{String(i + 1).padStart(2, '0')}</span>
				<span>
					<span class="pt">{post.title}</span>
					<span class="pmeta">
						<span class="tag {post.topicClass}">{post.topic}</span>
						<span class="dot"></span>
						<span class="t">{post.readingTime}</span>
					</span>
				</span>
				<span class="date">{post.date}</span>
			</a>
		{/if}
	{/each}
</div>

<style>
	.filters {
		display: flex;
		gap: var(--space-100);
		flex-wrap: wrap;
		margin-bottom: var(--space-100);
	}

	.chip {
		font-family: var(--label);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		padding: var(--space-100) var(--space-200);
		border-radius: var(--radius-pill);
		border: 1px solid var(--border-strong);
		background: var(--surface-raised);
		color: var(--text-muted);
		transition: all var(--duration-normal) var(--ease);
	}

	.chip:hover {
		color: var(--text-body);
		border-color: var(--text-body);
	}

	.chip.active {
		background: var(--primary);
		border-color: var(--primary);
		color: var(--text-on-primary);
	}

	.index-list {
		border-top: 1px solid var(--border);
	}

	.post-row {
		display: grid;
		grid-template-columns: 54px 1fr auto;
		gap: var(--space-300);
		align-items: baseline;
		padding: var(--space-300) var(--space-100);
		border-bottom: 1px solid var(--border);
		transition:
			background var(--duration-normal) var(--ease),
			padding var(--duration-normal) var(--ease);
	}

	.post-row:hover {
		background: var(--surface-raised);
		padding-inline: var(--space-200);
	}

	.post-row .num {
		font-family: var(--mono);
		font-size: 13px;
		color: var(--primary);
	}

	.post-row .pt {
		font-weight: 500;
		font-size: 23px;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.post-row .pmeta {
		display: flex;
		gap: var(--space-150);
		align-items: center;
		margin-top: var(--space-100);
	}

	.post-row .pmeta .tag {
		font-size: 11px;
		padding: 2px var(--space-100);
	}

	.post-row .pmeta .dot {
		width: 3px;
		height: 3px;
		border-radius: var(--radius-full);
		background: var(--text-faint);
	}

	.post-row .pmeta .t {
		font-family: var(--mono);
		font-size: 11.5px;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.post-row .date {
		font-family: var(--mono);
		font-size: 12px;
		color: var(--text-faint);
		white-space: nowrap;
		text-align: right;
	}

	@media (prefers-reduced-motion: reduce) {
		.post-row:hover {
			transform: none;
		}
	}
</style>
