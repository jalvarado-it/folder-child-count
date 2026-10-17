import { TFolder, TFile } from 'obsidian';
import type { CountMode } from './settings';

/**
 * Count the direct children of a folder according to the selected mode.
 *
 * Only immediate children are counted (files and/or subfolders), not the
 * whole recursive subtree. Subfolders for which `isIgnored` returns true are
 * left out entirely; ignore rules never apply to files.
 */
export function countChildren(
	folder: TFolder,
	mode: CountMode,
	isIgnored: (path: string) => boolean = () => false,
): number {
	const children = folder.children.filter(
		(child) => !(child instanceof TFolder && isIgnored(child.path)),
	);

	switch (mode) {
		case 'files':
			return children.filter((child) => child instanceof TFile).length;
		case 'folders':
			return children.filter((child) => child instanceof TFolder).length;
		case 'all':
		default:
			return children.length;
	}
}
