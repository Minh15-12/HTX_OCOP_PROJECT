# Plan: HTX-OCOP System Comprehensive Evaluation, Gap Analysis & Architectural Blueprint Matrix

## Phase 0: Survey & Technical Exploration (M3-P0)
- Dispatch 3 specialized Explorers to inspect the entire repository:
  1. `explorer_backend_3`: Investigate Backend Laravel 11 architecture across 9 DDD modules, routes (`routes/api.php`), database migrations, models, controllers, services, repositories, Form Requests, Resources, multi-tenant isolation, audit_events hash chain, and existing test suites (`tests/Feature`, `tests/Unit`).
  2. `explorer_frontend_3`: Investigate Frontend React 18/19 & TypeScript architecture (`src/`), page components, layout patterns (Table, Drawer, Modal), Tabs lifecycle, KPI cards, visual charts, truthful state handling (loading skeleton, empty states, error/success toasts), runtime silent mocking checks, and API client contracts.
  3. `explorer_features_3`: Investigate GS1 QR Traceability (`/api/v1/public/trace/{lot_code}`, public trace UI), Export capabilities (Excel `.xlsx` and PDF exports for Cashbook, Members, Inventory, VietGAP logs, OCOP dossiers), and GIS / Satellite Remote Sensing opportunities (NDVI, soil moisture, PUC polygon validation).

## Phase 1: Survey Synthesis & Blueprint Architecture Design (M3-P1)
- Aggregate and cross-reference findings from all 3 Explorers.
- Produce comprehensive evaluation reports addressing R1, R2, R3, R4, R5:
  - R1: Detailed Business Matrix & PostgreSQL Schema mapping for 9 DDD modules.
  - R2: Standard UI/UX Architecture Specification (Table vs Drawer vs Modal, Tabs lifecycle, truthful data states, concurrency/idempotency).
  - R3: Verification of GS1 Traceability and Report Exports (Excel & PDF).
  - R4: Tri-layer Gap Analysis (Docs vs Backend vs Frontend) and Agricultural Satellite Remote Sensing Integration Blueprint.
  - R5: Backend Synchronization Roadmap, Data Contracts & Comprehensive Verification Test Matrix.

## Phase 2: Review & Adversarial Stress-Testing (M3-P2)
- Dispatch Reviewers and Challengers to rigorously verify findings, confirm file references/line numbers, test edge cases, and challenge assumptions.

## Phase 3: Forensic Integrity Audit (M3-P3)
- Dispatch `teamwork_preview_auditor` to audit integrity, verify no cheating, no hardcoded facades, no phantom features, and strict rule compliance.

## Phase 4: Final Synthesis & Sentinel Delivery (M3-P4)
- Compile final `handoff.md` and report to Sentinel (`63d10506-617b-4b29-9178-a190e5909d8e`).
