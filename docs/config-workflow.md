## Configuration Workflow (Enterprise)

This document explains how category configurations are discovered, generated, loaded, and observed at runtime.

### Sources of Truth
- Generated manifest: `client/src/services/category/configs/generated/configManifest.ts` (auto-generated)
- Registry: `client/src/services/category/configs/ConfigurationRegistry.ts`
- Strategies: `client/src/services/category/enterprise/strategies/ConfigurationLoadStrategy.ts`

### Generation
- Manifest is created by `scripts/generate-config-manifest.mjs` and watched by `scripts/watch-config-manifest.mjs`.
- CI and local checks run `scripts/check-config-manifest.mjs` to validate that the manifest is up-to-date.

### Resolution Policy
- Dev default: dynamic-first
- Prod default: static-first
- Override with env: `CONFIG_RESOLUTION_POLICY=dynamic-first|static-first`
- Dev-only runtime override via `/__metrics` controls (uses registry `__setResolutionPolicyOverride`).

### Load Paths
1. Cache → fast path
2. Manifest (static import) → stable path
3. API (dynamic) → resilient path with retry/backoff
4. Miss → null (fallback strategy at enterprise layer ensures UX resilience)

### API Hardening
- API strategy uses timeouts and exponential backoff with jitter.
- Retries limited (default 3) and only for 5xx/429.
- Metrics record attempt success/failure and durations.

### Observability
- `/__metrics` shows:
  - Resolution summary (cache/manifest/api/miss)
  - Recent failures
  - Recent layout decisions
  - Controls to clear cache and toggle policy

### Adding/Changing Configs
1. Add a new config file under `client/src/services/category/configs/<category>/<sub>.ts`.
2. Run manifest generator (or rely on watcher in dev).
3. Verify load via the page and `/__metrics`.
4. Add tests/smoke checks if applicable.


