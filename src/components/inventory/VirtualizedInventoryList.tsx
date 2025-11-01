import React, { useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ItemCard } from './ItemCard';

interface VirtualizedInventoryListProps {
  items: any[];
  onItemClick: (item: any) => void;
  selectedItemIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onQuickScan: () => void;
}

const CARD_WIDTH = 280;
const CARD_HEIGHT = 320;
const GAP = 16;

export function VirtualizedInventoryList({
  items,
  onItemClick,
  selectedItemIds,
  onToggleSelect,
  onQuickScan
}: VirtualizedInventoryListProps) {
  
  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    const item = items[index];
    
    if (!item) return null;
    
    return (
      <div style={{
        ...style,
        padding: GAP / 2,
      }}>
        <ItemCard
          item={item}
          onClick={() => onItemClick(item)}
          isSelected={selectedItemIds.has(item.id)}
          onToggleSelect={onToggleSelect}
          onQuickScan={onQuickScan}
        />
      </div>
    );
  };

  const columnCount = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width >= 1536) return 5; // 2xl
    if (width >= 1280) return 4; // xl
    if (width >= 1024) return 3; // lg
    if (width >= 768) return 2;  // md
    return 1; // sm
  }, []);

  const rowCount = Math.ceil(items.length / columnCount);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">No items found</p>
      </div>
    );
  }

  return (
    <div style={{ height: '70vh', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            columnCount={columnCount}
            columnWidth={CARD_WIDTH + GAP}
            height={height}
            rowCount={rowCount}
            rowHeight={CARD_HEIGHT + GAP}
            width={width}
            overscanRowCount={2}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
}
