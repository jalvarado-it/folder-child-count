import { App, Platform, PluginSettingTab } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import type FolderChildCountPlugin from './main';

/** Which items inside a folder should be counted. */
export type CountMode = 'all' | 'files' | 'folders';

/** Visual style of the count badge. */
export type BadgeVariant = 'default' | 'plain' | 'outline';

/** Size of the count badge. */
export type BadgeSize = 'small' | 'normal' | 'large';

export interface FolderChildCountSettings {
	/** Master switch: show or hide the counters. */
	enabled: boolean;
	/** What to count in each folder. */
	mode: CountMode;
	/** Hide the badge entirely when the count is zero. */
	hideWhenZero: boolean;
	/** Use a custom text color instead of the theme's muted text color. */
	customColor: boolean;
	/** Hex color, used when `customColor` is enabled. */
	color: string;
	/** Badge style. */
	variant: BadgeVariant;
	/** Badge size. */
	size: BadgeSize;
	/** Render the count in bold. */
	bold: boolean;
	/** Only show the count while hovering the folder row. */
	showOnHover: boolean;
}

export const DEFAULT_SETTINGS: FolderChildCountSettings = {
	enabled: true,
	mode: 'all',
	hideWhenZero: false,
	customColor: false,
	color: '#8a8a8a',
	variant: 'default',
	size: 'normal',
	bold: false,
	showOnHover: false,
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
			{
				type: 'group',
				heading: 'Appearance',
				items: [
					{
						name: 'Use a custom color',
						desc: 'Pick a color instead of the theme text color.',
						control: {
							type: 'toggle',
							key: 'customColor',
							defaultValue: DEFAULT_SETTINGS.customColor,
						},
					},
					{
						name: 'Color',
						desc: 'Text color of the count.',
						visible: () => this.plugin.settings.customColor,
						control: {
							type: 'color',
							key: 'color',
							defaultValue: DEFAULT_SETTINGS.color,
						},
					},
					{
						name: 'Style',
						desc: 'How the count badge looks.',
						control: {
							type: 'dropdown',
							key: 'variant',
							defaultValue: DEFAULT_SETTINGS.variant,
							options: {
								default: 'Badge (default)',
								plain: 'Plain text',
								outline: 'Outline',
							},
						},
					},
					{
						name: 'Size',
						desc: 'Text size of the count.',
						control: {
							type: 'dropdown',
							key: 'size',
							defaultValue: DEFAULT_SETTINGS.size,
							options: {
								small: 'Small',
								normal: 'Normal',
								large: 'Large',
							},
						},
					},
					{
						name: 'Bold',
						desc: 'Render the count in bold.',
						control: {
							type: 'toggle',
							key: 'bold',
							defaultValue: DEFAULT_SETTINGS.bold,
						},
					},
					{
						name: 'Show only on hover',
						desc: 'Reveal the count when hovering over the folder row.',
						visible: () => !Platform.isMobile,
						control: {
							type: 'toggle',
							key: 'showOnHover',
							defaultValue: DEFAULT_SETTINGS.showOnHover,
						},
					},
				],
			},
		];
	}

	getControlValue(key: string): unknown {
		return this.plugin.settings[key as keyof FolderChildCountSettings];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		(this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
		await this.plugin.saveSettings();
		// Re-evaluate `visible` predicates (e.g. the color picker).
		this.refreshDomState();
		this.plugin.refreshAll();
	}
}
