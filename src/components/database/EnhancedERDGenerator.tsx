import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Download, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

interface Table {
  name: string;
  columns: Column[];
  x: number;
  y: number;
  category: string;
}

interface Relationship {
  from: string;
  to: string;
  fromColumn: string;
  toColumn: string;
  type: 'one-to-many' | 'one-to-one';
}

const COLORS = {
  inventory: '#3b82f6',
  details: '#10b981',
  reference: '#f59e0b',
  user: '#8b5cf6',
  collaboration: '#ec4899',
};

interface EnhancedERDGeneratorProps {
  onTableClick?: (tableName: string) => void;
}

export function EnhancedERDGenerator({ onTableClick }: EnhancedERDGeneratorProps = {}) {
  const [tables, setTables] = useState<Table[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [zoom, setZoom] = useState(0.8);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    // Define the new normalized schema structure
    const schemaDefinition = [
      {
        name: 'inventory',
        category: 'inventory',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'user_id', type: 'uuid', nullable: false, isPrimaryKey: false, isForeignKey: true },
          { name: 'category', type: 'text', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'name', type: 'text', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'manufacturer_id', type: 'uuid', nullable: true, isPrimaryKey: false, isForeignKey: true },
          { name: 'quantity', type: 'integer', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'location_id', type: 'uuid', nullable: true, isPrimaryKey: false, isForeignKey: true },
          { name: 'created_at', type: 'timestamp', nullable: false, isPrimaryKey: false, isForeignKey: false },
        ],
        x: 50,
        y: 50,
      },
      {
        name: 'firearms_details',
        category: 'details',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'inventory_id', type: 'uuid', nullable: false, isPrimaryKey: false, isForeignKey: true },
          { name: 'serial_number', type: 'text', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'caliber_id', type: 'uuid', nullable: true, isPrimaryKey: false, isForeignKey: true },
          { name: 'action_id', type: 'uuid', nullable: true, isPrimaryKey: false, isForeignKey: true },
          { name: 'barrel_length', type: 'numeric', nullable: true, isPrimaryKey: false, isForeignKey: false },
        ],
        x: 400,
        y: 50,
      },
      {
        name: 'ammunition_details',
        category: 'details',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'inventory_id', type: 'uuid', nullable: false, isPrimaryKey: false, isForeignKey: true },
          { name: 'caliber_id', type: 'uuid', nullable: true, isPrimaryKey: false, isForeignKey: true },
          { name: 'grain_weight', type: 'integer', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'bullet_type_id', type: 'uuid', nullable: true, isPrimaryKey: false, isForeignKey: true },
        ],
        x: 400,
        y: 300,
      },
      {
        name: 'optics_details',
        category: 'details',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'inventory_id', type: 'uuid', nullable: false, isPrimaryKey: false, isForeignKey: true },
          { name: 'magnification', type: 'text', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'reticle_type_id', type: 'uuid', nullable: true, isPrimaryKey: false, isForeignKey: true },
        ],
        x: 400,
        y: 500,
      },
      {
        name: 'manufacturers',
        category: 'reference',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'name', type: 'text', nullable: false, isPrimaryKey: false, isForeignKey: false },
        ],
        x: 750,
        y: 50,
      },
      {
        name: 'calibers',
        category: 'reference',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'name', type: 'text', nullable: false, isPrimaryKey: false, isForeignKey: false },
        ],
        x: 750,
        y: 250,
      },
    ];

    const parsedTables = schemaDefinition.map(def => ({
      name: def.name,
      columns: def.columns,
      x: def.x,
      y: def.y,
      category: def.category,
    }));

    setTables(parsedTables);
    setRelationships(extractRelationships(parsedTables));
  };

  const extractRelationships = (tables: Table[]): Relationship[] => {
    const rels: Relationship[] = [
      { from: 'firearms_details', to: 'inventory', fromColumn: 'inventory_id', toColumn: 'id', type: 'one-to-one' },
      { from: 'ammunition_details', to: 'inventory', fromColumn: 'inventory_id', toColumn: 'id', type: 'one-to-one' },
      { from: 'optics_details', to: 'inventory', fromColumn: 'inventory_id', toColumn: 'id', type: 'one-to-one' },
      { from: 'inventory', to: 'manufacturers', fromColumn: 'manufacturer_id', toColumn: 'id', type: 'one-to-many' },
      { from: 'firearms_details', to: 'calibers', fromColumn: 'caliber_id', toColumn: 'id', type: 'one-to-many' },
      { from: 'ammunition_details', to: 'calibers', fromColumn: 'caliber_id', toColumn: 'id', type: 'one-to-many' },
    ];
    return rels;
  };

  const downloadSVG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'normalized-schema-erd.svg';
    a.click();
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Normalized Schema ERD</h2>
          <p className="text-sm text-muted-foreground">{tables.length} tables - 3NF normalized</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}><ZoomIn className="w-4 h-4" /></Button>
          <Button size="sm" onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))}><ZoomOut className="w-4 h-4" /></Button>
          <Button size="sm" onClick={fetchSchema}><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={downloadSVG}><Download className="w-4 h-4" /></Button>
        </div>
      </div>

      <Alert className="mb-4">
        <AlertDescription>
          New normalized schema: Single <Badge>inventory</Badge> table with category-specific detail tables
        </AlertDescription>
      </Alert>

      <div className="mb-4 flex gap-4 text-sm">
        {Object.entries(COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
            <span className="capitalize">{cat}</span>
          </div>
        ))}
      </div>

      <svg ref={svgRef} width="100%" height="800" className="border bg-gray-50">
        <g transform={`scale(${zoom})`}>
          {relationships.map((rel, idx) => {
            const fromTable = tables.find(t => t.name === rel.from);
            const toTable = tables.find(t => t.name === rel.to);
            if (!fromTable || !toTable) return null;
            return (
              <line
                key={idx}
                x1={fromTable.x + 125}
                y1={fromTable.y + 30}
                x2={toTable.x + 125}
                y2={toTable.y + 30}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray={rel.type === 'one-to-one' ? '5,5' : '0'}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
            </marker>
          </defs>
          {tables.map(table => (
            <g
              key={table.name}
              transform={`translate(${table.x},${table.y})`}
              onClick={() => {
                setSelectedTable(table.name);
                onTableClick?.(table.name);
              }}
              className="cursor-pointer"
            >
              <rect
                width="250"
                height={Math.min(table.columns.length * 20 + 40, 300)}
                fill={selectedTable === table.name ? COLORS[table.category] : `${COLORS[table.category]}dd`}
                stroke={selectedTable === table.name ? '#000' : '#666'}
                strokeWidth={selectedTable === table.name ? 3 : 1}
                rx="8"
              />
              <text x="10" y="25" fill="white" fontWeight="bold" fontSize="14">{table.name}</text>
              <line x1="0" y1="35" x2="250" y2="35" stroke="white" strokeWidth="1" />
              {table.columns.map((col, idx) => (
                <text key={col.name} x="10" y={55 + idx * 20} fill="white" fontSize="11">
                  {col.isPrimaryKey && '🔑 '}
                  {col.isForeignKey && '🔗 '}
                  {col.name}
                </text>
              ))}
            </g>
          ))}
        </g>
      </svg>
    </Card>
  );
}
