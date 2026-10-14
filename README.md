# Folder Child Count

An [Obsidian](https://obsidian.md) plugin that shows the number of files and
subfolders contained in each folder, right next to the folder name in the file
explorer.

## Features

- Shows a small count badge next to every folder in the file explorer.
- Count **files and folders**, **files only**, or **folders only**.
- Optionally hide the badge for empty folders.
- Updates automatically when files/folders are created, deleted or renamed.
- Works on desktop and mobile.

## Usage

1. Enable the plugin in **Settings → Community plugins**.
2. Open the file explorer: each folder now shows its child count.
3. Configure it under **Settings → Folder Child Count**.

## Requirements

- Obsidian **1.13.0** or later.

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

To test the plugin in a real vault, copy (or symlink) the built plugin into the
vault's plugins folder:

```
<your-vault>/.obsidian/plugins/folder-child-count/
```

At minimum that folder needs `main.js`, `manifest.json` and `styles.css`. Then
reload Obsidian and enable the plugin.

A convenient way to develop is to symlink `main.js`, `manifest.json` and
`styles.css` into the vault while `npm run dev` rebuilds them.

### Project structure

```
.
├── src/
│   ├── main.ts          # Plugin entry point, DOM badges, observers
│   ├── settings.ts      # Settings interface, defaults and settings tab
│   └── folder-count.ts  # Pure counting logic
├── tests/
│   ├── folder-count.test.ts  # Unit tests for the counting logic
│   └── obsidian-mock.ts      # Runtime stub for the types-only obsidian package
├── .github/workflows/   # CI and release automation
├── esbuild.config.mjs   # Build configuration
├── vitest.config.ts     # Test configuration
├── manifest.json        # Obsidian plugin manifest
├── styles.css           # Badge styling
└── versions.json        # Version -> minimum app version map
```

### Testing

Tests run with [Vitest](https://vitest.dev/). Because the `obsidian` package
only ships type declarations, `vitest.config.ts` aliases it to
`tests/obsidian-mock.ts`, a tiny runtime stub providing the `TFile` and
`TFolder` classes used by `folder-count.ts`.

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
2. Run `npm run build`.
3. Create a GitHub release tagged with the version and attach `main.js`,
   `manifest.json` and `styles.css` as release assets.

## License

[MIT](LICENSE)
