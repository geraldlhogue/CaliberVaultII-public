import { useMemo } from 'react';
import type { InventoryItem } from '@/types/inventory';
import { safeNumber } from '@/lib/formatters';

export function useInventoryStats(inventory: InventoryItem[]) {
  const stats = useMemo(() => {
    const totalValue = inventory.reduce((sum, item) => {
      return sum + safeNumber(item.currentValue || item.purchasePrice);
    }, 0);

    const totalCost = inventory.reduce((sum, item) => 
      sum + safeNumber(item.purchasePrice), 0
    );

    const valueGain = totalValue - totalCost;
    const valueGainPercent = totalCost > 0 ? (valueGain / totalCost) * 100 : 0;

    // Category breakdown
    const categoryStats = inventory.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, value: 0, cost: 0 };
      }
      acc[item.category].count++;
      acc[item.category].cost += safeNumber(item.purchasePrice);
      acc[item.category].value += safeNumber(item.currentValue || item.purchasePrice);
      return acc;
    }, {} as Record<string, { count: number; value: number; cost: number }>);

    // Location breakdown
    const locationStats = inventory.reduce((acc, item) => {
      const location = item.storageLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = { count: 0, value: 0 };
      }
      acc[location].count++;
      acc[location].value += safeNumber(item.currentValue || item.purchasePrice);
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Manufacturer breakdown
    const manufacturerStats = inventory.reduce((acc, item) => {
      const manufacturer = item.manufacturer || 'Unknown';
      if (!acc[manufacturer]) {
        acc[manufacturer] = { count: 0, value: 0 };
      }
      acc[manufacturer].count++;
      acc[manufacturer].value += safeNumber(item.purchasePrice);
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Top valuable items
    const topValueItems = [...inventory]
      .sort((a, b) => {
        const aValue = safeNumber(a.currentValue || a.purchasePrice);
        const bValue = safeNumber(b.currentValue || b.purchasePrice);
        return bValue - aValue;
      })
      .slice(0, 10);

    // Recent additions
    const recentItems = [...inventory]
      .sort((a, b) => {
        const aDate = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
        const bDate = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
        return bDate - aDate;
      })
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
