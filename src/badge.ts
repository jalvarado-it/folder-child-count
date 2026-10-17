import type { TFolder } from 'obsidian';
import { countChildren } from './folder-count';
import type { FolderChildCountSettings } from './settings';

/** Class name of the badge appended to folder titles. */
export const BADGE_CLASS = 'folder-child-count';

function applyAppearance(
	badge: HTMLElement,
	settings: FolderChildCountSettings,
): void {
	badge.classList.toggle(
		`${BADGE_CLASS}--plain`,
		settings.variant === 'plain',
	);
	badge.classList.toggle(
		`${BADGE_CLASS}--outline`,
		settings.variant === 'outline',
	);
	badge.classList.toggle(`${BADGE_CLASS}--small`, settings.size === 'small');
	badge.classList.toggle(`${BADGE_CLASS}--large`, settings.size === 'large');
	badge.classList.toggle(`${BADGE_CLASS}--bold`, settings.bold);
	badge.classList.toggle(`${BADGE_CLASS}--hover`, settings.showOnHover);

	if (settings.customColor && settings.color) {
		badge.style.setProperty('--fcc-color', settings.color);
	} else {
		badge.style.removeProperty('--fcc-color');
	}
}

/**
 * Remove every count badge inside the given root element.
 *
 * Used on unload so disabling the plugin leaves no stale badges behind.
 */
export function removeBadges(root: ParentNode): void {
	root.querySelectorAll(`.${BADGE_CLASS}`).forEach((el) => el.remove());
}

/**
 * Create, update or remove the child-count badge inside a folder title element.
 *
 * Idempotent: calling it repeatedly reuses the existing badge instead of
 * appending duplicates.
 */
export function updateFolderBadge(
	titleEl: HTMLElement,
	folder: TFolder,
	settings: FolderChildCountSettings,
	isIgnored: (path: string) => boolean = () => false,
): void {
	const existing = titleEl.querySelector<HTMLElement>('.' + BADGE_CLASS);

	if (!settings.enabled || isIgnored(folder.path)) {
		existing?.remove();
		return;
	}

	const count = countChildren(folder, settings.mode, isIgnored);
	if (count === 0 && settings.hideWhenZero) {
		existing?.remove();
		return;
	}

	const badge = existing ?? titleEl.createSpan({ cls: BADGE_CLASS });
	applyAppearance(badge, settings);
	badge.setText(String(count));
}
