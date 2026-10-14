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

## Development

This project uses TypeScript and [esbuild](https://esbuild.github.io/).

```bash
# Install dependencies
npm install

# Compile and watch for changes (development)
npm run dev

# Type-check and produce a production build
npm run build
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
├── esbuild.config.mjs   # Build configuration
├── manifest.json        # Obsidian plugin manifest
├── styles.css           # Badge styling
└── versions.json        # Version -> minimum app version map
```

## Releasing

1. Update the version with `npm version patch|minor|major` (this runs
   `version-bump.mjs` to keep `manifest.json` and `versions.json` in sync).
2. Run `npm run build`.
3. Create a GitHub release tagged with the version and attach `main.js`,
   `manifest.json` and `styles.css` as release assets.

## License

[MIT](LICENSE)
