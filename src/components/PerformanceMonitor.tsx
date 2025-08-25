import { useEffect, useState } from 'react';

interface PerformanceMonitorProps {
  pageName: string;
  onLoadComplete?: (loadTime: number) => void;
}

export const PerformanceMonitor = ({ pageName, onLoadComplete }: PerformanceMonitorProps) => {
  const [loadTime, setLoadTime] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    
    const handleLoadComplete = () => {
      const endTime = performance.now();
      const totalLoadTime = endTime - startTime;
      
      setLoadTime(totalLoadTime);
      setIsLoaded(true);
      
      // Log performance metrics
      console.log(`🚀 ${pageName} loaded in ${totalLoadTime.toFixed(2)}ms`);
      
      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_load_time', {
          page_name: pageName,
          load_time: totalLoadTime,
        });
      }
      
      onLoadComplete?.(totalLoadTime);
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      requestAnimationFrame(handleLoadComplete);
    });

    return () => {
      // Cleanup if component unmounts before load completes
      if (!isLoaded) {
        const endTime = performance.now();
        const totalLoadTime = endTime - startTime;
        console.log(`⚠️ ${pageName} unmounted after ${totalLoadTime.toFixed(2)}ms`);
      }
    };
  }, [pageName, onLoadComplete, isLoaded]);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono z-50">
      {isLoaded ? (
        <div>
          <div className="text-green-400">✓ Loaded</div>
          <div>{loadTime.toFixed(0)}ms</div>
        </div>
      ) : (
        <div className="text-yellow-400">Loading...</div>
      )}
    </div>
  );
};
