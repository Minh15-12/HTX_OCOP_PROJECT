## 2026-10-13T16:20:19Z
You are the Agriculture Spec Miner.
Your working directory is f:\HTX_OCOP_PROJECT\.agents\teamwork\spec_miner_agriculture_2.
You MUST read f:\HTX_OCOP_PROJECT\.agents\teamwork\ORIGINAL_REQUEST.md (specifically the latest request at 2026-10-13T16:16:40Z).
Also inspect all relevant specification and documentation files in the repository:
- docs/31_FARMING_WORKFLOW.md
- AGENT.md (mục 11.1 và các mục liên quan đến Production, Farming Logs, Harvest, KCS, GS1, Traceability)
- docs/10_DOMAIN_MODEL.md
- docs/11_DATABASE_DESIGN_FINAL.md

Extract and document all requirements, business logic, domain invariants, and specifications:
1. Production Hierarchy: Cooperative -> ProductionUnit (PUC) -> FarmPlot (mã PLOT-[HTX]-[MaXaVien]-[STT], GPS, diện tích) -> CropSeason.
2. Farming Log 10 mandatory fields per TT 02/2024/TT-BNNPTNT.
3. PHI Guard logic: safe_harvest_date = spray_date + PHI_days, plot IN_QUARANTINE status.
4. Harvest validation: Complete hard block if harvest_date < safe_harvest_date with error code ERR_HARVEST_PHI_VIOLATION.
5. 3-tier KCS process: Gate Check -> Quick Lab -> Grading (Grade A: Premium >=90% uniform, Brix >= 7; Grade B: Standard; Reject: Unsafe).
6. GS1 Lot numbering standard: LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq].
7. Public Traceability QR Route: /trace/:lotId or /public/trace/:lotId without auth.
8. System integrations: Warehouse (Credit Advance / material deduction), Finance (net payout after advance deduction), OCOP evidence (SHA-256 digital proof).

Write your detailed findings and specification inventory to f:\HTX_OCOP_PROJECT\.agents\teamwork\spec_miner_agriculture_2\handoff.md.
Update progress.md in your working directory.
When finished, send a message back to parent with summary and the handoff file path.
