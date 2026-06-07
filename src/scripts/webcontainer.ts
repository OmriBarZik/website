import { WebContainer } from '@webcontainer/api';

// WebContainer.boot() is singleton-ish — calling it twice throws. Boot one
// container per page and reuse it. Lazy: nothing boots until the first Run.
let bootPromise: Promise<WebContainer> | null = null;

export function isBooted(): boolean {
	return bootPromise !== null;
}

export function bootContainer(): Promise<WebContainer> {
	if (!bootPromise) {
		if (typeof window !== 'undefined' && !window.crossOriginIsolated) {
			return Promise.reject(
				new Error(
					'This page is not cross-origin isolated, so the runtime can’t start. ' +
						'Ensure COOP/COEP response headers are set (see astro.config / public/_headers).',
				),
			);
		}
		bootPromise = WebContainer.boot();
	}
	return bootPromise;
}
