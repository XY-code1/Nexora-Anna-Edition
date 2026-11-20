# Architecture

## Repository structure

```text
nexora-anna-edition/
├─ app/
│  ├─ ui/                    # React UI and four product pages
│  ├─ services/              # Anna LLM, APS, memory application API
│  ├─ types/                 # minimal Anna Host API types
│  └─ main.tsx
├─ domain/                   # framework-free lifecycle and permission rules
├─ executas/memory-service/  # reserved boundary; intentionally not bundled in v0.1
├─ tests/                    # synthetic domain tests
├─ docs/
├─ manifest.json             # Anna App schema 4
├─ app.json                  # local listing metadata
├─ README.md
├─ LICENSE
└─ AGENTS.md
```

## Boundaries

```text
React UI
  ├── anna-llm.ts ── Anna Host llm.complete (conversation transient)
  └── memory-api.ts
        ├── domain/lifecycle.ts
        ├── domain/permissions.ts
        └── anna-storage.ts ── APS KV, scope=app
```

The UI is not a security boundary. `memory-api` calls pure domain functions before persistence. The extraction service receives raw text transiently; the persistence service receives candidates and audit events only.

## Data model

```ts
type MemoryStatus = "candidate" | "confirmed" | "rejected";
type AccessLevel = "allowed" | "summary-only" | "denied";
interface Memory {
  id: string; title: string; content: string; summary: string;
  status: MemoryStatus; aiAccess: AccessLevel;
  createdAt: string; updatedAt: string;
  confirmedAt?: string; rejectedAt?: string;
  source: "conversation-submit"; revision: number;
}
```

APS key `nexora-memory/v1/store` holds `{schemaVersion, memories, audit}` in the App's isolated scope. This simple envelope is appropriate for MVP volume; split records/indexes when size or concurrency requires it.

## Lifecycle invariants

- Creation always yields `candidate + denied`.
- Only candidates may be edited, confirmed, or rejected.
- Confirmation/rejection is user-initiated and terminal in v0.1.
- AI access can change only on confirmed memories.
- Every state or disclosure action adds an audit event.

## Authorized context algorithm

1. Filter to `confirmed`.
2. Fail closed unless access is exactly `allowed` or `summary-only`.
3. Require task-term relevance.
4. Rank matched items and cap to five.
5. Return full content only for `allowed`; explicit summary only for `summary-only`.
6. Log IDs disclosed, never duplicate disclosed text in the audit record.

## Executa decision

A bundled Executa is deferred. The current synchronous UI can call Anna LLM and app-scoped APS directly, which reduces principals and permissions. `executas/memory-service/` documents the future boundary for background jobs or chat-invoked memory queries. If activated, it must negotiate protocol v2, use app-context APS, and preserve identical domain invariants.
