import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react';

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
}

const COLORS = {
  inventory: '#3b82f6',
  reference: '#10b981',
  user: '#f59e0b',
  system: '#8b5cf6',
  collaboration: '#ec4899',
};

interface ERDGeneratorProps {
  onTableClick?: (tableName: string) => void;
}

export function ERDGenerator({ onTableClick }: ERDGeneratorProps = {}) {

  const [tables, setTables] = useState<Table[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    const { data } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type, is_nullable');
    
    if (data) {
      const grouped = groupByTable(data);
      const parsedTables = Object.entries(grouped).map(([name, cols], idx) => ({
        name,
        columns: cols as Column[],
        x: (idx % 5) * 280 + 20,
        y: Math.floor(idx / 5) * 350 + 20,
        category: categorizeTable(name),
      }));
      setTables(parsedTables);
      setRelationships(extractRelationships(parsedTables));
    }
  };

  const groupByTable = (data: any[]) => {
    return data.reduce((acc, row) => {
      if (!acc[row.table_name]) acc[row.table_name] = [];
      acc[row.table_name].push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        isPrimaryKey: row.column_name === 'id',
        isForeignKey: row.column_name.endsWith('_id'),
      });
      return acc;
    }, {});
  };

  const categorizeTable = (name: string): string => {
    if (name.match(/inventory|firearms|ammunition|optics|suppressors/)) return 'inventory';
    if (name.match(/caliber|manufacturer|category|reference/)) return 'reference';
    if (name.match(/user|profile|organization|auth/)) return 'user';
    if (name.match(/team|comment|shared|collaboration/)) return 'collaboration';
    return 'system';
  };

  const extractRelationships = (tables: Table[]): Relationship[] => {
    const rels: Relationship[] = [];
    tables.forEach(table => {
      table.columns.forEach(col => {
        if (col.isForeignKey) {
          const targetTable = col.name.replace('_id', '') + 's';
          if (tables.find(t => t.name === targetTable)) {
            rels.push({ from: table.name, to: targetTable, fromColumn: col.name, toColumn: 'id' });
          }
        }
      });
    });
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
    a.download = 'database-erd.svg';
    a.click();
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Database ERD - {tables.length} Tables</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setZoom(z => Math.min(z + 0.2, 3))}><ZoomIn className="w-4 h-4" /></Button>
          <Button size="sm" onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))}><ZoomOut className="w-4 h-4" /></Button>
          <Button size="sm" onClick={downloadSVG}><Download className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="mb-4 flex gap-4 text-sm">
        {Object.entries(COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
            <span className="capitalize">{cat}</span>
          </div>
        ))}
      </div>
      <svg ref={svgRef} width="100%" height="1200" className="border bg-gray-50">
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
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
              {table.columns.slice(0, 12).map((col, idx) => (
                <text key={col.name} x="10" y={55 + idx * 20} fill="white" fontSize="11">
                  {col.isPrimaryKey && '🔑 '}
                  {col.isForeignKey && '🔗 '}
                  {col.name}
                </text>
              ))}
              {table.columns.length > 12 && (
                <text x="10" y={55 + 12 * 20} fill="white" fontSize="11" fontStyle="italic">
                  +{table.columns.length - 12} more...
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
    </Card>
  );
}

