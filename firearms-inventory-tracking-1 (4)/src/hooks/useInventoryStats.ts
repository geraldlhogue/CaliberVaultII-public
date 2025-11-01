import { useMemo } from 'react';
import type { InventoryItem } from '@/types/inventory';

export function useInventoryStats(inventory: InventoryItem[]) {
  const stats = useMemo(() => {
    const totalValue = inventory.reduce((sum, item) => {
      return sum + (item.currentValue || item.purchasePrice || 0);
    }, 0);

    const totalCost = inventory.reduce((sum, item) => 
      sum + (item.purchasePrice || 0), 0
    );

    const valueGain = totalValue - totalCost;
    const valueGainPercent = totalCost > 0 ? (valueGain / totalCost) * 100 : 0;

    // Category breakdown
    const categoryStats = inventory.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, value: 0, cost: 0 };
      }
      acc[item.category].count++;
      acc[item.category].cost += item.purchasePrice || 0;
      acc[item.category].value += item.currentValue || item.purchasePrice || 0;
      return acc;
    }, {} as Record<string, { count: number; value: number; cost: number }>);

    // Location breakdown
    const locationStats = inventory.reduce((acc, item) => {
      const location = item.storageLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = { count: 0, value: 0 };
      }
      acc[location].count++;
      acc[location].value += item.currentValue || item.purchasePrice || 0;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Manufacturer breakdown
    const manufacturerStats = inventory.reduce((acc, item) => {
      const manufacturer = item.manufacturer || 'Unknown';
      if (!acc[manufacturer]) {
        acc[manufacturer] = { count: 0, value: 0 };
      }
      acc[manufacturer].count++;
      acc[manufacturer].value += item.purchasePrice || 0;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Top valuable items
    const topValueItems = [...inventory]
      .sort((a, b) => {
        const aValue = a.currentValue || a.purchasePrice || 0;
        const bValue = b.currentValue || b.purchasePrice || 0;
        return bValue - aValue;
      })
      .slice(0, 10);

    // Recent additions
    const recentItems = [...inventory]
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, 5);

    return {
      totalItems: inventory.length,
      totalValue,
      totalCost,
      valueGain,
      valueGainPercent,
      categoryStats,
      locationStats,
      manufacturerStats,
      topValueItems,
      recentItems,
      averageItemValue: inventory.length > 0 ? totalValue / inventory.length : 0,
      averageItemCost: inventory.length > 0 ? totalCost / inventory.length : 0,
    };
  }, [inventory]);

  return stats;
}