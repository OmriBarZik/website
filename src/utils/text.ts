/** Turn `inline code` (backticks) into <code> for rich standfirsts/excerpts. */
export const mdInline = (s: string) =>
	s.replace(/`([^`]+)`/g, '<code>$1</code>');

/** Strip backticks for plain-text contexts (meta description, etc.). */
export const stripInline = (s: string) => s.replace(/`/g, '');

/**
 * Decode the HTML-escaped string returned by `Astro.slots.render()` back into
 * raw source text, so component children (code) can be passed as a prop.
 * `&amp;` is decoded last so sequences like `&amp;lt;` survive intact.
 */
export const decodeEntities = (s: string) =>
	s
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&');
