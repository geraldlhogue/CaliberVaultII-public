import React, { useState, useEffect } from 'react';
import { ItemCategory } from '../../types/inventory';
import { UniversalFields } from './UniversalFields';
import { NumericInput } from './NumericInput';
import { AttributeFieldsAmmo } from './AttributeFieldsAmmo';
import { AttributeFieldsOptics } from './AttributeFieldsOptics';
import { AttributeFieldsSuppressors } from './AttributeFieldsSuppressors';
import { AttributeFieldsMagazines } from './AttributeFieldsMagazines';
import { AttributeFieldsAccessories } from './AttributeFieldsAccessories';
import { AttributeFieldsReloading } from './AttributeFieldsReloading';
import { AttributeFieldsCases } from './AttributeFieldsCases';
import { AttributeFieldsPrimers } from './AttributeFieldsPrimers';
import { AttributeFieldsPowder } from './AttributeFieldsPowder';
import { supabase } from '@/lib/supabase';



interface AttributeFieldsProps {
  category: ItemCategory;
  formData: any;
  setFormData: (data: any) => void;
  setCategory: (cat: ItemCategory) => void;
  categoryManufacturers: any[];
  onProductDataReceived?: (productData: any) => void;
}

export const AttributeFields: React.FC<AttributeFieldsProps> = ({
  category, formData, setFormData, setCategory, categoryManufacturers, onProductDataReceived
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [cartridges, setCartridges] = useState<any[]>([]);
  const [calibers, setCalibers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [ammoTypes, setAmmoTypes] = useState<any[]>([]);
  const [reticleTypes, setReticleTypes] = useState<any[]>([]);
  const [opticTypes, setOpticTypes] = useState<any[]>([]);
  const [bulletTypes, setBulletTypes] = useState<any[]>([]);
  const [magnifications, setMagnifications] = useState<any[]>([]);
  const [turretTypes, setTurretTypes] = useState<any[]>([]);
  const [mountingTypes, setMountingTypes] = useState<any[]>([]);
  const [suppressorMaterials, setSuppressorMaterials] = useState<any[]>([]);
  const [primerTypes, setPrimerTypes] = useState<any[]>([]);
  const [powderTypes, setPowderTypes] = useState<any[]>([]);
  useEffect(() => {
    fetchReferenceData();
  }, [category]);
  
  const fetchReferenceData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== FETCHING REFERENCE DATA ===');
      console.log('Category:', category);
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User:', user?.id);
      
      // Fetch all reference data in parallel with proper error handling
      const queries = [
        supabase.from('units_of_measure').select('*').order('unit_name'),
        supabase.from('cartridges').select('*').order('cartridge'),
        supabase.from('calibers').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        user ? supabase.from('locations').select('*').eq('user_id', user.id).order('name') 
             : Promise.resolve({ data: [], error: null }),
        supabase.from('actions').select('*').order('name'),

        supabase.from('ammo_types').select('*').order('name'),
        supabase.from('manufacturers').select('*').order('name'),
        supabase.from('reticle_types').select('*').order('name'),
        supabase.from('optic_types').select('*').order('name'),
        supabase.from('bullet_types').select('*').order('name'),
        supabase.from('magnifications').select('*').order('magnification'),
        supabase.from('turret_types').select('*').order('name'),
        supabase.from('mounting_types').select('*').order('name'),
        supabase.from('suppressor_materials').select('*').order('name'),
        supabase.from('primer_types').select('*').order('name'),
        supabase.from('powder_types').select('*').order('name')
      ];
      
      // Execute all queries
      const results = await Promise.allSettled(queries);
      
      console.log('Query results summary:', results.map((r, i) => ({
        index: i,
        status: r.status,
        dataCount: r.status === 'fulfilled' ? ((r.value as any)?.data?.length || 0) : 0
      })));
      
      // Helper to safely extract data
      const extractData = (result: any, defaultValue: any[] = []) => {
        if (result?.status === 'fulfilled' && result?.value?.data) {
          return result.value.data;
        }
        if (result?.status === 'fulfilled' && Array.isArray(result?.value)) {
          return result.value;
        }
        return defaultValue;
      };
      // Set all the state values
      setUnits(extractData(results[0]));
      setCartridges(extractData(results[1]));
      setCalibers(extractData(results[2]));
      setCategories(extractData(results[3]));
      setLocations(extractData(results[4]));
      setActions(extractData(results[5]));
      setAmmoTypes(extractData(results[6]));
      
      // Handle manufacturers with category filtering
      const allManufacturers = extractData(results[7]);
      if (category && allManufacturers.length > 0) {
        let filtered = allManufacturers;
        switch (category) {
          case 'firearms':
            filtered = allManufacturers.filter((m: any) => m.firearm_indicator);
            break;
          case 'optics':
            filtered = allManufacturers.filter((m: any) => m.optics_indicator);
            break;
          case 'ammunition':
            filtered = allManufacturers.filter((m: any) => m.bullet_indicator || m.makes_ammunition);
            break;
          case 'suppressors':
            filtered = allManufacturers.filter((m: any) => m.suppressor_indicator);
            break;
        }
        setManufacturers(filtered.length > 0 ? filtered : allManufacturers);
      } else {
        setManufacturers(allManufacturers);
      }
      
      setReticleTypes(extractData(results[8]));
      setOpticTypes(extractData(results[9]));
      setBulletTypes(extractData(results[10]));
      setMagnifications(extractData(results[11]));
      setTurretTypes(extractData(results[12]));
      setMountingTypes(extractData(results[13]));
      setSuppressorMaterials(extractData(results[14]));
      setPrimerTypes(extractData(results[15]));
      setPowderTypes(extractData(results[16]));
      
      console.log('=== REFERENCE DATA LOADED ===');
      console.log('Categories:', categories.length);
      console.log('Locations:', locations.length);
      console.log('Manufacturers:', manufacturers.length);
      console.log('All data counts:', {
        units: units.length,
        cartridges: cartridges.length,
        calibers: calibers.length,
        categories: categories.length,
        locations: locations.length,
        actions: actions.length,
        manufacturers: manufacturers.length
      });
      
      // Only error if critical tables are empty - be lenient with others
      const hasCategories = extractData(results[3]).length > 0;
      const hasLocations = extractData(results[4]).length > 0;
      
      if (!hasCategories) {
        setError('No categories found. Please run "Seed Reference Tables" in the Admin panel.');
      } else if (!hasLocations) {
        setError('No storage locations found. Please run "Seed Reference Tables" in the Admin panel.');
      }
      
    } catch (error) {
      console.error('Error fetching reference data:', error);
      setError('Failed to load form data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };


  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (field === 'cartridge' && value && category === 'firearms' && cartridges && calibers) {
      const selectedCart = cartridges.find(c => c.cartridge === value);
      if (selectedCart && calibers.length > 0) {
        const matchingCaliber = calibers.find(c => 
          Math.abs(c.bullet_diameter - selectedCart.bullet_diameter) < 0.001
        );
        if (matchingCaliber) {
          setFormData({ ...formData, cartridge: value, caliber: matchingCaliber.name || matchingCaliber.caliber_decimal });
        }
      }
    }
  };

  const getUnitsByCategory = (cat: string) => 
    (units || []).filter(u => u.category === cat).map(u => ({
      code: u.unit_code,
      name: u.unit_name
    }));
  
  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading form fields...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">{error}</div>
        <button 
          onClick={() => fetchReferenceData()}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2 font-medium">
            Category <span className="text-red-500 text-lg">*</span>
          </label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value as ItemCategory)} 
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" 
            required
          >
            <option value="">Select Category...</option>
            {(categories || []).map(cat => (
              <option key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2 font-medium">Storage Location</label>
          <select 
            value={formData.storageLocation || ''} 
            onChange={(e) => update('storageLocation', e.target.value)} 
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base"
          >
            <option value="">Select Location...</option>
            {(locations || []).map(loc => (
              <option key={loc.id} value={loc.name}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2 font-medium">
            Manufacturer <span className="text-red-500 text-lg">*</span>
          </label>
          <select 
            value={formData.manufacturer || ''} 
            onChange={(e) => update('manufacturer', e.target.value)} 
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" 
            required
          >
            <option value="">Select Manufacturer...</option>
            {(manufacturers || []).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2 font-medium">
            Model <span className="text-red-500 text-lg">*</span>
          </label>
          <input 
            type="text" 
            value={formData.model || formData.modelNumber || ''} 
            onChange={(e) => {
              const value = e.target.value;
              update('model', value);
              update('modelNumber', value);
            }}
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" 
            required 
            placeholder="Enter model name/number" 
          />
        </div>
      </div>

      
      <UniversalFields formData={formData} update={update} onProductDataReceived={onProductDataReceived} />
      
      {category === 'firearms' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2">Cartridge <span className="text-red-500">*</span></label>
              <select value={formData.cartridge || ''} onChange={(e) => update('cartridge', e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" required>
                <option value="">Select...</option>
                {(cartridges || []).map(c => (
                  <option key={c.id} value={c.cartridge}>{c.cartridge}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Caliber <span className="text-red-500">*</span></label>
              <select value={formData.caliber || ''} onChange={(e) => update('caliber', e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" required>
                <option value="">Select...</option>
                {(calibers || []).map(c => (
                  <option key={c.id} value={c.name || c.caliber_decimal}>
                    {c.name || `.${c.caliber_decimal}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2">Action</label>
              <select value={formData.action_id || ''} onChange={(e) => update('action_id', e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
                <option value="">Select...</option>
                {(actions || []).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <NumericInput label="Barrel Length" value={formData.barrelLengthValue || ''} unit={formData.barrelLengthUom || 'in'}
              units={getUnitsByCategory('length')} onChange={(value, unit) => setFormData({...formData, barrelLengthValue: value, barrelLengthUom: unit})}
              placeholder="16" allowDecimal={true} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumericInput label="Capacity" value={formData.capacity || ''} unit="rds" units={[{code: 'rds', name: 'rounds'}]}
              onChange={(value) => update('capacity', value)} placeholder="30" />
            <NumericInput label="Round Count" value={formData.roundCount || ''} unit="rds" units={[{code: 'rds', name: 'rounds'}]}
              onChange={(value) => update('roundCount', value)} placeholder="0" />
          </div>
        </>
      )}
      
      {category === 'ammunition' && (
        <AttributeFieldsAmmo formData={formData} update={update} setFormData={setFormData}
          ammoTypes={ammoTypes} bulletTypes={bulletTypes} cartridges={cartridges}
          primerTypes={primerTypes} powderTypes={powderTypes} />
      )}
      
      {category === 'optics' && (
        <AttributeFieldsOptics formData={formData} update={update} setFormData={setFormData}
          magnifications={magnifications} reticleTypes={reticleTypes} opticTypes={opticTypes} turretTypes={turretTypes} />
      )}
      
      {category === 'suppressors' && (
        <AttributeFieldsSuppressors formData={formData} update={update} setFormData={setFormData}
          mountingTypes={mountingTypes} suppressorMaterials={suppressorMaterials} cartridges={cartridges} />
      )}
      
      {category === 'magazines' && (
        <AttributeFieldsMagazines formData={formData} setFormData={setFormData} calibers={calibers} />
      )}
      
      {category === 'accessories' && (
        <AttributeFieldsAccessories formData={formData} setFormData={setFormData} />
      )}
      
      {category === 'reloading' && (
        <AttributeFieldsReloading formData={formData} setFormData={setFormData} calibers={calibers} />
      )}
      
      {category === 'bullets' && (
        <AttributeFieldsReloading formData={formData} setFormData={setFormData} calibers={calibers} />
      )}
      
      {category === 'cases' && (
        <AttributeFieldsCases formData={formData} setFormData={setFormData} calibers={calibers} />
      )}
      
      {category === 'primers' && (
        <AttributeFieldsPrimers formData={formData} setFormData={setFormData} primerTypes={primerTypes} />
      )}
      
      {category === 'powder' && (
        <AttributeFieldsPowder formData={formData} setFormData={setFormData} powderTypes={powderTypes} />
      )}
    </>
  );
};