export type ItemCategory = 
  | 'firearms' 
  | 'optics' 
  | 'magazines' 
  | 'ammunition' 
  | 'reloading'
  | 'accessories'
  | 'suppressors'
  | 'bullets'
  | 'cases'
  | 'primers'
  | 'powder';

// Base inventory item (from inventory table)
export interface BaseInventoryItem {
  id: string;
  user_id: string;
  organization_id?: string;
  category_id: string;
  name: string;
  manufacturer_id?: string;
  model?: string;
  description?: string;
  quantity: number;
  location_id?: string;
  location_notes?: string;
  purchase_price?: number;
  purchase_date?: string;
  current_value?: number;
  sku?: string;
  barcode?: string;
  upc?: string;
  photos?: string[];
  documents?: string[];
  status?: 'active' | 'sold' | 'transferred' | 'lost' | 'stolen';
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  notes?: string;
  tags?: string[];
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

// Category-specific detail types
export interface FirearmDetails {
  id: string;
  inventory_id: string;
  firearm_type_id?: string;
  caliber_id?: string;
  cartridge_id?: string; // FK to cartridges table
  serial_number?: string;
  barrel_length?: number;
  overall_length?: number;
  weight?: number;
  capacity?: number;
  action_id?: string; // FK to actions table (replaces action text field)
  action?: string; // DEPRECATED: Use action_id instead
  finish?: string;
  round_count?: number;
  last_cleaned_round_count?: number;
  is_nfa?: boolean;
  nfa_item_type?: string;
  form_4_approved_date?: string;
  tax_stamp_number?: string;
}

export interface OpticDetails {
  id: string;
  inventory_id: string;
  optic_type_id?: string;
  magnification_id?: string;
  objective_diameter?: number;
  tube_diameter?: number;
  reticle_type_id?: string;
  turret_type_id?: string;
  focal_plane?: 'FFP' | 'SFP';
  illuminated?: boolean;
  parallax_adjustment?: boolean;
  eye_relief?: number;
  field_of_view?: string;
  mounting_type_id?: string;
  zero_distance?: number;
}

export interface SuppressorDetails {
  id: string;
  inventory_id: string;
  caliber_id?: string;
  material_id?: string;
  length?: number;
  diameter?: number;
  weight?: number;
  decibel_reduction?: number;
  mounting_type_id?: string;
  serial_number?: string;
  form_4_approved_date?: string;
  tax_stamp_number?: string;
}

export interface MagazineDetails {
  id: string;
  inventory_id: string;
  caliber_id?: string;
  capacity?: number;
  material?: string;
  firearm_compatibility?: string;
}

export interface AccessoryDetails {
  id: string;
  inventory_id: string;
  accessory_type?: string;
  compatibility?: string;
  material?: string;
  dimensions?: string;
  weight?: number;
}

export interface AmmunitionDetails {
  id: string;
  inventory_id: string;
  caliber_id?: string;
  cartridge_id?: string; // FK to cartridges table
  bullet_type_id?: string;
  bullet_weight?: number; // Grain weight
  muzzle_velocity?: number;
  rounds_per_box?: number;
  is_reloaded?: boolean;
  brass_condition?: string;
}

export interface CaseDetails {
  id: string;
  inventory_id: string;
  caliber_id?: string;
  material?: string;
  condition?: string;
  times_fired?: number;
  headstamp?: string;
}

export interface PowderDetails {
  id: string;
  inventory_id: string;
  powder_type_id?: string;
  burn_rate?: string;
  lot_number?: string;
  weight_per_container?: number;
  unit_of_measure_id?: string;
}

export interface PrimerDetails {
  id: string;
  inventory_id: string;
  primer_type?: string;
  primer_size?: string;
  lot_number?: string;
}

export interface BulletDetails {
  id: string;
  inventory_id: string;
  caliber_id?: string;
  bullet_type_id?: string;
  weight?: number;
  diameter?: number;
  coefficient?: number;
  lot_number?: string;
}

export interface ReloadingComponentDetails {
  id: string;
  inventory_id: string;
  component_type?: string;
  compatibility?: string;
  specifications?: any;
}

// Combined inventory item with details
export type InventoryItem = BaseInventoryItem & {
  category?: string;
  manufacturer?: string;
  firearm_details?: FirearmDetails;
  optic_details?: OpticDetails;
  suppressor_details?: SuppressorDetails;
  magazine_details?: MagazineDetails;
  accessory_details?: AccessoryDetails;
  ammunition_details?: AmmunitionDetails;
  case_details?: CaseDetails;
  powder_details?: PowderDetails;
  primer_details?: PrimerDetails;
  bullet_details?: BulletDetails;
  reloading_component_details?: ReloadingComponentDetails;
};

export interface Manufacturer {
  id: string;
  name: string;
  phone?: string;
  website?: string;
  customerService?: string;
}

export interface FirearmBuild {
  id: string;
  name: string;
  itemIds: string[];
  totalCost: number;
  createdDate: string;
}
