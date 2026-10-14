# Contributing

Thanks for your interest in improving **Folder Child Count**! This document
covers how to set up the project and the conventions we follow.

## Getting started

```bash
git clone <your-fork-url>
cd folder-child-count
nvm use          # uses the Node version pinned in .nvmrc
npm install
```

## Scripts

| Command              | Description                                     |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Build in watch mode (regenerates `main.js`).    |
| `npm run build`      | Type-check and produce a minified `main.js`.    |
| `npm run test`       | Run the unit tests once.                        |
| `npm run checksums`  | Write `SHA256SUMS` for the release artifacts.   |
| `npm run test:watch` | Run the tests in watch mode.                    |
| `npm run lint`       | Lint the source with the Obsidian ESLint rules. |

## Project layout

```
src/
  main.ts          # Plugin entry point, file-explorer integration, observers
  badge.ts         # Pure-ish DOM helper that renders the count badge
  settings.ts      # Settings shape, defaults and the declarative settings tab
  folder-count.ts  # Pure counting logic
tests/
  *.test.ts        # Vitest unit tests
  obsidian-mock.ts # Runtime stub for the types-only `obsidian` package
```

The `obsidian` npm package ships only type declarations, so tests alias it to a
small runtime stub. When you need a new Obsidian class in a test, add it to
`tests/obsidian-mock.ts` and build instances with the helpers in
`tests/helpers.ts`.

## Testing in Obsidian

Copy or symlink `main.js`, `manifest.json` and `styles.css` into
`<your-vault>/.obsidian/plugins/folder-child-count/`, then reload Obsidian and
enable the plugin. Running `npm run dev` rebuilds on every change; you may need
to reload the plugin (toggle it off/on) to pick up changes.

## Guidelines

- Keep logic that can be pure (counting, formatting) out of the DOM code so it
  stays easy to test.
- Prefer standard DOM APIs in `badge.ts` so it can run under jsdom.
- Add or update tests for any behavior change, and make sure `npm run lint`,
  `npm run test` and `npm run build` all pass before opening a pull request.
- Match the existing code style: tabs for indentation, single quotes, trailing
  commas, explicit return types on exported functions.

## Pull requests

1. Create a topic branch.
2. Make your change with a clear, focused commit history.
3. Ensure CI is green.
4. Describe what changed and why in the pull request body.
