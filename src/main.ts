import { Plugin, TFolder, debounce } from 'obsidian';
import { DEFAULT_SETTINGS, FolderChildCountSettingTab } from './settings';
import type { FolderChildCountSettings } from './settings';
import { BADGE_CLASS, updateFolderBadge } from './badge';

export default class FolderChildCountPlugin extends Plugin {
	settings!: FolderChildCountSettings;

	/** One observer per file-explorer container, so counts track the DOM. */
	private readonly observers = new Map<HTMLElement, MutationObserver>();

	private readonly scheduleRefresh = debounce(() => this.refreshAll(), 100);

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new FolderChildCountSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.refreshAll();
		});

		// Keep counts in sync with the vault contents.
		this.registerEvent(this.app.vault.on('create', () => this.scheduleRefresh()));
		this.registerEvent(this.app.vault.on('delete', () => this.scheduleRefresh()));
		this.registerEvent(this.app.vault.on('rename', () => this.scheduleRefresh()));

		// Re-run when the workspace layout changes (explorer opened/closed).
		this.registerEvent(
			this.app.workspace.on('layout-change', () => this.scheduleRefresh()),
		);

		this.addCommand({
			id: 'refresh-counts',
			name: 'Refresh counts',
			callback: () => this.refreshAll(),
		});
	}

	onunload(): void {
		for (const observer of this.observers.values()) {
			observer.disconnect();
		}
		this.observers.clear();
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		) as FolderChildCountSettings;
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	/** Rewrite every visible folder badge using the current settings. */
	refreshAll(): void {
		for (const leaf of this.app.workspace.getLeavesOfType('file-explorer')) {
			const containerEl = leaf.view.containerEl;
			this.observeExplorer(containerEl);
			for (const titleEl of containerEl.querySelectorAll<HTMLElement>(
				'.nav-folder-title',
			)) {
				this.updateTitle(titleEl);
			}
		}
	}

	/** Watch a file-explorer container so newly rendered folders get badges. */
	private observeExplorer(containerEl: HTMLElement): void {
		if (this.observers.has(containerEl)) {
			return;
		}
		const observer = new MutationObserver((mutations) => {
			// Ignore the mutations we cause ourselves to avoid an endless loop.
			if (mutations.some((mutation) => !this.isOwnMutation(mutation))) {
				this.scheduleRefresh();
			}
		});
		observer.observe(containerEl, { childList: true, subtree: true });
		this.observers.set(containerEl, observer);
	}

	private updateTitle(titleEl: HTMLElement): void {
		const path = titleEl.getAttribute('data-path');
		const folder = path
			? this.app.vault.getAbstractFileByPath(path)
			: null;

		if (!(folder instanceof TFolder)) {
			titleEl.querySelector('.' + BADGE_CLASS)?.remove();
			return;
		}

		updateFolderBadge(titleEl, folder, this.settings);
	}

	private isOwnMutation(mutation: MutationRecord): boolean {
		if (this.isBadgeNode(mutation.target)) {
			return true;
		}
		for (const node of Array.from(mutation.addedNodes)) {
			if (this.isBadgeNode(node)) {
				return true;
			}
		}
		for (const node of Array.from(mutation.removedNodes)) {
			if (this.isBadgeNode(node)) {
				return true;
			}
		}
		return false;
	}

	private isBadgeNode(node: Node): boolean {
		if (node.nodeType !== Node.ELEMENT_NODE) {
			return false;
		}
		const el = node as Element;
		return (
			el.classList.contains(BADGE_CLASS) ||
			el.closest('.' + BADGE_CLASS) !== null
		);
	}
}
