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
  <button
    class="chip"
    class:active={active === 'all'}
    type="button"
    onclick={() => (active = 'all')}
  >
    All posts
  </button>
  {#each topics as t (t)}
    <button
      class="chip"
      class:active={active === t}
      type="button"
      onclick={() => (active = t)}
    >
      {t}
    </button>
  {/each}
</div>

<div class="index-list">
  {#each posts as post, i (post.href)}
    {#if active === 'all' || post.topic === active}
      <a class="post-row" href={post.href}>
        <span class="num">{String(i + 1).padStart(2, '0')}</span>
        <span class="pt">{post.title}</span>
        <span class="pmeta">
          <span class="tag {post.topicClass}">{post.topic}</span>
          <span class="t">{post.readingTime}</span>
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

    &:hover {
      color: var(--text-body);
      border-color: var(--text-body);
    }

    &.active {
      background: var(--primary);
      border-color: var(--primary);
      color: var(--text-on-primary);
    }
  }

  .index-list {
    border-top: 1px solid var(--border);
  }

  .post-row {
    display: grid;
    grid-template-columns: 54px 1fr auto;
    grid-template-areas:
      'num title date'
      'num meta  date';
    column-gap: var(--space-300);
    align-items: baseline;
    padding: var(--space-300) var(--space-100);
    border-bottom: 1px solid var(--border);
    transition:
      background var(--duration-normal) var(--ease),
      padding var(--duration-normal) var(--ease);

    &:hover {
      background: var(--surface-raised);
      padding-inline-start: var(--space-200);
    }

    .num {
      grid-area: num;
      align-self: baseline;
      font-family: var(--mono);
      font-size: 13px;
      color: var(--primary);
    }

    .pt {
      grid-area: title;
      font-weight: 500;
      font-size: 23px;
      line-height: 1.2;
      letter-spacing: -0.01em;
    }

    .pmeta {
      grid-area: meta;
      display: flex;
      gap: var(--space-150);
      align-items: center;
      margin-top: var(--space-100);

      .tag {
        font-size: 11px;
        padding: 2px var(--space-100);
      }

      .t {
        font-family: var(--mono);
        font-size: 11.5px;
        color: var(--text-muted);
        white-space: nowrap;

        &::before {
          content: '';
          display: inline-block;
          width: 3px;
          height: 3px;
          margin-right: var(--space-150);
          border-radius: var(--radius-full);
          background: var(--text-faint);
          vertical-align: middle;
        }
      }
    }

    .date {
      grid-area: date;
      align-self: baseline;
      font-family: var(--mono);
      font-size: 12px;
      color: var(--text-faint);
      white-space: nowrap;
      text-align: right;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .post-row:hover {
      transform: none;
    }
  }
</style>
