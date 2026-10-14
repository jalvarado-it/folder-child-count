#!/usr/bin/env node
/**
 * Install (or link) the built plugin into an Obsidian vault.
 *
 * Usage:
 *   npm run install:vault -- /path/to/vault
 *   OBSIDIAN_VAULT=/path/to/vault npm run install:vault
 *   npm run install:vault -- /path/to/vault --copy
 *
 * By default the plugin files are symlinked, so `npm run dev` rebuilds are
 * picked up immediately. Pass `--copy` to copy regular files instead.
 */
import {
	existsSync,
	lstatSync,
	mkdirSync,
	copyFileSync,
	rmSync,
	symlinkSync,
	readFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['main.js', 'manifest.json', 'styles.css'];

function fail(message) {
	console.error(`\n\u2717 ${message}\n`);
	process.exit(1);
}

function expandTilde(input) {
	return input.replace(/^~(?=$|[/\\])/, process.env.HOME ?? '~');
}

const args = process.argv.slice(2);
const copy = args.includes('--copy');
const vaultArg = args.find((arg) => !arg.startsWith('--'));
const vault = vaultArg ?? process.env.OBSIDIAN_VAULT;

if (!vault) {
	fail(
		'No vault provided.\n' +
			'  Usage: npm run install:vault -- /path/to/vault\n' +
			'  Or set the OBSIDIAN_VAULT environment variable.',
	);
}

const vaultPath = resolve(expandTilde(vault));

if (!existsSync(join(vaultPath, '.obsidian'))) {
	fail(`Not an Obsidian vault (no ".obsidian" folder): ${vaultPath}`);
}

for (const file of FILES) {
	if (!existsSync(join(ROOT, file))) {
		fail(`Missing "${file}". Run "npm run build" first.`);
	}
}

const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'));
const destDir = join(vaultPath, '.obsidian', 'plugins', manifest.id);
mkdirSync(destDir, { recursive: true });

for (const file of FILES) {
	const source = join(ROOT, file);
	const target = join(destDir, file);

	// Remove an existing file or symlink (rmSync with force ignores ENOENT).
	try {
		if (existsSync(target) || lstatSync(target)) {
			rmSync(target, { force: true });
		}
	} catch {
		// lstatSync throws when the target does not exist; nothing to remove.
	}

	if (copy) {
		copyFileSync(source, target);
	} else {
		symlinkSync(source, target);
	}
}

console.log(
	`\u2713 ${copy ? 'Copied' : 'Linked'} ${manifest.id} v${manifest.version} to:\n  ${destDir}`,
);
if (!copy) {
	console.log('  Run "npm run dev" to rebuild on change, then reload Obsidian.');
}
console.log('  Enable it under Settings \u2192 Community plugins.');
