## Engineering Policies

### Configuration
- Single source of truth: generated manifest
- No direct config imports in the registry (ESLint guard enabled)
- Dev: dynamic-first; Prod: static-first unless overridden

### Code Quality
- 100% TypeScript with strict mode
- No guessing or shortcuts; follow clean code and separation of concerns
- Result/Pattern usage for error handling where applicable

### Observability
- Record config resolution metrics and layout decisions
- Provide dev-only diagnostics at `/__metrics`

### CI Requirements
- Manifest up-to-date check
- Focused type-check (no noisy modules)
- ESLint checks including manifest guard
- Build server and client
- Run smoke tests


