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

function setPath<T extends TFile | TFolder>(node: T, path: string): T {
	(node as unknown as { path: string }).path = path;
	return node;
}

/** Build a fake folder at a specific path. */
export function folderAt(
	path: string,
	...children: Array<TFile | TFolder>
): TFolder {
	return setPath(folder(...children), path);
}

/** Build a fake file at a specific path. */
export function fileAt(path: string): TFile {
	return setPath(file(), path);
}
