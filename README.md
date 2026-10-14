# Folder Child Count

[![CI](https://github.com/jalvarado-it/folder-child-count/actions/workflows/ci.yml/badge.svg)](https://github.com/jalvarado-it/folder-child-count/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/jalvarado-it/folder-child-count?sort=semver)](https://github.com/jalvarado-it/folder-child-count/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An [Obsidian](https://obsidian.md) plugin that shows the number of files and
subfolders contained in each folder, right next to the folder name in the file
explorer.

## Features

- Shows a small count badge next to every folder in the file explorer.
- Count **files and folders**, **files only**, or **folders only**.
- Optionally hide the badge for empty folders.
- Customizable color, style (badge / plain / outline), size and bold.
- Optionally show the count only while hovering a folder.
- Updates automatically when files/folders are created, deleted or renamed.
- Works on desktop and mobile.

## Usage

1. Enable the plugin in **Settings → Community plugins**.
2. Open the file explorer: each folder now shows its child count.
3. Configure it under **Settings → Folder Child Count**.

## Customization

The count can be styled from the plugin settings or with a CSS snippet.

### From settings

Under **Settings → Folder Child Count → Appearance**:

| Setting | What it does |
| --- | --- |
| Use a custom color | Use your own color instead of the theme's muted text color. |
| Color | The color to use (shown when "Use a custom color" is on). |
| Style | `Badge` (default), `Plain text` (no background) or `Outline`. |
| Size | `Small`, `Normal` or `Large`. |
| Bold | Render the count in bold. |
| Show only on hover | Reveal the count when hovering the folder row (desktop only). |

### With a CSS snippet

Create `<your-vault>/.obsidian/snippets/folder-count.css` and enable it under
**Settings → Appearance → CSS snippets**:

```css
.folder-child-count {
	color: var(--text-accent);
	background-color: transparent;
	font-weight: 600;
	font-family: var(--font-monospace);
	font-size: 0.7em;
}

/* Reveal the count only while hovering a folder */
.nav-folder-title .folder-child-count {
	opacity: 0;
	transition: opacity 120ms ease-in-out;
}
.nav-folder-title:hover .folder-child-count {
	opacity: 1;
}
```

By default the badge uses Obsidian's CSS variables, so it follows your theme
without extra effort.

## Requirements

- Obsidian **1.13.0** or later.
- Node.js **24** or later (development only; see `.nvmrc`).

The plugin's settings tab is built with Obsidian's declarative settings API
(`getSettingDefinitions`, available since 1.13.0), which keeps the settings
searchable and avoids the deprecated imperative `display()` method. If you need
to support older app versions, you can lower `minAppVersion` in `manifest.json`
and add a `display()` fallback that renders the same options with `new Setting()`.

## Development

This project uses TypeScript and [esbuild](https://esbuild.github.io/).

```bash
# Install dependencies
npm install

# Compile and watch for changes (development)
npm run dev

# Run the unit tests
npm run test

# Type-check and produce a production build
npm run build

# Lint the source
npm run lint
```

### Testing in a vault

The built plugin must live in the vault's plugins folder:

```
<your-vault>/.obsidian/plugins/folder-child-count/
```

There is a helper script that builds the destination folder and links the
required files (`main.js`, `manifest.json`, `styles.css`) for you:

```bash
npm run build
npm run install:vault -- /path/to/your/vault
# or set the path once:
OBSIDIAN_VAULT=/path/to/your/vault npm run install:vault

# copy real files instead of symlinks:
npm run install:vault -- /path/to/your/vault --copy
```

By default the files are **symlinked**, so `npm run dev` rebuilds are picked up
as soon as you reload Obsidian (`Ctrl/Cmd + R`). Then enable the plugin under
**Settings → Community plugins**.

### Project structure

```
.
├── src/
│   ├── main.ts          # Plugin entry point, file-explorer integration, observers
│   ├── badge.ts         # Renders the count badge in a folder title
│   ├── settings.ts      # Settings interface, defaults and settings tab
│   └── folder-count.ts  # Pure counting logic
├── tests/
│   ├── folder-count.test.ts  # Unit tests for the counting logic
│   ├── badge.test.ts         # DOM tests for the badge (jsdom)
│   ├── plugin.test.ts        # Integration tests for main.ts + observers
│   ├── helpers.ts            # Test factories for folders/files
│   ├── obsidian-mock.ts      # Runtime stub for the types-only obsidian package
│   └── setup-dom.ts          # jsdom shim for Obsidian's DOM helpers
├── .github/             # CI, release workflow, templates and FUNDING
├── esbuild.config.mjs   # Build configuration
├── vitest.config.ts     # Test configuration
├── manifest.json        # Obsidian plugin manifest
├── styles.css           # Badge styling
└── versions.json        # Version -> minimum app version map
```

### Testing

Tests run with [Vitest](https://vitest.dev/) in a `jsdom` environment. The
`obsidian` package only ships type declarations, so:

- `vitest.config.ts` aliases `obsidian` to `tests/obsidian-mock.ts`, a tiny
  runtime stub exposing the classes the source imports.
- `tests/setup-dom.ts` shims the handful of `Element.prototype` helpers Obsidian
  adds (`createSpan`, `createDiv`, `setText`) so `badge.ts` runs under jsdom.

```bash
npm run test         # run once
npm run test:watch   # watch mode
```

### Continuous integration

- `.github/workflows/ci.yml` runs lint, tests and build on pushes and pull
  requests.
- `.github/workflows/release.yml` builds and publishes a GitHub release when a
  tag is pushed (the tag must match `manifest.json`'s `version`).

## Releasing

1. Update the version with `npm version patch|minor|major` (this runs
   `version-bump.mjs` to keep `manifest.json` and `versions.json` in sync).
2. Tag and push. The release workflow builds, attests and publishes:

   ```bash
   npm version patch        # updates manifest.json + versions.json
   git push --follow-tags
   ```

   `npm version` also commits the bumped `manifest.json`/`versions.json` and
   creates the `vX.Y.Z` tag (the workflow accepts an optional leading `v`).

   `.github/workflows/release.yml` runs the tests and build, generates a signed
   **build provenance attestation** (GitHub Artifact Attestations, backed by
   Sigstore) plus a `SHA256SUMS` file, and creates the release with `main.js`,
   `manifest.json`, `styles.css` and `SHA256SUMS`.

### Verifying a signed release

Attestations are keyless and bound to this repository's release workflow.
Anyone can verify that a downloaded asset was produced by this repo's CI from
the tagged commit:

```bash
gh attestation verify main.js --repo <owner>/<repo>
gh attestation verify manifest.json --repo <owner>/<repo>
gh attestation verify styles.css --repo <owner>/<repo>
```

A successful check means the file's digest matches the attested build and that
the provenance was issued by a workflow in that repository. For an additional
layer of trust you can also sign the release tags with GPG (`git tag -s v1.0.0`).

#### Checksums

Each release also ships a `SHA256SUMS` file (generated with `npm run checksums`).
Verify the downloaded artifacts against it:

```bash
# Linux
sha256sum --check SHA256SUMS
# macOS
shasum -a 256 --check SHA256SUMS
```

## Security

An authorized security self-assessment (source review, dependency audit,
supply-chain review and secret scanning) is documented in
[`pentest/final-report.md`](pentest/final-report.md).

## License

[MIT](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development setup and
guidelines.
