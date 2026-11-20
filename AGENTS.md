# AGENTS.md

## Product and privacy boundaries

1. AI may generate candidate memories only. It must never automatically confirm, reject, grant access to, or silently promote a long-term memory.
2. Unconfirmed and rejected memories must never enter authorized AI context.
3. Every newly created candidate defaults to `aiAccess: "denied"`.
4. Do not persist complete raw conversations. The submitted conversation may be used transiently for candidate extraction only.
5. Do not connect to, read, migrate, or upload an original Nexora private Markdown Vault.
6. Anna Edition stores durable app data in Anna Persistent Storage (APS), a cloud persistence service. Never describe APS or this edition as local-first or local storage.
7. `domain/` is authoritative for lifecycle and access policy. UI and Anna adapters must not weaken or duplicate these rules.
8. Missing or invalid access metadata fails closed. Only confirmed memories with exact `allowed` or `summary-only` values may be disclosed.
9. Every lifecycle transition, access change, or context read must remain traceable through audit events.
10. Development and automated tests use synthetic data only.
11. Do not add Markdown Vault, Obsidian, private Git backup, local FastAPI, local MCP Gateway, multi-Vault, Monthly Reflection, or Human 3.0 features to this edition without an explicit product decision.
12. Before publishing, submitting Anna App Review, changing a remote repository, or pushing code, explicitly report the intended operation and wait for a direct user request.
13. Keep the Anna Manifest on the current supported schema. Do not use retired `permissions` or `host_capabilities` fields.

