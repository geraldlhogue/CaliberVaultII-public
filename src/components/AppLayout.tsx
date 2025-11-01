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

// Lazy load components
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
const InteractiveTutorial = React.lazy(() => import('./help/InteractiveTutorial'));
const VideoTutorialLibrary = React.lazy(() => import('./help/VideoTutorialLibrary'));
const AddItemModal = React.lazy(() => import('./inventory/AddItemModal'));
const EditItemModal = React.lazy(() => import('./inventory/EditItemModal'));
const ItemDetailModal = React.lazy(() => import('./inventory/ItemDetailModal'));
const SimpleBarcodeScanner = React.lazy(() => import('./inventory/SimpleBarcodeScanner'));
const BatchBarcodeScannerModal = React.lazy(() => import('./inventory/BatchBarcodeScannerModal'));
const CSVImportModal = React.lazy(() => import('./inventory/CSVImportModal'));
const ReportGenerator = React.lazy(() => import('./inventory/ReportGenerator'));
const BarcodeCacheModal = React.lazy(() => import('./inventory/BarcodeCacheModal'));
const EnhancedLabelPrinting = React.lazy(() => import('./inventory/EnhancedLabelPrinting'));
const LocationBarcodeScanner = React.lazy(() => import('./inventory/LocationBarcodeScanner'));
const AutoBuildConfigurator = React.lazy(() => import('./inventory/AutoBuildConfigurator'));
const BuildConfigurator = React.lazy(() => import('./inventory/BuildConfigurator'));
const AppUpdateNotifier = React.lazy(() => import('./pwa/AppUpdateNotifier'));
const MainNavigation = React.lazy(() => import('./navigation/MainNavigation'));
const EnhancedInstallPrompt = React.lazy(() => import('./pwa/EnhancedInstallPrompt'));
const AIHelpAssistant = React.lazy(() => import('./help/AIHelpAssistant'));

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
            <AdvancedAnalytics />
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
              <NaturalLanguageSearch />
              <PredictiveAnalyticsDashboard />
            </div>
          </FeatureGuard>
        );
      case 'pwa-settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">PWA Settings</h1>
            <div className="grid md:grid-cols-2 gap-6">
              <PushNotificationManager />
              <BackgroundSyncManager />
            </div>
          </div>
        );
      case 'pwa-analytics':
        return (
          <FeatureGuard 
            feature="advanced_analytics" 
            featureName="PWA Analytics" 
            requiredTier="Pro"
          >
            <PWAAnalyticsDashboard />
          </FeatureGuard>
        );
      case 'cohort-analytics':
        return (
          <FeatureGuard 
            feature="advanced_analytics" 
            featureName="Cohort Analytics" 
            requiredTier="Pro"
          >
            <CohortAnalyticsDashboard />
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
        return <EnhancedAdvancedSearch />;
      case 'reports':
        return <AdvancedReportsDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'performance':
        return <PerformanceMonitor />;

      case 'mobile':
        return <MobileOptimizationDashboard />;
      case 'mobile-settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Mobile App Settings</h1>
            <MobileAppSettings />
          </div>
        );

      case 'teams':
        return <TeamWorkspace />;
      case 'developer':
        return <DeveloperDashboard />;
      case 'security':
        return <SecurityDashboard />;
      case 'notifications':
        return <NotificationCenter />;
      case 'integrations':
        return <IntegrationsDashboardEnhanced />;
      case 'onboarding-analytics':
        return (
          <FeatureGuard 
            feature="team_collaboration" 
            featureName="Onboarding Analytics" 
            requiredTier="Team"
          >
            <OnboardingAnalyticsDashboard />
          </FeatureGuard>
        );
      case 'help':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Help & Support</h1>
            </div>
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
          </div>
        );





      case 'database':
        return (
          <div className="space-y-6">
            <DataFlowVisualization />
            <InventoryDebugger />
            <SyncStatusDashboard />
            <DatabaseHealthCheck />
            <EnhancedDatabaseViewer />

            <button
              onClick={() => setShowSeederModal(true)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
            >
              Seed Reference Data
            </button>
          </div>
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

      {/* Modals */}
      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} onAdd={addCloudItem} />}
      {showEditModal && selectedItem && <EditItemModal item={selectedItem} onClose={() => setShowEditModal(false)} onUpdate={updateCloudItem} />}
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
      {showScanner && <SimpleBarcodeScanner onClose={() => setShowScanner(false)} onScan={handleBarcodeScan} />}
      {showBatchScanner && (
        <FeatureGuard 
          feature="barcode_scanning" 
          featureName="Batch Barcode Scanner" 
          requiredTier="Basic"
        >
          <BatchBarcodeScannerModal onClose={() => setShowBatchScanner(false)} />
        </FeatureGuard>
      )}

      {showImportModal && (
        <FeatureGuard 
          feature="bulk_import" 
          featureName="Bulk Import" 
          requiredTier="Basic"
        >
          <CSVImportModal onClose={() => setShowImportModal(false)} onImport={handleCSVImport} />
        </FeatureGuard>
      )}

      {showReportModal && <ReportGenerator inventory={inventory} onClose={() => setShowReportModal(false)} />}
      {showBarcodeCacheModal && <BarcodeCacheModal onClose={() => setShowBarcodeCacheModal(false)} />}
      {showSeederModal && <ReferenceDataSeederModal onClose={() => setShowSeederModal(false)} />}
      {showLabelPrintModal && (
        <EnhancedLabelPrinting 
          isOpen={showLabelPrintModal}
          onClose={() => setShowLabelPrintModal(false)}
          items={selectedItems.length > 0 ? selectedItems : inventory}
        />
      )}
      {showLocationScannerModal && selectedItem && (
        <LocationBarcodeScanner
          isOpen={showLocationScannerModal}
          onClose={() => setShowLocationScannerModal(false)}
          item={selectedItem}
          onLocationAssigned={() => {
            toast.success('Location assigned successfully');
            setShowLocationScannerModal(false);
          }}
        />
      )}
      {showAutoBuildModal && (
        <AutoBuildConfigurator
          isOpen={showAutoBuildModal}
          onClose={() => setShowAutoBuildModal(false)}
          availableItems={inventory}
        />
      )}
      {showBuildModal && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowBuildModal(false)} className="text-white hover:text-red-500 text-2xl">✕</button>
            </div>
            <BuildConfigurator />
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


