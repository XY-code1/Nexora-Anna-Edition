# Development Phases and Acceptance

## Phase 0 — preparation (included)

- Independent repository and architecture
- Current source/docs review
- Data/permission model
- Working UI/domain scaffold and synthetic tests

**Acceptance:** no nested copy of Nexora; no Vault/FastAPI/MCP/Git backup code; README relationship explicit.

## Phase 1 — core MVP

- Four responsive pages
- LLM candidate extraction
- edit/confirm/reject
- APS persistence
- access controls and minimum-context preview
- export/delete

**Acceptance:** candidates cannot become confirmed without a click; raw conversation absent from APS payload; denied/non-confirmed records never disclose; refresh survives with real APS.

## Phase 2 — production hardening

- ETag optimistic concurrency/retry
- schema migration and corrupt-payload recovery
- synthetic prompt-injection/privacy suite
- accessibility and mobile QA
- clear LLM/APS error states
- pinned toolchain and Anna harness fixtures

**Acceptance:** two-window conflict test passes; deletion is verified; WCAG keyboard/focus checks pass; `anna-app validate --strict` passes.

## Phase 3 — pre-review readiness

- Final listing assets and privacy copy
- release build reproducibility
- security/content review checklist
- real Anna installation smoke test with synthetic data

**Acceptance:** review evidence complete. **Do not submit** until the user explicitly authorizes publishing and App Review.
