import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';

// Lazy loading pages for optimized bundle size & code splitting
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const MembersPage = lazy(() => import('@/features/members/pages/MembersPage').then(m => ({ default: m.MembersPage })));
const CapitalPage = lazy(() => import('@/features/members/pages/CapitalPage').then(m => ({ default: m.CapitalPage })));
const ProfitPage = lazy(() => import('@/features/members/pages/ProfitPage').then(m => ({ default: m.ProfitPage })));
const MeetingsPage = lazy(() => import('@/features/members/pages/MeetingsPage').then(m => ({ default: m.MeetingsPage })));
const CoopProfilePage = lazy(() => import('@/features/members/pages/CoopProfilePage').then(m => ({ default: m.CoopProfilePage })));
const FarmPlotsPage = lazy(() => import('@/features/agriculture/pages/FarmPlotsPage').then(m => ({ default: m.FarmPlotsPage })));
const CropSeasonsPage = lazy(() => import('@/features/agriculture/pages/CropSeasonsPage').then(m => ({ default: m.CropSeasonsPage })));
const FarmingLogsPage = lazy(() => import('@/features/agriculture/pages/FarmingLogsPage').then(m => ({ default: m.FarmingLogsPage })));
const FieldLogEntryPage = lazy(() => import('@/features/agriculture/pages/FieldLogEntryPage').then(m => ({ default: m.FieldLogEntryPage })));
const HarvestsPage = lazy(() => import('@/features/agriculture/pages/HarvestsPage').then(m => ({ default: m.HarvestsPage })));
const LotTraceabilityPage = lazy(() => import('@/features/agriculture/pages/LotTraceabilityPage').then(m => ({ default: m.LotTraceabilityPage })));
const PublicTraceabilityPage = lazy(() => import('@/features/agriculture/pages/PublicTraceabilityPage').then(m => ({ default: m.PublicTraceabilityPage })));
const ProductsPage = lazy(() => import('@/features/inventory/pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const MaterialsPage = lazy(() => import('@/features/inventory/pages/MaterialsPage').then(m => ({ default: m.MaterialsPage })));
const CriteriaPage = lazy(() => import('@/features/ocop/pages/CriteriaPage').then(m => ({ default: m.CriteriaPage })));
const DossiersPage = lazy(() => import('@/features/ocop/pages/DossiersPage').then(m => ({ default: m.DossiersPage })));
const DossierDetailPage = lazy(() => import('@/features/ocop/pages/DossierDetailPage').then(m => ({ default: m.DossierDetailPage })));
const CreateDossierWizardPage = lazy(() => import('@/features/ocop/pages/CreateDossierWizardPage').then(m => ({ default: m.CreateDossierWizardPage })));
const EvidencesPage = lazy(() => import('@/features/ocop/pages/EvidencesPage').then(m => ({ default: m.EvidencesPage })));
const EvaluationsPage = lazy(() => import('@/features/ocop/pages/EvaluationsPage').then(m => ({ default: m.EvaluationsPage })));
const DecisionsPage = lazy(() => import('@/features/ocop/pages/DecisionsPage').then(m => ({ default: m.DecisionsPage })));
const OcopReportsPage = lazy(() => import('@/features/ocop/pages/OcopReportsPage').then(m => ({ default: m.OcopReportsPage })));
const FinancePage = lazy(() => import('@/features/finance/pages/FinancePage').then(m => ({ default: m.FinancePage })));
const ReportsPage = lazy(() => import('@/features/system/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const AuditPage = lazy(() => import('@/features/system/pages/AuditPage').then(m => ({ default: m.AuditPage })));
const SystemSettingsPage = lazy(() => import('@/features/system/pages/SystemSettingsPage').then(m => ({ default: m.SystemSettingsPage })));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-500">Đang tải trang...</span>
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Guest Auth Routes */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<LoginPage />} />
          </Route>
        </Route>

        {/* Public Consumer QR Traceability Routes (No Auth Required) */}
        <Route path="/trace/:lotId" element={<PublicTraceabilityPage />} />
        <Route path="/public/trace/:lotId" element={<PublicTraceabilityPage />} />
        <Route path="/truy-xuat/:lotId" element={<PublicTraceabilityPage />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* QUẢN LÝ HTX Module */}
            <Route path="/cooperative" element={<CoopProfilePage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/capital" element={<CapitalPage />} />
            <Route path="/profit-distribution" element={<ProfitPage />} />
            <Route path="/profit" element={<ProfitPage />} />

            {/* Agriculture Production Module */}
            <Route path="/agriculture/plots" element={<FarmPlotsPage />} />
            <Route path="/agriculture/seasons" element={<CropSeasonsPage />} />
            <Route path="/agriculture/logs" element={<FarmingLogsPage />} />
            <Route path="/agriculture/field-entry" element={<FieldLogEntryPage />} />
            <Route path="/agriculture/harvests" element={<HarvestsPage />} />
            <Route path="/agriculture/lots/:id/traceability" element={<LotTraceabilityPage />} />

            {/* Inventory & Products Module */}
            <Route path="/inventory/products" element={<ProductsPage />} />
            <Route path="/inventory/materials" element={<MaterialsPage />} />

            {/* OCOP Digital Suite Module */}
            <Route path="/ocop/criteria" element={<CriteriaPage />} />
            <Route path="/ocop/dossiers" element={<DossiersPage />} />
            <Route path="/ocop/dossiers/new" element={<CreateDossierWizardPage />} />
            <Route path="/ocop/dossiers/create" element={<CreateDossierWizardPage />} />
            <Route path="/ocop/dossiers/:id" element={<DossierDetailPage />} />
            <Route path="/ocop/evidences" element={<EvidencesPage />} />
            <Route path="/ocop/evaluation" element={<EvaluationsPage />} />
            <Route path="/ocop/decisions" element={<DecisionsPage />} />
            <Route path="/ocop/reports" element={<OcopReportsPage />} />

            {/* Finance & System modules */}
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/finance/*" element={<FinancePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/system/audit" element={<AuditPage />} />
            <Route path="/system/settings" element={<SystemSettingsPage />} />
            <Route path="/settings" element={<Navigate to="/system/settings" replace />} />
          </Route>
        </Route>

        {/* Default Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
