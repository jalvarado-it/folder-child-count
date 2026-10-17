import { describe, expect, it } from 'vitest';
import { compileIgnoreRules } from '../src/ignore';
import { DEFAULT_SETTINGS } from '../src/settings';
import type { FolderChildCountSettings } from '../src/settings';

function settings(
	overrides: Partial<FolderChildCountSettings> = {},
): FolderChildCountSettings {
	return { ...DEFAULT_SETTINGS, ignoreFolders: true, ...overrides };
}

describe('compileIgnoreRules', () => {
	it('matches nothing when the feature is disabled', () => {
		const matcher = compileIgnoreRules({
			...DEFAULT_SETTINGS,
			ignoreFolders: false,
			ignorePaths: 'Archive',
		});
		expect(matcher.isIgnored('Archive')).toBe(false);
		expect(matcher.ruleCount).toBe(0);
	});

	it('matches exact paths, ignoring leading/trailing slashes', () => {
		const matcher = compileIgnoreRules(
			settings({ ignorePaths: '/Archive/2023/\nProjects' }),
		);
		expect(matcher.isIgnored('Archive/2023')).toBe(true);
		expect(matcher.isIgnored('Projects')).toBe(true);
		expect(matcher.isIgnored('Archive')).toBe(false);
		expect(matcher.isIgnored('Archive/2023/Nested')).toBe(false);
		expect(matcher.ruleCount).toBe(2);
	});

	it('matches the vault root path', () => {
		const matcher = compileIgnoreRules(settings({ ignorePaths: '/' }));
		expect(matcher.isIgnored('/')).toBe(true);
		expect(matcher.isIgnored('Anything')).toBe(false);
	});

	it('matches by regular expression', () => {
		const matcher = compileIgnoreRules(
			settings({ ignoreRegex: '^Archive(/|$)\n\\.trash$' }),
		);
		expect(matcher.isIgnored('Archive')).toBe(true);
		expect(matcher.isIgnored('Archive/2023')).toBe(true);
		expect(matcher.isIgnored('My.trash')).toBe(true);
		expect(matcher.isIgnored('Notes')).toBe(false);
	});

	it('skips blank lines and comments', () => {
		const matcher = compileIgnoreRules(
			settings({ ignorePaths: '\n# a comment\n\nArchive\n' }),
		);
		expect(matcher.ruleCount).toBe(1);
		expect(matcher.isIgnored('Archive')).toBe(true);
	});

	it('reports invalid regexes but keeps the valid ones', () => {
		const matcher = compileIgnoreRules(settings({ ignoreRegex: '(\nValid' }));
		expect(matcher.invalidRegexes).toEqual(['(']);
		expect(matcher.isIgnored('Valid')).toBe(true);
		expect(matcher.ruleCount).toBe(1);
	});

	it('returns an empty matcher when there are no rules', () => {
		const matcher = compileIgnoreRules(settings());
		expect(matcher.isIgnored('Anything')).toBe(false);
		expect(matcher.ruleCount).toBe(0);
		expect(matcher.invalidRegexes).toEqual([]);
	});
});
