import { lazy } from 'react';

// Heavy components that should be lazy loaded
export const LazyComponents = {
  // Admin Components
  AdminDashboard: lazy(() => import('@/components/admin/AdminDashboard')),
  PerformanceMonitor: lazy(() => import('@/components/admin/EnhancedPerformanceMonitor')),
  ErrorLogViewer: lazy(() => import('@/components/admin/ErrorLogViewer')),
  
  // Analytics
  AdvancedAnalytics: lazy(() => import('@/components/analytics/AdvancedAnalyticsDashboard')),
  TemplateAnalytics: lazy(() => import('@/components/analytics/TemplateAnalyticsDashboard')),
  
  // Database Tools
  DatabaseViewer: lazy(() => import('@/components/database/EnhancedDatabaseViewer')),
  MigrationSystem: lazy(() => import('@/components/database/DatabaseMigrationSystem')),
  ERDGenerator: lazy(() => import('@/components/database/EnhancedERDGenerator')),
  
  // Import/Export
  BulkImport: lazy(() => import('@/components/import/EnhancedBulkImportSystem')),
  AdvancedExport: lazy(() => import('@/components/export/AdvancedExportSystem')),
  
  // Reports
  AdvancedReports: lazy(() => import('@/components/reports/AdvancedReportsDashboard')),
  CustomReportBuilder: lazy(() => import('@/components/reports/CustomReportBuilder')),
  
  // AI Features
  AIValuation: lazy(() => import('@/components/valuation/AIValuationModal')),
  AIHelpAssistant: lazy(() => import('@/components/help/AIHelpAssistant')),
  
  // Testing
  TestCoverage: lazy(() => import('@/components/testing/EnhancedTestCoverageDashboard')),
  AITestGenerator: lazy(() => import('@/components/testing/AITestGenerator')),
  
  // Collaboration
  TeamWorkspace: lazy(() => import('@/components/collaboration/TeamWorkspace')),
  RealtimeCollab: lazy(() => import('@/components/collaboration/RealtimeCollaboration')),
  
  // Security
  SecurityDashboard: lazy(() => import('@/components/security/SecurityDashboard')),
  ComplianceTools: lazy(() => import('@/components/security/ComplianceTools')),
};

export default LazyComponents;
