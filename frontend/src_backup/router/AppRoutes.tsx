import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { MembersPage } from '@/features/members/pages/MembersPage';
import { CapitalPage } from '@/features/members/pages/CapitalPage';
import { ProfitPage } from '@/features/members/pages/ProfitPage';
import { CoopProfilePage } from '@/features/members/pages/CoopProfilePage';
import { FarmPlotsPage } from '@/features/agriculture/pages/FarmPlotsPage';
import { CropSeasonsPage } from '@/features/agriculture/pages/CropSeasonsPage';
import { FarmingLogsPage } from '@/features/agriculture/pages/FarmingLogsPage';
import { HarvestsPage } from '@/features/agriculture/pages/HarvestsPage';
import { LotTraceabilityPage } from '@/features/agriculture/pages/LotTraceabilityPage';
import { ProductsPage } from '@/features/inventory/pages/ProductsPage';
import { MaterialsPage } from '@/features/inventory/pages/MaterialsPage';
import { CriteriaPage } from '@/features/ocop/pages/CriteriaPage';
import { DossiersPage } from '@/features/ocop/pages/DossiersPage';
import { DossierDetailPage } from '@/features/ocop/pages/DossierDetailPage';
import { EvidencesPage } from '@/features/ocop/pages/EvidencesPage';
import { EvaluationsPage } from '@/features/ocop/pages/EvaluationsPage';
import { DecisionsPage } from '@/features/ocop/pages/DecisionsPage';
import { FinancePage } from '@/features/finance/pages/FinancePage';
import { ReportsPage } from '@/features/system/pages/ReportsPage';
import { AuditPage } from '@/features/system/pages/AuditPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Guest Auth Routes */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
        </Route>
      </Route>

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* QUẢN LÝ HTX Module */}
          <Route path="/cooperative" element={<CoopProfilePage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/capital" element={<CapitalPage />} />
          <Route path="/profit-distribution" element={<ProfitPage />} />

          {/* Agriculture Production Module */}
          <Route path="/agriculture/plots" element={<FarmPlotsPage />} />
          <Route path="/agriculture/seasons" element={<CropSeasonsPage />} />
          <Route path="/agriculture/logs" element={<FarmingLogsPage />} />
          <Route path="/agriculture/harvests" element={<HarvestsPage />} />
          <Route path="/agriculture/lots/:id/traceability" element={<LotTraceabilityPage />} />

          {/* Inventory & Products Module */}
          <Route path="/inventory/products" element={<ProductsPage />} />
          <Route path="/inventory/materials" element={<MaterialsPage />} />

          {/* OCOP Digital Suite Module */}
          <Route path="/ocop/criteria" element={<CriteriaPage />} />
          <Route path="/ocop/dossiers" element={<DossiersPage />} />
          <Route path="/ocop/dossiers/:id" element={<DossierDetailPage />} />
          <Route path="/ocop/evidences" element={<EvidencesPage />} />
          <Route path="/ocop/evaluation" element={<EvaluationsPage />} />
          <Route path="/ocop/decisions" element={<DecisionsPage />} />

          {/* Finance & System modules */}
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/finance/*" element={<FinancePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/audit" element={<AuditPage />} />
        </Route>
      </Route>

      {/* Default Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
