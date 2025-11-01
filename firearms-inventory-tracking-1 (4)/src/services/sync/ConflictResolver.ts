// Conflict resolution strategies for offline/online data conflicts
export type ConflictStrategy = 'server-wins' | 'client-wins' | 'newest-wins' | 'manual';

export interface DataConflict {
  id: string;
  table: string;
  localData: any;
  serverData: any;
  localTimestamp: number;
  serverTimestamp: number;
}

export interface ConflictResolution {
  action: 'use-server' | 'use-client' | 'merge' | 'skip';
  data?: any;
  reason: string;
}

export class ConflictResolver {
  resolve(conflict: DataConflict, strategy: ConflictStrategy = 'newest-wins'): ConflictResolution {
    console.log('[ConflictResolver] Resolving conflict:', conflict.id, 'Strategy:', strategy);

    switch (strategy) {
      case 'server-wins':
        return {
          action: 'use-server',
          data: conflict.serverData,
          reason: 'Server data takes precedence',
        };

      case 'client-wins':
        return {
          action: 'use-client',
          data: conflict.localData,
          reason: 'Client data takes precedence',
        };

      case 'newest-wins':
        if (conflict.serverTimestamp > conflict.localTimestamp) {
          return {
            action: 'use-server',
            data: conflict.serverData,
            reason: 'Server data is newer',
          };
        } else {
          return {
            action: 'use-client',
            data: conflict.localData,
            reason: 'Client data is newer',
          };
        }

      case 'manual':
        return {
          action: 'skip',
          reason: 'Manual resolution required',
        };

      default:
        return this.resolve(conflict, 'newest-wins');
    }
  }

  mergeData(local: any, server: any): any {
    // Smart merge: prefer non-null values, newer timestamps
    const merged = { ...server };
    
    for (const key in local) {
      if (local[key] !== null && local[key] !== undefined) {
        if (server[key] === null || server[key] === undefined) {
          merged[key] = local[key];
        }
      }
    }

    return merged;
  }

  detectConflict(local: any, server: any): boolean {
    if (!local || !server) return false;
    
    // Check if updated_at timestamps differ significantly
    const localTime = new Date(local.updated_at || local.created_at).getTime();
    const serverTime = new Date(server.updated_at || server.created_at).getTime();
    
    return Math.abs(localTime - serverTime) > 1000; // More than 1 second difference
  }
}

export const conflictResolver = new ConflictResolver();
