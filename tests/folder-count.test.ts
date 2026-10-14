import { describe, expect, it } from 'vitest';
import { countChildren } from '../src/folder-count';
import { file, folder } from './helpers';

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
