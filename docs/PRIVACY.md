# Privacy & Access

## Data handling

- The user explicitly submits conversation text to Anna's LLM for one extraction request.
- Nexora Memory does not persist that raw conversation by default.
- Extracted candidates are stored in Anna Persistent Storage (APS) in app scope.
- No Markdown Vault, Obsidian folder, private Git backup, Nexora Vault, or local MCP gateway is read or uploaded.
- Development and automated tests use synthetic data only.

## Access policy

| Level | Anna AI result |
|---|---|
| `allowed` | confirmed full content, only when relevant |
| `summary-only` | confirmed explicit summary, only when relevant |
| `denied` | nothing |
| missing/invalid | nothing (fail closed) |

Candidate and rejected memories are never returned as authorized context. The AI cannot confirm long-term memory or grant itself access.

## User controls

The Privacy & Access page identifies APS cloud persistence and provides:

- per-memory access selection;
- preview of minimum authorized context;
- export of all memory and audit data as JSON;
- deletion of all app data from APS.

## Production privacy acceptance

Before release, verify with real APS that deletion makes the key unavailable, exported data is complete, stale ETags cannot restore deleted data, logs contain no conversation text or signed URLs, and every denied/candidate/rejected fixture produces an empty disclosure.
