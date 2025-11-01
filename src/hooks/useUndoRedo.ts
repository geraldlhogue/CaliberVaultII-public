import { useState, useCallback } from 'react';

export interface HistoryAction<T> {
  type: 'bulk-edit';
  timestamp: number;
  previousState: T[];
  newState: T[];
  description: string;
}

export function useUndoRedo<T extends { id: string }>() {
  const [history, setHistory] = useState<HistoryAction<T>[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  const addToHistory = useCallback((action: HistoryAction<T>) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(action);
      return newHistory;
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex].previousState;
    }
    return null;
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1].newState;
    }
    return null;
  }, [canRedo, currentIndex, history]);

  const clear = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    history,
  };
}
