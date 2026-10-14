import { describe, expect, it } from 'vitest';
import { BADGE_CLASS, removeBadges, updateFolderBadge } from '../src/badge';
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

	it('applies a custom color when enabled', () => {
		const el = title();
		updateFolderBadge(
			el,
			folder(file()),
			settings({ customColor: true, color: '#ff0000' }),
		);
		const badge = el.querySelector<HTMLElement>('.' + BADGE_CLASS);
		expect(badge?.style.getPropertyValue('--fcc-color')).toBe('#ff0000');
	});

	it('falls back to the theme color when customColor is off', () => {
		const el = title();
		updateFolderBadge(el, folder(file()), settings({ color: '#ff0000' }));
		const badge = el.querySelector<HTMLElement>('.' + BADGE_CLASS);
		expect(badge?.style.getPropertyValue('--fcc-color')).toBe('');
	});

	it('applies variant, size, bold and hover classes', () => {
		const el = title();
		updateFolderBadge(
			el,
			folder(file()),
			settings({
				variant: 'outline',
				size: 'large',
				bold: true,
				showOnHover: true,
			}),
		);
		const badge = el.querySelector<HTMLElement>('.' + BADGE_CLASS);
		expect(badge?.classList.contains(`${BADGE_CLASS}--outline`)).toBe(true);
		expect(badge?.classList.contains(`${BADGE_CLASS}--large`)).toBe(true);
		expect(badge?.classList.contains(`${BADGE_CLASS}--bold`)).toBe(true);
		expect(badge?.classList.contains(`${BADGE_CLASS}--hover`)).toBe(true);
	});

	it('clears appearance classes when settings return to defaults', () => {
		const el = title();
		updateFolderBadge(
			el,
			folder(file()),
			settings({
				variant: 'plain',
				size: 'small',
				bold: true,
				showOnHover: true,
				customColor: true,
				color: '#ff0000',
			}),
		);
		updateFolderBadge(el, folder(file()), settings());
		const badge = el.querySelector<HTMLElement>('.' + BADGE_CLASS);
		expect(badge?.classList.contains(`${BADGE_CLASS}--plain`)).toBe(false);
		expect(badge?.classList.contains(`${BADGE_CLASS}--small`)).toBe(false);
		expect(badge?.classList.contains(`${BADGE_CLASS}--bold`)).toBe(false);
		expect(badge?.classList.contains(`${BADGE_CLASS}--hover`)).toBe(false);
		expect(badge?.style.getPropertyValue('--fcc-color')).toBe('');
	});
});

describe('removeBadges', () => {
	it('removes every badge inside a root', () => {
		const root = document.body.createDiv();
		const first = root.createDiv({ cls: 'nav-folder-title' });
		const second = root.createDiv({ cls: 'nav-folder-title' });
		updateFolderBadge(first, folder(file()), settings());
		updateFolderBadge(second, folder(file()), settings());
		expect(root.querySelectorAll('.' + BADGE_CLASS).length).toBe(2);

		removeBadges(root);

		expect(root.querySelectorAll('.' + BADGE_CLASS).length).toBe(0);
	});
});
