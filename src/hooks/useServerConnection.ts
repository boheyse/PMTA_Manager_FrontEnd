import { useState, useEffect, useRef } from 'react';
import { axiosPost } from '../utils/apiUtils';

interface UseServerConnectionProps {
  hostname: string;
  maxRetries?: number;
  retryDelay?: number;
}

export function useServerConnection({ 
  hostname,
  maxRetries = 3,
  retryDelay = 5000 // 5 seconds between retries
}: UseServerConnectionProps) {
  const [sessionId, setSessionId] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);
  const retryTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const connectToServer = async () => {
      if (!hostname) return;
      
      setIsConnecting(true);
      setError(null);

      try {
        const response = await axiosPost('/api/v1/server/connect', {
          hostname,
          create_server: false
        });

        if (response.session_id) {
          setSessionId(response.session_id);
          retryCount.current = 0; // Reset retry count on success
        } else {
          throw new Error('No session ID received from server');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect to server';
        setError(errorMessage);
        console.error('Server connection error:', err);

        // Retry logic
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          console.log(`Retrying connection (${retryCount.current}/${maxRetries})...`);
          
          // Schedule retry
          retryTimeout.current = setTimeout(connectToServer, retryDelay);
        }
      } finally {
        setIsConnecting(false);
      }
    };

    connectToServer();

    // Cleanup function
    return () => {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [hostname, maxRetries, retryDelay]);

  return { 
    sessionId, 
    isConnecting, 
    error,
    retryAttempt: retryCount.current 
  };
}