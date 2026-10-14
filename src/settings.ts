import { App, PluginSettingTab } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import type FolderChildCountPlugin from './main';

/** Which items inside a folder should be counted. */
export type CountMode = 'all' | 'files' | 'folders';

export interface FolderChildCountSettings {
	/** Master switch: show or hide the counters. */
	enabled: boolean;
	/** What to count in each folder. */
	mode: CountMode;
	/** Hide the badge entirely when the count is zero. */
	hideWhenZero: boolean;
}

export const DEFAULT_SETTINGS: FolderChildCountSettings = {
	enabled: true,
	mode: 'all',
	hideWhenZero: false,
};

export class FolderChildCountSettingTab extends PluginSettingTab {
	private readonly plugin: FolderChildCountPlugin;

	constructor(app: App, plugin: FolderChildCountPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Enable counts',
				desc: 'Show the number of children next to each folder.',
				control: {
					type: 'toggle',
					key: 'enabled',
					defaultValue: DEFAULT_SETTINGS.enabled,
				},
			},
			{
				name: 'Count',
				desc: 'Choose which items to count inside each folder.',
				control: {
					type: 'dropdown',
					key: 'mode',
					defaultValue: DEFAULT_SETTINGS.mode,
					options: {
						all: 'Files and folders',
						files: 'Files only',
						folders: 'Folders only',
					},
				},
			},
			{
				name: 'Hide empty folders',
				desc: 'Do not show a count when it is zero.',
				control: {
					type: 'toggle',
					key: 'hideWhenZero',
					defaultValue: DEFAULT_SETTINGS.hideWhenZero,
				},
			},
		];
	}

	getControlValue(key: string): unknown {
		return this.plugin.settings[key as keyof FolderChildCountSettings];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		(this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
		await this.plugin.saveSettings();
		this.plugin.refreshAll();
	}
}
