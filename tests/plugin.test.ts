import { describe, expect, it, vi } from 'vitest';
import { App, PluginManifest } from 'obsidian';
import FolderChildCountPlugin from '../src/main';
import { DEFAULT_SETTINGS } from '../src/settings';
import { file, fileAt, folder, folderAt } from './helpers';

const BADGE = '.folder-child-count';

interface Harness {
	app: App;
	container: HTMLElement;
	setFolder(path: string, value: unknown): void;
	addTitle(path: string): HTMLElement;
	closeExplorer(): void;
}

/** Fake `App` wired to a single file-explorer container. */
function harness(): Harness {
	const container = document.body.createDiv({ cls: 'workspace-leaf' });
	const folders = new Map<string, unknown>();
	let open = true;

	const workspace = {
		getLeavesOfType: (): Array<{ view: { containerEl: HTMLElement } }> =>
			open ? [{ view: { containerEl: container } }] : [],
		onLayoutReady: (cb: () => void): void => cb(),
		on: (): unknown => ({}),
	};
	const vault = {
		getAbstractFileByPath: (path: string): unknown => folders.get(path) ?? null,
		on: (): unknown => ({}),
	};

	return {
		app: { workspace, vault } as unknown as App,
		container,
		setFolder: (path, value) => folders.set(path, value),
		addTitle: (path) =>
			container.createDiv({
				cls: 'nav-folder-title',
				attr: { 'data-path': path },
			}),
		closeExplorer: () => {
			open = false;
		},
	};
}

function makePlugin(app: App): FolderChildCountPlugin {
	const plugin = new FolderChildCountPlugin(app, {} as PluginManifest);
	plugin.settings = { ...DEFAULT_SETTINGS };
	return plugin;
}

describe('FolderChildCountPlugin', () => {
	it('adds a badge for each folder present in the explorer', () => {
		const h = harness();
		h.setFolder('A', folder(file(), folder()));
		const titleEl = h.addTitle('A');

		makePlugin(h.app).refreshAll();

		expect(titleEl.querySelector(BADGE)?.textContent).toBe('2');
	});

	it('ignores titles whose path is not a folder', () => {
		const h = harness();
		const titleEl = h.addTitle('note.md');

		makePlugin(h.app).refreshAll();

		expect(titleEl.querySelector(BADGE)).toBeNull();
	});

	it('updates an existing badge when the folder contents change', () => {
		const h = harness();
		const titleEl = h.addTitle('A');
		const plugin = makePlugin(h.app);

		h.setFolder('A', folder(file()));
		plugin.refreshAll();
		expect(titleEl.querySelector(BADGE)?.textContent).toBe('1');

		h.setFolder('A', folder(file(), file()));
		plugin.refreshAll();
		expect(titleEl.querySelectorAll(BADGE).length).toBe(1);
		expect(titleEl.querySelector(BADGE)?.textContent).toBe('2');
	});

	it('removes badges when counting is disabled', () => {
		const h = harness();
		h.setFolder('A', folder(file()));
		const titleEl = h.addTitle('A');
		const plugin = makePlugin(h.app);

		plugin.refreshAll();
		expect(titleEl.querySelector(BADGE)).not.toBeNull();

		plugin.settings.enabled = false;
		plugin.refreshAll();
		expect(titleEl.querySelector(BADGE)).toBeNull();
	});

	it('badges folders rendered later, via the MutationObserver', async () => {
		const h = harness();
		const plugin = new FolderChildCountPlugin(h.app, {} as PluginManifest);
		await plugin.onload();

		// Simulate Obsidian rendering a new folder after load.
		h.setFolder('B', folder(file(), file(), file()));
		const late = h.addTitle('B');

		await vi.waitFor(() => {
			expect(late.querySelector(BADGE)?.textContent).toBe('3');
		});

		plugin.onunload();
	});

	// SEC-01: disabling the plugin must not leave stale badges behind.
	it('removes badges from the DOM on unload', async () => {
		const h = harness();
		h.setFolder('A', folder(file(), file()));
		const titleEl = h.addTitle('A');
		const plugin = new FolderChildCountPlugin(h.app, {} as PluginManifest);

		await plugin.onload();
		expect(titleEl.querySelector(BADGE)).not.toBeNull();

		plugin.onunload();
		expect(titleEl.querySelector(BADGE)).toBeNull();
	});

	// SEC-02: a debounced refresh must not revive the plugin after unload.
	it('does nothing when refreshed after unload', async () => {
		const h = harness();
		h.setFolder('A', folder(file()));
		const titleEl = h.addTitle('A');
		const plugin = new FolderChildCountPlugin(h.app, {} as PluginManifest);

		await plugin.onload();
		plugin.onunload();
		plugin.refreshAll();

		expect(titleEl.querySelector(BADGE)).toBeNull();
	});

	// SEC-03: closing a file explorer must release its observer.
	it('stops observing a file explorer that was removed', async () => {
		const h = harness();
		h.setFolder('A', folder(file()));
		const plugin = new FolderChildCountPlugin(h.app, {} as PluginManifest);
		await plugin.onload();

		const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
		h.closeExplorer();
		plugin.refreshAll();

		expect(disconnect).toHaveBeenCalled();
		disconnect.mockRestore();
	});

	it('hides ignored folders and excludes them from parent counts', () => {
		const h = harness();
		h.setFolder(
			'root',
			folderAt('root', fileAt('root/a.md'), folderAt('Archive')),
		);
		h.setFolder('Archive', folderAt('Archive', fileAt('Archive/x.md')));
		const rootTitle = h.addTitle('root');
		const archiveTitle = h.addTitle('Archive');

		const plugin = makePlugin(h.app);
		plugin.settings.ignoreFolders = true;
		plugin.settings.ignorePaths = 'Archive';
		plugin.refreshAll();

		expect(rootTitle.querySelector(BADGE)?.textContent).toBe('1');
		expect(archiveTitle.querySelector(BADGE)).toBeNull();
	});
});
