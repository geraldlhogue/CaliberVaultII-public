import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAppContext } from '@/contexts/AppContext';
import InventoryDashboard from './inventory/InventoryDashboard';
import { FeatureGuard } from './subscription/FeatureGuard';
import { MobileAnalyticsDashboard } from './analytics/MobileAnalyticsDashboard';
import { UserProfile } from './auth/UserProfile';
import { ReferenceDataSeederModal } from './database/ReferenceDataSeederModal';
import { DatabaseHealthCheck } from './database/DatabaseHealthCheck';
import { EnhancedDatabaseViewer } from './database/EnhancedDatabaseViewer';
import { InventoryDebugger } from './database/InventoryDebugger';
import { DataFlowVisualization } from './database/DataFlowVisualization';
import { SyncStatusDashboard } from './sync/SyncStatusDashboard';
import MaintenanceRecords from './maintenance/MaintenanceRecords';
import type { InventoryItem } from '@/types/inventory';

// Import critical components directly (not lazy)
import MainNavigation from './navigation/MainNavigation';
import AppUpdateNotifier from './pwa/AppUpdateNotifier';
import EnhancedInstallPrompt from './pwa/EnhancedInstallPrompt';
import AIHelpAssistant from './help/AIHelpAssistant';

// Lazy load non-critical components
const AdvancedAnalytics = React.lazy(() => import('./analytics/AdvancedAnalytics'));
const CohortAnalyticsDashboard = React.lazy(() => import('./analytics/CohortAnalyticsDashboard'));
const OnboardingAnalyticsDashboard = React.lazy(() => import('./analytics/OnboardingAnalyticsDashboard'));
const PWAAnalyticsDashboard = React.lazy(() => import('./analytics/PWAAnalyticsDashboard'));
const AdminDashboard = React.lazy(() => import('./admin/AdminDashboard'));
const SecurityDashboard = React.lazy(() => import('./security/SecurityDashboard'));
const NotificationCenter = React.lazy(() => import('./notifications/NotificationCenter'));
const MobileAppSettings = React.lazy(() => import('./mobile/MobileAppSettings'));
const NaturalLanguageSearch = React.lazy(() => import('./ai/NaturalLanguageSearch'));
const PredictiveAnalyticsDashboard = React.lazy(() => import('./ai/PredictiveAnalyticsDashboard'));
const PushNotificationManager = React.lazy(() => import('./pwa/PushNotificationManager'));
const BackgroundSyncManager = React.lazy(() => import('./pwa/BackgroundSyncManager'));
const EnhancedAdvancedSearch = React.lazy(() => import('./search/EnhancedAdvancedSearch'));
const AdvancedReportsDashboard = React.lazy(() => import('./reports/AdvancedReportsDashboard'));
const PerformanceMonitor = React.lazy(() => import('./admin/PerformanceMonitor'));
const MobileOptimizationDashboard = React.lazy(() => import('./mobile/MobileOptimizationDashboard'));
const TeamWorkspace = React.lazy(() => import('./collaboration/TeamWorkspace'));
const DeveloperDashboard = React.lazy(() => import('./api/DeveloperDashboard'));
const IntegrationsDashboardEnhanced = React.lazy(() => import('./integrations/IntegrationsDashboardEnhanced'));
const ErrorMonitoringDashboard = React.lazy(() => import('./admin/ErrorMonitoringDashboard'));

const InteractiveTutorial = React.lazy(() => import('./help/InteractiveTutorial'));
const VideoTutorialLibrary = React.lazy(() => import('./help/VideoTutorialLibrary'));
// Import critical modals directly (not lazy) to avoid hook issues
import AddItemModal from './inventory/AddItemModal';
import EditItemModal from './inventory/EditItemModal';
import ItemDetailModal from './inventory/ItemDetailModal';

const SimpleBarcodeScanner = React.lazy(() => import('./inventory/SimpleBarcodeScanner'));
const BatchBarcodeScannerModal = React.lazy(() => import('./inventory/BatchBarcodeScannerModal'));
const CSVImportModal = React.lazy(() => import('./inventory/CSVImportModal'));
const ReportGenerator = React.lazy(() => import('./inventory/ReportGenerator'));
const BarcodeCacheModal = React.lazy(() => import('./inventory/BarcodeCacheModal'));
const EnhancedLabelPrinting = React.lazy(() => import('./inventory/EnhancedLabelPrinting'));
const LocationBarcodeScanner = React.lazy(() => import('./inventory/LocationBarcodeScanner'));
const AutoBuildConfigurator = React.lazy(() => import('./inventory/AutoBuildConfigurator'));
const BuildConfigurator = React.lazy(() => import('./inventory/BuildConfigurator'));

export function AppLayout() {

  const { addCloudItem, updateCloudItem, inventory } = useAppContext();
  
  // Screen navigation
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showBatchScanner, setShowBatchScanner] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBarcodeCacheModal, setShowBarcodeCacheModal] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showLabelPrintModal, setShowLabelPrintModal] = useState(false);
  const [showLocationScannerModal, setShowLocationScannerModal] = useState(false);
  const [showAutoBuildModal, setShowAutoBuildModal] = useState(false);
  const [showSeederModal, setShowSeederModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);

  // Handlers
  const handleItemClick = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  }, []);

  const handleEditItem = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
  }, []);

  const handleBarcodeScan = useCallback((code: string) => {
    toast.success(`Scanned: ${code}`);
    setShowScanner(false);
  }, []);

  const handleCSVImport = useCallback(async (items: Partial<InventoryItem>[]) => {
    try {
      for (const item of items) {
        await addCloudItem(item as InventoryItem);
      }
      toast.success(`Imported ${items.length} items`);
      setShowImportModal(false);
    } catch (error) {
      toast.error('Failed to import items');
    }
  }, [addCloudItem]);

  const handleExportCSV = useCallback(() => {
    toast.info('Export functionality coming soon');
  }, []);

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <InventoryDashboard
            onShowScanner={() => setShowScanner(true)}
            onShowBatchScanner={() => setShowBatchScanner(true)}
            onShowAddModal={() => setShowAddModal(true)}
            onShowImportModal={() => setShowImportModal(true)}
            onShowBuildModal={() => setShowAutoBuildModal(true)}
            onShowReportModal={() => setShowReportModal(true)}
            onShowBarcodeCacheModal={() => setShowBarcodeCacheModal(true)}
            onShowSavedFiltersModal={() => toast.info('Coming soon')}
            onShowLabelPrintModal={() => setShowLabelPrintModal(true)}
            onItemClick={handleItemClick}
            onEditItem={handleEditItem}
            onExportCSV={handleExportCSV}
            onExportFilteredCSV={handleExportCSV}
          />
        );
      case 'analytics':
        return (
          <FeatureGuard 
            feature="advanced_analytics" 
            featureName="Advanced Analytics" 
            requiredTier="Pro"
          >
            <React.Suspense fallback={<div className="text-white">Loading...</div>}>
              <AdvancedAnalytics />
            </React.Suspense>
          </FeatureGuard>
        );
      case 'ai-insights':
        return (
          <FeatureGuard 
            feature="ai_valuation" 
            featureName="AI Insights" 
            requiredTier="Pro"
          >
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">AI-Powered Insights</h1>
              <React.Suspense fallback={<div className="text-white">Loading...</div>}>
                <NaturalLanguageSearch />
                <PredictiveAnalyticsDashboard />
              </React.Suspense>
            </div>
          </FeatureGuard>
        );
      case 'pwa-settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">PWA Settings</h1>
            <React.Suspense fallback={<div className="text-white">Loading...</div>}>
              <div className="grid md:grid-cols-2 gap-6">
                <PushNotificationManager />
                <BackgroundSyncManager />
              </div>
            </React.Suspense>
          </div>
        );
      case 'pwa-analytics':
        return (
          <FeatureGuard 
            feature="advanced_analytics" 
            featureName="PWA Analytics" 
            requiredTier="Pro"
          >
            <React.Suspense fallback={<div className="text-white">Loading...</div>}>
              <PWAAnalyticsDashboard />
            </React.Suspense>
          </FeatureGuard>
        );
      case 'cohort-analytics':
        return (
          <FeatureGuard 
            feature="advanced_analytics" 
            featureName="Cohort Analytics" 
            requiredTier="Pro"
          >
            <React.Suspense fallback={<div className="text-white">Loading...</div>}>
              <CohortAnalyticsDashboard />
            </React.Suspense>
          </FeatureGuard>
        );
      case 'mobile-analytics':
        return (
          <FeatureGuard 
            feature="advanced_analytics" 
            featureName="Mobile Analytics" 
            requiredTier="Pro"
          >
            <MobileAnalyticsDashboard />
          </FeatureGuard>
        );

      case 'search':
        return (
          <React.Suspense fallback={<div className="text-white">Loading...</div>}>
            <EnhancedAdvancedSearch />
          </React.Suspense>
        );
      case 'reports':
        return (
          <React.Suspense fallback={<div className="text-white">Loading...</div>}>
            <AdvancedReportsDashboard />
          </React.Suspense>
        );
      case 'admin':
        return (
          <React.Suspense fallback={<div className="text-white">Loading...</div>}>
            <AdminDashboard />
          </React.Suspense>
        );
      case 'performance':
        return (
          <React.Suspense fallback={<div className="text-white">Loading...</div>}>
            <PerformanceMonitor />
          </React.Suspense>
        );

      case 'mobile':
        return (
          <React.Suspense fallback={<div className="text-white">Loading...</div>}>
            <MobileOptimizationDashboard />
          </React.Suspense>
        );
      case 'mobile-settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Mobile App Settings</h1>
            <React.Suspense fallback={<div className="text-white">Loading...</div>}>
              <MobileAppSettings />
            </React.Suspense>
          </div>
        );

      case 'teams':
        return (
          <React.Suspense fallback={<div className="text-white">Loading...</div>}>
            <TeamWorkspace />
          </React.Suspense>
        );
      case 'developer':
        return (
          <React.Suspense fallback={<div className="text-white">Loading...</div>}>
            <DeveloperDashboard />
          </React.Suspense>
        );
      case 'security':
        return (
          <React.Suspense fallback={<div className="text-white">Loading...</div>}>
            <SecurityDashboard />
          </React.Suspense>
        );
      case 'notifications':
        return (
          <React.Suspense fallback={<div className="text-white">Loading...</div>}>
            <NotificationCenter />
          </React.Suspense>
        );
      case 'integrations':
        return (
          <React.Suspense fallback={<div className="text-white">Loading...</div>}>
            <IntegrationsDashboardEnhanced />
          </React.Suspense>
        );
      case 'onboarding-analytics':
        return (
          <FeatureGuard 
            feature="team_collaboration" 
            featureName="Onboarding Analytics" 
            requiredTier="Team"
          >
            <React.Suspense fallback={<div className="text-white">Loading...</div>}>
              <OnboardingAnalyticsDashboard />
            </React.Suspense>
          </FeatureGuard>
        );
      case 'help':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Help & Support</h1>
            </div>
            <React.Suspense fallback={<div className="text-white">Loading...</div>}>
              <div className="grid gap-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Interactive Tutorials</h2>
                  <InteractiveTutorial />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Video Tutorials</h2>
                  <VideoTutorialLibrary />
                </div>
              </div>
            </React.Suspense>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-6 pb-32">
            <DataFlowVisualization />
            <InventoryDebugger />
            <SyncStatusDashboard />
            <DatabaseHealthCheck />
            <EnhancedDatabaseViewer />

            <div className="fixed bottom-20 right-4 z-50">
              <button
                onClick={() => setShowSeederModal(true)}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-lg font-semibold"
              >
                Seed Reference Data
              </button>
            </div>
          </div>
        );


      case 'error-monitoring':
        return (
          <React.Suspense fallback={<div className="text-white">Loading...</div>}>
            <ErrorMonitoringDashboard />
          </React.Suspense>
        );
      case 'maintenance':
        return <MaintenanceRecords />;
      case 'profile':
        return <UserProfile />;
      default:
        return null;
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* App Update Notifier */}
      <AppUpdateNotifier />
      
      {/* Navigation */}
      <MainNavigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      
      {/* Main Content with proper scrolling */}
      <div className="md:ml-64 min-h-screen">
        <div className="container mx-auto px-4 py-8 pb-24">
          {renderScreen()}
        </div>
      </div>

      {/* Modals - no Suspense needed since they're directly imported */}
      {showAddModal && (
        <AddItemModal onClose={() => setShowAddModal(false)} onAdd={addCloudItem} />
      )}
      
      {showEditModal && selectedItem && (
        <EditItemModal item={selectedItem} onClose={() => setShowEditModal(false)} onUpdate={updateCloudItem} />
      )}
      
      {showDetailModal && selectedItem && (
        <ItemDetailModal 
          item={selectedItem} 
          onClose={() => setShowDetailModal(false)} 
          onEdit={() => handleEditItem(selectedItem)}
          onShowLocationScanner={() => {
            setShowDetailModal(false);
            setShowLocationScannerModal(true);
          }}
        />
      )}

      
      {showScanner && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SimpleBarcodeScanner onClose={() => setShowScanner(false)} onScan={handleBarcodeScan} />
        </React.Suspense>
      )}
      
      {showBatchScanner && (
        <FeatureGuard 
          feature="barcode_scanning" 
          featureName="Batch Barcode Scanner" 
          requiredTier="Basic"
        >
          <React.Suspense fallback={<div>Loading...</div>}>
            <BatchBarcodeScannerModal onClose={() => setShowBatchScanner(false)} />
          </React.Suspense>
        </FeatureGuard>
      )}

      {showImportModal && (
        <FeatureGuard 
          feature="bulk_import" 
          featureName="Bulk Import" 
          requiredTier="Basic"
        >
          <React.Suspense fallback={<div>Loading...</div>}>
            <CSVImportModal onClose={() => setShowImportModal(false)} onImport={handleCSVImport} />
          </React.Suspense>
        </FeatureGuard>
      )}

      {showReportModal && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ReportGenerator inventory={inventory} onClose={() => setShowReportModal(false)} />
        </React.Suspense>
      )}
      
      {showBarcodeCacheModal && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <BarcodeCacheModal onClose={() => setShowBarcodeCacheModal(false)} />
        </React.Suspense>
      )}
      
      {showSeederModal && <ReferenceDataSeederModal onClose={() => setShowSeederModal(false)} />}
      
      {showLabelPrintModal && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <EnhancedLabelPrinting 
            isOpen={showLabelPrintModal}
            onClose={() => setShowLabelPrintModal(false)}
            items={selectedItems.length > 0 ? selectedItems : inventory}
          />
        </React.Suspense>
      )}
      
      {showLocationScannerModal && selectedItem && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <LocationBarcodeScanner
            isOpen={showLocationScannerModal}
            onClose={() => setShowLocationScannerModal(false)}
            item={selectedItem}
            onLocationAssigned={() => {
              toast.success('Location assigned successfully');
              setShowLocationScannerModal(false);
            }}
          />
        </React.Suspense>
      )}
      
      {showAutoBuildModal && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <AutoBuildConfigurator
            isOpen={showAutoBuildModal}
            onClose={() => setShowAutoBuildModal(false)}
            availableItems={inventory}
          />
        </React.Suspense>
      )}
      
      {showBuildModal && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowBuildModal(false)} className="text-white hover:text-red-500 text-2xl">✕</button>
            </div>
            <React.Suspense fallback={<div>Loading...</div>}>
              <BuildConfigurator />
            </React.Suspense>
          </div>
        </div>
      )}
      
      {/* Enhanced Install Prompt with A/B Testing */}
      <EnhancedInstallPrompt />
      
      {/* AI Help Assistant - Always available */}
      <AIHelpAssistant />
    </div>
  );
}

