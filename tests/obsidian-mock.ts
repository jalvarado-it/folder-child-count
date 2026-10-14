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

export class App {
	workspace: unknown = {};
	vault: unknown = {};
}

export const Platform = {
	isMobile: false,
	isDesktop: true,
};

/** Only needed so `settings.ts` can be imported by tests. */
export class PluginSettingTab {
	app: App;
	plugin: unknown;
	containerEl!: HTMLElement;

	constructor(app: App, plugin: unknown) {
		this.app = app;
		this.plugin = plugin;
	}

	refreshDomState(): void {}
	update(): void {}
}

/** Trailing-edge debounce, matching the behavior the plugin relies on. */
export function debounce<A extends unknown[]>(
	cb: (...args: A) => void,
	timeout = 0,
): (...args: A) => void {
	let handle: number | undefined;
	return (...args: A): void => {
		if (handle !== undefined) {
			window.clearTimeout(handle);
		}
		handle = window.setTimeout(() => {
			handle = undefined;
			cb(...args);
		}, timeout);
	};
}

/** Minimal `Plugin` base class covering the API the plugin actually calls. */
export class Plugin {
	app: App;
	manifest: unknown;

	private data: unknown;

	constructor(app: App, manifest: unknown) {
		this.app = app;
		this.manifest = manifest;
	}

	async loadData(): Promise<unknown> {
		return this.data;
	}

	async saveData(data: unknown): Promise<void> {
		this.data = data;
	}

	addSettingTab(_tab: unknown): void {}
	registerEvent(_ref: unknown): void {}
	addCommand(_command: unknown): void {}
}
