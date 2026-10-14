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
// Obsidian plugin ids are lowercase alphanumeric with dashes. Rejecting anything
// else keeps the id safe to use as a single path segment.
const PLUGIN_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function fail(message) {
	console.error(`\n\u2717 ${message}\n`);
	process.exit(1);
}

function expandTilde(input) {
	return input.replace(/^~(?=$|[/\\])/, process.env.HOME ?? '~');
}

/** True if the path exists, including as a (possibly broken) symlink. */
function pathExists(path) {
	try {
		lstatSync(path);
		return true;
	} catch {
		return false;
	}
}

function installFile(source, target, copy) {
	if (pathExists(target)) {
		// lstatSync does not follow symlinks, so a link to a directory is
		// replaced rather than treated as a real directory.
		if (lstatSync(target).isDirectory()) {
			fail(`"${target}" is a directory; remove it manually and try again.`);
		}
		rmSync(target, { force: true });
	}

	try {
		if (copy) {
			copyFileSync(source, target);
		} else {
			symlinkSync(source, target);
		}
	} catch (error) {
		fail(`Could not write "${target}": ${error.message}`);
	}
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
if (typeof manifest.id !== 'string' || !PLUGIN_ID_PATTERN.test(manifest.id)) {
	fail(`Refusing to install unsafe plugin id: ${JSON.stringify(manifest.id)}`);
}

const destDir = join(vaultPath, '.obsidian', 'plugins', manifest.id);
mkdirSync(destDir, { recursive: true });

for (const file of FILES) {
	installFile(join(ROOT, file), join(destDir, file), copy);
}

console.log(
	`\u2713 ${copy ? 'Copied' : 'Linked'} ${manifest.id} v${manifest.version} to:\n  ${destDir}`,
);
if (!copy) {
	console.log('  Run "npm run dev" to rebuild on change, then reload Obsidian.');
}
console.log('  Enable it under Settings \u2192 Community plugins.');
