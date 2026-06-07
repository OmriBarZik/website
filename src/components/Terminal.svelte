<script lang="ts">
  interface Props {
    prompt?: string;
    title?: string;
    hint?: string;
    intro?: string[];
    demo?: string;
    commands?: Record<string, string[]>;
  }
  let {
    prompt = '~ $',
    title = 'terminal',
    hint = 'help',
    intro = [],
    demo,
    commands = {},
  }: Props = $props();

  type Seg = { cls: string; text: string };

  // parse inline [ok]..[/ok] markup into escaped segments (no innerHTML)
  function parseSegments(s: string): Seg[] {
    const segs: Seg[] = [];
    const re = /\[(ok|warn|err|muted|pre|cmd)\]([\s\S]*?)\[\/\1\]/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s))) {
      if (m.index > last) segs.push({ cls: '', text: s.slice(last, m.index) });
      segs.push({ cls: m[1], text: m[2] });
      last = re.lastIndex;
    }
    if (last < s.length) segs.push({ cls: '', text: s.slice(last) });
    return segs;
  }

  let lines = $state<Seg[][]>(intro.map(parseSegments));
  let input = $state('');
  let bodyEl: HTMLDivElement | undefined = $state();
  let inputEl: HTMLInputElement | undefined = $state();

  $effect(() => {
    // re-run whenever a line is added, then pin the scroll to the bottom
    if (lines.length && bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;
  });

  const print = (line: string) => lines.push(parseSegments(line));

  function exec(cmd: string) {
    if (!cmd) {
      print(`[muted]${prompt}[/muted]`);
      return;
    }
    print(`[muted]${prompt}[/muted] [cmd]${cmd}[/cmd]`);

    if (cmd === 'help' || cmd === '?') {
      print(
        '[muted]available:[/muted] ' +
          Object.keys(commands)
            .map((k) => `[pre]${k}[/pre]`)
            .join('  '),
      );
      return;
    }
    if (cmd === 'clear') {
      lines = [];
      return;
    }

    let out = commands[cmd];
    if (!out) {
      const key = Object.keys(commands).find(
        (k) =>
          cmd === k ||
          (cmd.startsWith(k.split(' ')[0] + ' ') &&
            k.split(' ').slice(0, 2).join(' ') ===
              cmd.split(' ').slice(0, 2).join(' ')),
      );
      if (key) out = commands[key];
    }
    if (!out) {
      print(
        `[err]${cmd.split(' ')[0]}: command not found[/err] [muted]— type 'help'[/muted]`,
      );
      return;
    }
    (Array.isArray(out) ? out : [out]).forEach(print);
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      const v = input.trim();
      input = '';
      exec(v);
    }
  }

  function playDemo() {
    if (!demo) return;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) {
      exec(demo);
      return;
    }
    inputEl?.focus();
    let i = 0;
    input = '';
    const cmd = demo;
    const tick = () => {
      if (i <= cmd.length) {
        input = cmd.slice(0, i);
        i++;
        setTimeout(tick, 38);
      } else {
        setTimeout(() => {
          input = '';
          exec(cmd);
        }, 220);
      }
    };
    tick();
  }
</script>

<div class="term">
  <div class="tm-bar">
    <span class="d dot-r"></span>
    <span class="d dot-y"></span>
    <span class="d dot-g"></span>
    <span class="fname">{title}</span>
    <span class="sp"></span>
    {#if demo}
      <button class="tm-run" type="button" onclick={playDemo}
        >▶ Play demo</button
      >
    {/if}
  </div>
  <div class="tm-body" bind:this={bodyEl}>
    {#each lines as line (line)}
      <div class="tm-line">
        {#each line as seg (seg)}{#if seg.cls}<span class={seg.cls}
              >{seg.text}</span
            >{:else}{seg.text}{/if}{/each}
      </div>
    {/each}
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="tm-input" onclick={() => inputEl?.focus()}>
    <span class="pre">{prompt}</span>
    <input
      type="text"
      spellcheck="false"
      autocomplete="off"
      placeholder={`type a command… (try: ${hint})`}
      bind:this={inputEl}
      bind:value={input}
      onkeydown={onKeydown}
    />
    <span class="blink"></span>
  </div>
</div>

<style>
  .term {
    background: var(--code-bg);
    border-radius: var(--radius-150);
    overflow: hidden;
    border: 1px solid var(--code-border);
    box-shadow: var(--shadow-md);
    font-family: var(--mono);
    display: block;
  }

  .tm-bar {
    display: flex;
    align-items: center;
    gap: var(--space-100);
    padding: var(--space-100) var(--space-200);
    background: var(--code-bar);
    border-bottom: 1px solid var(--code-hairline);
  }

  .tm-bar .d {
    width: 11px;
    height: 11px;
    border-radius: var(--radius-full);
  }

  .tm-bar .fname {
    margin-left: var(--space-100);
    font-size: 12px;
    color: var(--code-fname);
  }

  .tm-bar .sp {
    flex: 1;
  }

  .tm-run {
    font-family: var(--label);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border-radius: var(--radius-100);
    padding: var(--space-100) var(--space-150);
    border: 1px solid transparent;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    gap: var(--space-100);
    background: var(--code-amber);
    color: var(--code-bg);
  }

  .tm-run:hover {
    background: var(--code-amber-strong);
  }

  .tm-body {
    padding: var(--space-200);
    font-size: 13px;
    line-height: 1.8;
    color: var(--code-text-dim);
    min-height: 120px;
    max-height: 340px;
    overflow-y: auto;
  }

  .tm-line {
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }

  /* segment colours are applied via dynamically-set classes */
  .tm-body :global(.ok) {
    color: var(--term-ok);
  }

  .tm-body :global(.warn) {
    color: var(--term-warn);
  }

  .tm-body :global(.err) {
    color: var(--term-err);
  }

  .tm-body :global(.muted) {
    color: var(--term-muted);
  }

  .tm-body :global(.cmd) {
    color: var(--term-cmd);
  }

  .tm-body :global(.pre) {
    color: var(--term-cyan);
  }

  .tm-input {
    display: flex;
    align-items: center;
    gap: var(--space-100);
    padding: 0 var(--space-200) var(--space-200);
  }

  .tm-input .pre {
    color: var(--term-cyan);
    font-size: 13px;
  }

  .tm-input input {
    flex: 1;
    background: transparent;
    border: 0;
    outline: 0;
    color: var(--term-cmd);
    font-family: var(--mono);
    font-size: 13px;
  }

  .blink {
    display: inline-block;
    width: 8px;
    height: 15px;
    background: var(--code-amber);
    vertical-align: -2px;
    animation: tmblink 1.1s steps(1) infinite;
  }

  @keyframes tmblink {
    50% {
      opacity: 0;
    }
  }
</style>
