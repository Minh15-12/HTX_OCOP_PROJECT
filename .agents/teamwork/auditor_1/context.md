# Forensic Auditor Context

- Working Directory: f:\HTX_OCOP_PROJECT\.agents\teamwork\auditor_1
- Original Request: f:\HTX_OCOP_PROJECT\.agents\teamwork\ORIGINAL_REQUEST.md
- Scope Document: f:\HTX_OCOP_PROJECT\.agents\teamwork\orchestrator_1\PROJECT.md
- Backend Worker Handoff: f:\HTX_OCOP_PROJECT\.agents\teamwork\worker_backend_1\handoff.md
- Frontend Worker Handoff: f:\HTX_OCOP_PROJECT\.agents\teamwork\worker_frontend_1\handoff.md
- Scope: Independent forensic integrity audit. Inspect backend & frontend implementations to ensure:
  1. No hardcoded test responses or fake pass values.
  2. Genuine calculation logic for scores, star ratings, and completion percentages.
  3. Genuine cryptographic SHA-256 calculation for evidence files.
  4. Real database persistence and state transitions.
  5. Genuine responsive components and print styles.
  Verdict must be strictly CLEAN or INTEGRITY VIOLATION.
