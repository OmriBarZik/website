// Delegated "Copy" handler for static code blocks. Imported once; works for
// every .codeblock on the page.
if (!(window as any).__copyWired) {
	(window as any).__copyWired = true;
	document.addEventListener('click', (e) => {
		const btn = (e.target as HTMLElement)?.closest<HTMLButtonElement>(
			'.codeblock .copy',
		);
		if (!btn) return;
		const body = btn
			.closest('.codeblock')
			?.querySelector('pre[class*="language-"], .codebody');
		if (!body) return;
		navigator.clipboard?.writeText((body as HTMLElement).innerText);
		const prev = btn.textContent;
		btn.textContent = 'Copied ✓';
		setTimeout(() => (btn.textContent = prev), 1400);
	});
}
