import { describe, expect, it } from 'vitest';
import { BADGE_CLASS, updateFolderBadge } from '../src/badge';
import { DEFAULT_SETTINGS } from '../src/settings';
import type { FolderChildCountSettings } from '../src/settings';
import { file, folder } from './helpers';

function title(): HTMLElement {
	return document.body.createDiv({ cls: 'nav-folder-title' });
}

function settings(
	overrides: Partial<FolderChildCountSettings> = {},
): FolderChildCountSettings {
	return { ...DEFAULT_SETTINGS, ...overrides };
}

function badgeText(el: HTMLElement): string | null {
	return el.querySelector('.' + BADGE_CLASS)?.textContent ?? null;
}

describe('updateFolderBadge', () => {
	it('adds a badge with the child count', () => {
		const el = title();
		updateFolderBadge(el, folder(file(), folder()), settings());
		expect(badgeText(el)).toBe('2');
	});

	it('reuses the existing badge instead of duplicating it', () => {
		const el = title();
		updateFolderBadge(el, folder(file()), settings());
		updateFolderBadge(el, folder(file(), file(), file()), settings());
		expect(el.querySelectorAll('.' + BADGE_CLASS).length).toBe(1);
		expect(badgeText(el)).toBe('3');
	});

	it('removes the badge when disabled', () => {
		const el = title();
		updateFolderBadge(el, folder(file()), settings());
		updateFolderBadge(el, folder(file()), settings({ enabled: false }));
		expect(el.querySelector('.' + BADGE_CLASS)).toBeNull();
	});

	it('shows "0" for empty folders by default', () => {
		const el = title();
		updateFolderBadge(el, folder(), settings());
		expect(badgeText(el)).toBe('0');
	});

	it('hides the badge for empty folders when hideWhenZero is set', () => {
		const el = title();
		updateFolderBadge(el, folder(), settings({ hideWhenZero: true }));
		expect(el.querySelector('.' + BADGE_CLASS)).toBeNull();
	});

	it('respects the count mode', () => {
		const el = title();
		updateFolderBadge(
			el,
			folder(file(), folder(), folder()),
			settings({ mode: 'folders' }),
		);
		expect(badgeText(el)).toBe('2');
	});
});
