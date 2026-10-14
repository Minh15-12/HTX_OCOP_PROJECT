# BRIEFING — 2026-10-13T16:27:00Z

## Mission
Probe and document complete agriculture, farming workflow, PHI, KCS, GS1 traceability, and cross-system integrations specifications for HTX OCOP system.

## 🔒 My Identity
- Archetype: Specification Miner
- Roles: Specification Mining, Domain Requirements Extraction, Business Logic & Invariants Probing
- Working directory: f:\HTX_OCOP_PROJECT\.agents\teamwork\spec_miner_agriculture_2
- Original parent: 6d835839-7c07-453d-8ced-27dd386cb3de
- Milestone: Agriculture & Traceability Spec Mining

## 🔒 Key Constraints
- Sole job is to discover and document features by probing authoritative specification sources.
- Do NOT implement anything (read-only regarding implementation).
- Prioritize authoritative specification documents over assumptions.
- Must document all business rules, invariants, validation codes, data structures, and edge cases.
- Output handoff report with 5 components and spec miner tables.

## Current Parent
- Conversation ID: 6d835839-7c07-453d-8ced-27dd386cb3de
- Updated: 2026-10-13T16:27:00Z

## Task Summary
- **What to probe**: Production Hierarchy, Farming Logs (TT 02/2024), PHI Guard, Harvest Validation (ERR_HARVEST_PHI_VIOLATION), 3-tier KCS, GS1 Lot, Public Traceability QR, Warehouse/Finance/OCOP integrations.
- **Success criteria**: Comprehensive spec document with exact field names, domain formulas, state transitions, validation errors, and edge case matrices.
- **Interface contracts**: `docs/31_FARMING_WORKFLOW.md`, `AGENT.md` (mục 11.1), `docs/10_DOMAIN_MODEL.md`, `docs/11_DATABASE_DESIGN_FINAL.md`.
- **Code layout**: Documentation and specifications analysis.

## Key Decisions Made
- Fully mined all 8 requirement areas from docs 10, 11, 31, 32, 33, 34, AGENT.md, and codebase.
- Verified exact formulas: `safe_harvest_date = spray_date + PHI_days`, `V_total = V_gradeA * P_A + V_gradeB * P_B`, `Fee = V_total * r`, `D = min(D_debt, V_total - Fee)`, `P_net = V_total - Fee - D`.
- Identified key gap: Current traceability route `/lots/{id}/traceability` requires Sanctum auth, and frontend is nested inside `ProtectedRoute`. Spec mandates public route `/trace/:lotId` or `/public/trace/:lotId` accessible without login.

## Artifact Index
- DISPATCH.md - Task assignment
- BRIEFING.md - Context & identity
- progress.md - Progress heartbeat
- handoff.md - Final comprehensive spec mining report
