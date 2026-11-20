# Technical Feasibility Report

Date: 2026-11-20

## Decision

**Feasible with a narrow MVP.** Anna App UI provides `llm.complete` for candidate extraction and APS KV for durable JSON. The current schema-4 manifest needs no legacy `permissions` or `host_capabilities` list. App-scope APS is sufficient for private app data; no cross-app storage declaration is required.

## Evidence reviewed

### Original Nexora

Reviewed `README.md`, `AGENTS.md`, `docs/MEMORY_LIFECYCLE.md`, `docs/PRIVACY.md`, `docs/SECURITY_CENTER.md`, `docs/MCP_HOST_CONNECTION.md`, `docs/BEHAVIOR_CONTRACT.md`, and the authoritative `core/access.py` / `core/profile.py` logic at the source repository. Migrated only these abstractions:

- `candidate → confirmed/rejected`;
- human confirmation boundary;
- `allowed / summary-only / denied` (Anna Edition intentionally omits the local-only level because there is no local Vault);
- fail-closed, minimum authorized context;
- traceable lifecycle audit events.

### Anna documentation

Reviewed the current official [Developer Hub](https://anna.partners/developers), [llms.txt](https://anna.partners/llms.txt), full documentation corpus, App Manifest, App UI LLM, APS, Executa lifecycle, local development, validation, publishing, and review requirements. Key implementation facts:

- Current App Manifest schema is 4; unknown fields are rejected.
- Installed Apps can call Host APIs such as `llm.complete` and own-scope `storage.*`; legacy `permissions` and `host_capabilities` are retired for schema 4.
- APS KV supports scoped `get`, `set`, `delete`, and `list`; real APS development uses `anna-app dev --storage aps`.
- Executa reverse RPC requires protocol v2 capability negotiation. A bundled Executa is not needed for this synchronous v0.1 path, avoiding an unnecessary data boundary.
- Review checks content quality and security, including permissions, external APIs, data access, packaging, and correct function. This phase performs neither publish nor review submission.

## Feasibility matrix

| Requirement | Mechanism | Assessment |
|---|---|---|
| Candidate generation | Anna `llm.complete`, strict JSON prompt | Feasible; validate and cap output |
| Human confirmation | Domain state machine + explicit UI action | Feasible |
| Persistent memory | APS KV, app scope | Feasible; add ETag concurrency before production |
| Access levels | Server-independent domain policy | Feasible |
| Minimum context | status/access filter + task relevance + result cap | MVP feasible; semantic ranking can follow |
| Audit lifecycle | append-only logical event list in APS record | Feasible; hash chain optional future hardening |
| Export/delete | JSON download + APS key delete | Feasible |
| No raw-chat archive | conversation never passed to storage adapter | Feasible and testable |

## Risks and mitigations

1. **Concurrent windows overwrite APS KV.** Add `if_match` ETag retry before production acceptance.
2. **LLM JSON drift or unsupported claims.** Strict parse, length bounds, visible review; candidates never auto-confirm.
3. **Summary leaks sensitive detail.** User edits summary; default access is denied; add red-team fixtures before release.
4. **Keyword relevance is basic.** It is deterministic and bounded for MVP. Add Anna embeddings only after a privacy/quality decision.
5. **Brand assets.** No image was copied in this prep. Reuse only assets whose license and Nexora brand guidance permit it.
6. **Schema/CLI drift.** Pin CLI/runtime versions after first validated Anna harness run.

## Go/no-go gate

Proceed to production hardening only after real APS tests, strict manifest validation, ETag conflict tests, data-deletion verification, accessibility QA, and synthetic privacy test coverage pass.
