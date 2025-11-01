import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Performance tracking wrapper
const trackQueryPerformance = (queryKey: any, duration: number) => {
  if (duration > 1000) {
    console.warn(`Slow query detected: ${JSON.stringify(queryKey)} took ${duration}ms`);
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false, // Don't refetch if data is fresh
      // Performance tracking
      meta: {
        onFetch: (context: any) => {
          const startTime = Date.now();
          context.meta = { ...context.meta, startTime };
        },
        onSuccess: (context: any) => {
          if (context.meta?.startTime) {
            const duration = Date.now() - context.meta.startTime;
            trackQueryPerformance(context.queryKey, duration);
          }
        }
      }
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      onError: (error: any) => {
        const message = error?.message || 'An error occurred';
        console.error('Mutation error:', error);
      },
      // Optimistic updates enabled by default
      onMutate: async () => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries();
      }
    },
  },
});

// Prefetch common queries
export const prefetchCommonData = async (userId: string) => {
  const prefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: ['inventory', userId],
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['manufacturers'],
      staleTime: 30 * 60 * 1000, // Reference data cached longer
    }),
    queryClient.prefetchQuery({
      queryKey: ['calibers'],
      staleTime: 30 * 60 * 1000,
    }),
  ];

  await Promise.allSettled(prefetchPromises);
};
