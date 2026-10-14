/**
 * Minimal stand-ins for the Obsidian runtime classes used by the source under
 * test. Vitest aliases the `obsidian` package to this file (see
 * `vitest.config.ts`) because the real package only ships type declarations.
 */

export class TFile {
	path = '';
}

export class TFolder {
	path = '';
	children: Array<TFile | TFolder> = [];
}
