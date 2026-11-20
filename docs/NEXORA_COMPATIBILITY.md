# Nexora Compatibility

## Shared principles

- Human-confirmed memory
- Candidate-to-confirmed/rejected lifecycle
- Explicit AI access levels
- Minimum disclosure
- Traceable lifecycle events
- Fail-closed behavior

## Deliberate differences

| Original Nexora | Anna Edition |
|---|---|
| Local Markdown Vault | Anna APS app scope |
| Obsidian and local file adapters | Anna App React UI |
| Local FastAPI and MCP Gateway | Anna Host APIs; no local gateway |
| `local-only` access mode | omitted; Anna edition has no local Vault |
| Private Git backup/multi-Vault recovery | not migrated |
| Monthly Reflection/Human 3.0 | not migrated |

No original repository tree was copied. The implementation is a small new TypeScript codebase derived from documented domain principles. The original license is retained, and README files should link both editions.
