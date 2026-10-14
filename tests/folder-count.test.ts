import { describe, expect, it } from 'vitest';
import { TFile, TFolder } from 'obsidian';
import { countChildren } from '../src/folder-count';

// At runtime these resolve to `tests/obsidian-mock.ts`, so they are
// constructible without Obsidian's real (argument-heavy) constructors.
const MockFile = TFile as unknown as new () => TFile;
const MockFolder = TFolder as unknown as new () => TFolder;

function file(): TFile {
	return new MockFile();
}

function folder(...children: Array<TFile | TFolder>): TFolder {
	const folder = new MockFolder();
	(folder as unknown as { children: Array<TFile | TFolder> }).children =
		children;
	return folder;
}

describe('countChildren', () => {
	it('counts every child when mode is "all"', () => {
		expect(countChildren(folder(file(), file(), folder()), 'all')).toBe(3);
	});

	it('counts only files when mode is "files"', () => {
		expect(countChildren(folder(file(), folder(), file()), 'files')).toBe(2);
	});

	it('counts only folders when mode is "folders"', () => {
		expect(countChildren(folder(file(), folder(), folder()), 'folders')).toBe(
			2,
		);
	});

	it('returns 0 for an empty folder', () => {
		expect(countChildren(folder(), 'all')).toBe(0);
		expect(countChildren(folder(), 'files')).toBe(0);
		expect(countChildren(folder(), 'folders')).toBe(0);
	});

	it('counts direct children only, not nested descendants', () => {
		const nested = folder(file(), file());
		expect(countChildren(folder(nested), 'all')).toBe(1);
		expect(countChildren(folder(nested), 'files')).toBe(0);
		expect(countChildren(folder(nested), 'folders')).toBe(1);
	});
});
