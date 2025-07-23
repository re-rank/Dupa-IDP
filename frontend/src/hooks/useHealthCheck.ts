import { useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '../services/api';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

export function useHealthCheck(interval: number = 30000) {
  const [isHealthy, setIsHealthy] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<HealthStatus>(
    'health-check',
    async () => {
      console.log('Making health check request...');
      try {
        const result = await api.get('/health');
        console.log('Health check response:', result);
        return result;
      } catch (error) {
        console.error('Health check error:', error);
        throw error;
      }
    },
    {
      refetchInterval: interval,
      refetchIntervalInBackground: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      onSuccess: (data) => {
        setIsHealthy(data.status === 'healthy');
        setLastCheck(new Date());
      },
      onError: () => {
        setIsHealthy(false);
        setLastCheck(new Date());
      }
    }
  );

  // Manual health check
  const checkHealth = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  return {
    isHealthy,
    isLoading,
    error: error instanceof Error ? error.message : null,
    data,
    lastCheck,
    checkHealth
  };
}