<script lang="ts">
  let email = $state('');
  let submitted = $state(false);

  function onsubmit(e: SubmitEvent) {
    e.preventDefault();
    email = '';
    submitted = true;
    // wire to your provider here
  }
</script>

<div class="subscribe">
  <div>
    <h2>A new guide most weeks.</h2>
    <p>
      No spam, no “10x your career” — just the next deep dive, in your inbox
      when it ships.
    </p>
  </div>
  <form class="sub-form" {onsubmit}>
    <input
      type="email"
      placeholder="you@example.com"
      required
      bind:value={email}
    />
    <button class="btn btn-primary" type="submit">
      {submitted ? 'Subscribed ✓' : 'Subscribe'}
    </button>
  </form>
</div>

<style>
  .subscribe {
    background: var(--surface-invert);
    color: var(--text-on-invert);
    border-radius: var(--radius-200);
    padding: var(--space-600) var(--space-600);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-400);
    align-items: center;
  }

  .subscribe h2 {
    font-weight: 500;
    font-size: 30px;
    margin: 0;
    letter-spacing: -0.01em;
    color: var(--text-on-invert);
  }

  .subscribe p {
    color: color-mix(in oklab, var(--text-on-invert) 75%, transparent);
    margin: var(--space-100) 0 0;
    font-size: 16px;
    max-width: 40ch;
  }

  .sub-form {
    display: flex;
    gap: var(--space-100);
  }

  .sub-form input {
    font-family: var(--label);
    font-size: 14px;
    padding: var(--space-150) var(--space-200);
    border-radius: var(--radius-100);
    border: 1px solid
      color-mix(in oklab, var(--text-on-invert) 16%, transparent);
    background: color-mix(in oklab, var(--text-on-invert) 8%, transparent);
    color: var(--code-fg-bright);
    min-width: 240px;
    outline: none;
  }

  .sub-form input::placeholder {
    color: color-mix(in oklab, var(--text-on-invert) 55%, transparent);
  }

  .sub-form input:focus {
    border-color: var(--primary);
  }

  @media (width <= 900px) {
    .subscribe {
      grid-template-columns: 1fr;
    }
  }
</style>
