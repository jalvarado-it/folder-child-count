import { TFile, TFolder } from 'obsidian';

// At runtime these resolve to `tests/obsidian-mock.ts`, so they are
// constructible without Obsidian's real (argument-heavy) constructors.
const MockFile = TFile as unknown as new () => TFile;
const MockFolder = TFolder as unknown as new () => TFolder;

/** Build a fake file. */
export function file(): TFile {
	return new MockFile();
}

/** Build a fake folder with the given direct children. */
export function folder(...children: Array<TFile | TFolder>): TFolder {
	const result = new MockFolder();
	(result as unknown as { children: Array<TFile | TFolder> }).children =
		children;
	return result;
}
