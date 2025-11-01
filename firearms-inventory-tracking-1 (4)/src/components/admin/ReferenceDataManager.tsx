import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ManufacturerManager } from './ManufacturerManager';
import { CaliberManager } from './CaliberManager';
import { CategoryManager } from './CategoryManager';
import { ActionManager } from './ActionManager';
import { CartridgeManager } from './CartridgeManager';
import { AmmoTypeManager } from './AmmoTypeManager';
import { StorageLocationManager } from './StorageLocationManager';
import { PowderTypeManager } from './PowderTypeManager';
import { PrimerTypeManager } from './PrimerTypeManager';
import { ReticleTypeManager } from './ReticleTypeManager';
import { UnitOfMeasureManager } from './UnitOfMeasureManager';
import { FieldOfViewManager } from './FieldOfViewManager';

export const ReferenceDataManager: React.FC = () => {
  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-6">Reference Data Management</h2>
      
      <Tabs defaultValue="manufacturers" className="w-full">
        <TabsList className="grid grid-cols-6 w-full bg-slate-800 mb-4">
          <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="calibers">Calibers</TabsTrigger>
          <TabsTrigger value="cartridges">Cartridges</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="ammotypes">Ammo Types</TabsTrigger>
        </TabsList>
        
        <TabsList className="grid grid-cols-6 w-full bg-slate-800">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="powder">Powder Types</TabsTrigger>
          <TabsTrigger value="primers">Primer Types</TabsTrigger>
          <TabsTrigger value="reticles">Reticle Types</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="fov">Field of View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manufacturers">
          <ManufacturerManager />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
        
        <TabsContent value="calibers">
          <CaliberManager />
        </TabsContent>
        
        <TabsContent value="cartridges">
          <CartridgeManager />
        </TabsContent>
        
        <TabsContent value="actions">
          <ActionManager />
        </TabsContent>
        
        <TabsContent value="ammotypes">
          <AmmoTypeManager />
        </TabsContent>
        
        <TabsContent value="locations">
          <StorageLocationManager />
        </TabsContent>
        
        <TabsContent value="powder">
          <PowderTypeManager />
        </TabsContent>
        
        <TabsContent value="primers">
          <PrimerTypeManager />
        </TabsContent>
        
        <TabsContent value="reticles">
          <ReticleTypeManager />
        </TabsContent>
        
        <TabsContent value="units">
          <UnitOfMeasureManager />
        </TabsContent>
        
        <TabsContent value="fov">
          <FieldOfViewManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};