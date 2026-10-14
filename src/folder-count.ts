import { TFolder, TFile } from 'obsidian';
import type { CountMode } from './settings';

/**
 * Count the direct children of a folder according to the selected mode.
 *
 * Only immediate children are counted (files and/or subfolders), not the
 * whole recursive subtree.
 */
export function countChildren(folder: TFolder, mode: CountMode): number {
	switch (mode) {
		case 'files':
			return folder.children.filter((child) => child instanceof TFile)
				.length;
		case 'folders':
			return folder.children.filter((child) => child instanceof TFolder)
				.length;
		case 'all':
		default:
			return folder.children.length;
	}
}
