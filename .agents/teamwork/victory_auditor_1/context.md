# Victory Auditor Context

- **Task**: Conduct independent 3-phase victory audit (timeline reconstruction, cheating detection, independent test execution) on the OCOP QĐ 148 digitization project.
- **Original Request**: f:\HTX_OCOP_PROJECT\.agents\teamwork\ORIGINAL_REQUEST.md
- **Working Directory**: f:\HTX_OCOP_PROJECT\.agents\teamwork\victory_auditor_1
- **Project Root**: f:\HTX_OCOP_PROJECT
- **Orchestrator Handoff**: f:\HTX_OCOP_PROJECT\.agents\teamwork\orchestrator_1\handoff.md
- **Integrity Mode**: development
- **Verification Commands**:
  - Backend: `php artisan test --filter=Ocop` (and `php artisan test` if relevant)
  - Frontend: `npm run build && npm run lint`
- **Output Required**: Verdict of either VICTORY CONFIRMED or VICTORY REJECTED with structured forensic report.
