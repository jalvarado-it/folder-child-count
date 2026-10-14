import type { TFolder } from 'obsidian';
import { countChildren } from './folder-count';
import type { FolderChildCountSettings } from './settings';

/** Class name of the badge appended to folder titles. */
export const BADGE_CLASS = 'folder-child-count';

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
): void {
	const existing = titleEl.querySelector<HTMLElement>('.' + BADGE_CLASS);

	if (!settings.enabled) {
		existing?.remove();
		return;
	}

	const count = countChildren(folder, settings.mode);
	if (count === 0 && settings.hideWhenZero) {
		existing?.remove();
		return;
	}

	const badge = existing ?? titleEl.createSpan({ cls: BADGE_CLASS });
	badge.setText(String(count));
}
