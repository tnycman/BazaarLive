## Troubleshooting Guide

### Dev server fails: ConfigurationResultUtils export missing
- Symptom: esbuild error: No matching export for `ConfigurationResultUtils` from `enterprise/patterns/Result.ts`.
- Fix: Ensure `ConfigurationResultUtils` is defined and exported in `client/src/services/category/enterprise/patterns/Result.ts`, and all importers use the same symbol name.

### Dev server fails: generated/configManifest not found
- Symptom: Vite Pre-transform error on `./generated/configManifest`.
- Fixes:
  1. Run `npm run predev` or `npm run dev` (predev hook should generate the file).
  2. Ensure generator emits extensionless dynamic imports and excludes non-config files.
  3. Verify `scripts/watch-config-manifest.mjs` is running alongside dev.

### Config fetches fail intermittently
- Symptom: transient 5xx/429 or timeouts.
- Fix: API strategy now retries with exponential backoff. Confirm via `/__metrics` and logs.

### Layout regressions (sidebars, padding)
- Use `/__metrics` to inspect recent layout decisions.
- Policy is centralized in `LayoutPolicy` and applied in `UniversalCategoryPage`.

### Type-check noise blocks work
- Use `npm run type-check` with `tsconfig.typecheck.json` for focused scope.
- Gradually replace stubs in `client/typecheck-stubs/**` with real modules.

### Server crashes on client errors
- Vite integration avoids `process.exit(1)`; server should keep running. Review `server/vite.ts`.


