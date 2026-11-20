# memory-service

Reserved Anna Executa boundary for background candidate extraction, indexed query, and authorized-context construction. The v0.1 UI uses Anna Host `llm.complete` and APS directly so no user data crosses an extra tool boundary. Promote these operations into a bundled Executa only when background invocation is required; preserve the same domain contracts and app-scoped APS storage.
