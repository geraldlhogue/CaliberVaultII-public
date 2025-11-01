import React, { useState, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ManufacturerManager } from './ManufacturerManager';
import { CaliberManager } from './CaliberManager';
import { CartridgeManager } from './CartridgeManager';
import { ActionManager } from './ActionManager';
import { BulletTypeManager } from './BulletTypeManager';
import { PowderTypeManager } from './PowderTypeManager';
import { PrimerTypeManager } from './PrimerTypeManager';
import { ReticleTypeManager } from './ReticleTypeManager';
import { UnitOfMeasureManager } from './UnitOfMeasureManager';
import { CategoryManager } from './CategoryManager';
import { MountingTypeManager } from './MountingTypeManager';
import { SuppressorMaterialManager } from './SuppressorMaterialManager';
import { TurretTypeManager } from './TurretTypeManager';
import { TierLimitsManager } from './TierLimitsManager';
import { ErrorLogViewer } from './ErrorLogViewer';
import { RealtimeErrorMonitor } from './RealtimeErrorMonitor';
import { ErrorAnalyticsDashboard } from './ErrorAnalyticsDashboard';
import { EnhancedPerformanceMonitor } from './EnhancedPerformanceMonitor';
import { ERDGenerator } from '@/components/database/ERDGenerator';
import { VisualQueryBuilder } from '@/components/database/VisualQueryBuilder';
import { TableDataInspector } from '@/components/database/TableDataInspector';
import { ComprehensiveCategoryAudit } from '@/components/testing/ComprehensiveCategoryAudit';
import { SchemaValidationTool } from '@/components/testing/SchemaValidationTool';
import { EnhancedERDGenerator } from '@/components/database/EnhancedERDGenerator';
import { NewSchemaMigrationTool } from '@/components/migration/NewSchemaMigrationTool';
import { ReferenceDataSeederModal } from '@/components/database/ReferenceDataSeederModal';

const SimpleDatabaseTest = lazy(() => import('@/components/database/SimpleDatabaseTest').then(m => ({ default: m.SimpleDatabaseTest })));

export function AdminDashboard() {
  const [showTest, setShowTest] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showMigrationTool, setShowMigrationTool] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b px-2 py-1 flex-shrink-0 bg-slate-900">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-sm font-semibold">Admin Dashboard</h1>
          <div className="flex items-center gap-1">
            <ReferenceDataSeederModal />
            <Button onClick={() => setShowTest(!showTest)} variant="ghost" size="sm" className="h-6 text-xs px-1.5">
              {showTest ? 'Hide' : 'Test'}
            </Button>
          </div>
        </div>
        {showTest && (
          <div className="mt-1 text-xs"><Suspense fallback={<div>Loading...</div>}><SimpleDatabaseTest /></Suspense></div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="manufacturers" className="h-full flex flex-col">
          <TabsList className="grid grid-cols-4 lg:grid-cols-10 gap-0.5 p-1 h-auto flex-shrink-0">
            <TabsTrigger value="tiers" className="text-xs py-1">Tiers</TabsTrigger>
            <TabsTrigger value="manufacturers" className="text-xs py-1">Manufacturers</TabsTrigger>
            <TabsTrigger value="calibers" className="text-xs py-1">Calibers</TabsTrigger>
            <TabsTrigger value="cartridges" className="text-xs py-1">Cartridges</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs py-1">Actions</TabsTrigger>
            <TabsTrigger value="bullet" className="text-xs py-1">Bullet</TabsTrigger>
            <TabsTrigger value="powder" className="text-xs py-1">Powder</TabsTrigger>
            <TabsTrigger value="primer" className="text-xs py-1">Primer</TabsTrigger>
            <TabsTrigger value="reticle" className="text-xs py-1">Reticle</TabsTrigger>
            <TabsTrigger value="units" className="text-xs py-1">Units</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs py-1">Categories</TabsTrigger>
            <TabsTrigger value="mounting" className="text-xs py-1">Mounting</TabsTrigger>
            <TabsTrigger value="materials" className="text-xs py-1">Materials</TabsTrigger>
            <TabsTrigger value="turrets" className="text-xs py-1">Turrets</TabsTrigger>
            <TabsTrigger value="schema" className="text-xs py-1">Schema</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs py-1">Audit</TabsTrigger>
            <TabsTrigger value="errors" className="text-xs py-1">Errors</TabsTrigger>
            <TabsTrigger value="monitor" className="text-xs py-1">Monitor</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs py-1">Analytics</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs py-1">Performance</TabsTrigger>
            <TabsTrigger value="migration" className="text-xs py-1">Migration</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-1">
            <TabsContent value="tiers" className="m-0"><TierLimitsManager /></TabsContent>
            <TabsContent value="manufacturers" className="m-0"><ManufacturerManager /></TabsContent>
            <TabsContent value="calibers" className="m-0"><CaliberManager /></TabsContent>
            <TabsContent value="cartridges" className="m-0"><CartridgeManager /></TabsContent>
            <TabsContent value="actions" className="m-0"><ActionManager /></TabsContent>
            <TabsContent value="bullet" className="m-0"><BulletTypeManager /></TabsContent>
            <TabsContent value="powder" className="m-0"><PowderTypeManager /></TabsContent>
            <TabsContent value="primer" className="m-0"><PrimerTypeManager /></TabsContent>
            <TabsContent value="reticle" className="m-0"><ReticleTypeManager /></TabsContent>
            <TabsContent value="units" className="m-0"><UnitOfMeasureManager /></TabsContent>
            <TabsContent value="categories" className="m-0"><CategoryManager /></TabsContent>
            <TabsContent value="mounting" className="m-0"><MountingTypeManager /></TabsContent>
            <TabsContent value="materials" className="m-0"><SuppressorMaterialManager /></TabsContent>
            <TabsContent value="turrets" className="m-0"><TurretTypeManager /></TabsContent>
            <TabsContent value="schema" className="m-0 relative space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-card border rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4">Database Schema</h2>
                  <ERDGenerator onTableClick={setSelectedTable} />
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4">Query Builder</h2>
                  <VisualQueryBuilder />
                </div>
              </div>
              {selectedTable && <TableDataInspector tableName={selectedTable} onClose={() => setSelectedTable(null)} />}
            </TabsContent>
            <TabsContent value="audit" className="m-0 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ComprehensiveCategoryAudit />
                <SchemaValidationTool />
              </div>
            </TabsContent>
            <TabsContent value="errors" className="m-0"><ErrorLogViewer /></TabsContent>
            <TabsContent value="monitor" className="m-0"><RealtimeErrorMonitor /></TabsContent>
            <TabsContent value="analytics" className="m-0"><ErrorAnalyticsDashboard /></TabsContent>
            <TabsContent value="performance" className="m-0"><EnhancedPerformanceMonitor /></TabsContent>
            <TabsContent value="migration" className="m-0 space-y-4">
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Schema Migration</h2>
                <Button onClick={() => setShowMigrationTool(true)}>Open Migration Tool</Button>
                <EnhancedERDGenerator onTableClick={setSelectedTable} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <NewSchemaMigrationTool isOpen={showMigrationTool} onClose={() => setShowMigrationTool(false)} />
    </div>
  );
}

export default AdminDashboard;
