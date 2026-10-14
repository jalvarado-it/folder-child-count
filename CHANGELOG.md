# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Appearance settings: custom color, style (badge / plain / outline), size,
  bold and "show only on hover" (desktop).
- README section documenting customization with settings and CSS snippets.

### Fixed

- Remove count badges from the DOM when the plugin is unloaded, so disabling
  it no longer leaves stale counters behind.
- Ignore queued refreshes after unload, so a pending debounce cannot revive the
  plugin.
- Release the file-explorer `MutationObserver` when a file explorer is closed.
- Set `authorUrl` and drop the empty `fundingUrl` in `manifest.json`.

### Changed

- Target Node.js 24: `engines.node`, `.nvmrc`, CI `node-version` and
  `@types/node` updated to the 24 line.

### Security

- Pin GitHub Actions to full commit SHAs instead of mutable tags.
- Use minimal `contents: read` permissions in the CI workflow.
- Dependabot configuration for GitHub Actions and npm dependencies.
- Pin the `obsidian` dev dependency instead of tracking `latest`.
- Validate the plugin id before using it in filesystem paths, and fail with a
  clear message on filesystem conflicts, in the vault install script.
- Sign release artifacts with GitHub Artifact Attestations (build provenance).
- Publish a `SHA256SUMS` file with each release for offline integrity checks.

## [1.0.0] - 2026-10-13

### Added

- Count badge next to every folder in the file explorer.
- Setting to count files and folders, files only, or folders only.
- Setting to hide the badge for empty folders.
- Automatic refresh when files and folders are created, deleted or renamed.
- Declarative settings tab (requires Obsidian 1.13.0 or later).

[Unreleased]: https://github.com/jalvarado-it/folder-child-count/compare/1.0.0...HEAD
[1.0.0]: https://github.com/jalvarado-it/folder-child-count/releases/tag/1.0.0
