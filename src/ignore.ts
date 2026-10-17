import type { FolderChildCountSettings } from './settings';

/** Result of compiling the user's ignore rules into a fast matcher. */
export interface IgnoreMatcher {
	/** True when the folder path matches a path rule or a regex rule. */
	readonly isIgnored: (path: string) => boolean;
	/** Number of active rules (paths + regexes). */
	readonly ruleCount: number;
	/** Regex patterns that failed to compile and were therefore skipped. */
	readonly invalidRegexes: string[];
}

const EMPTY_MATCHER: IgnoreMatcher = {
	isIgnored: () => false,
	ruleCount: 0,
	invalidRegexes: [],
};

/**
 * Turn the raw settings into an efficient matcher.
 *
 * - `ignorePaths`: one vault-relative path per line, matched exactly.
 * - `ignoreRegex`: one JavaScript regular expression per line, tested against
 *   the folder path.
 * - Blank lines and lines starting with `#` are ignored.
 * - Invalid regular expressions are skipped and reported in `invalidRegexes`.
 *
 * The module has no runtime dependency on Obsidian so it stays easy to test.
 */
export function compileIgnoreRules(
	settings: FolderChildCountSettings,
): IgnoreMatcher {
	if (!settings.ignoreFolders) {
		return EMPTY_MATCHER;
	}

	const paths = new Set<string>();
	for (const line of splitRules(settings.ignorePaths)) {
		paths.add(normalizePath(line));
	}

	const regexes: RegExp[] = [];
	const invalidRegexes: string[] = [];
	for (const line of splitRules(settings.ignoreRegex)) {
		try {
			regexes.push(new RegExp(line));
		} catch {
			invalidRegexes.push(line);
		}
	}

	if (paths.size === 0 && regexes.length === 0) {
		return invalidRegexes.length > 0
			? { ...EMPTY_MATCHER, invalidRegexes }
			: EMPTY_MATCHER;
	}

	return {
		ruleCount: paths.size + regexes.length,
		invalidRegexes,
		isIgnored: (path: string): boolean => {
			if (paths.has(normalizePath(path))) {
				return true;
			}
			return regexes.some((regex) => regex.test(path));
		},
	};
}

function splitRules(value: string): string[] {
	return value
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line !== '' && !line.startsWith('#'));
}

/** Normalize to a vault-relative POSIX path; the vault root stays `/`. */
function normalizePath(path: string): string {
	const normalized = path.replace(/\\/g, '/').trim();
	if (normalized === '' || normalized === '/') {
		return '/';
	}
	return normalized.replace(/^\/+/, '').replace(/\/+$/, '');
}
