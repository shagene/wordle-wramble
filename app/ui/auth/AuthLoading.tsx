'use client';

import { useState, useEffect } from 'react';

export function AuthLoading() {
  // Start with no visibility for quick auth checks
  const [showLoading, setShowLoading] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  
  useEffect(() => {
    // Only show loading UI if authentication takes more than 300ms (increased from 100ms)
    const quickTimer = setTimeout(() => {
      setShowLoading(true);
    }, 300);
    
    // Only show full-screen loading if auth takes more than 2 seconds (increased from 1.5s)
    const fullScreenTimer = setTimeout(() => {
      setShowFullScreen(true);
    }, 2000);
    
    return () => {
      clearTimeout(quickTimer);
      clearTimeout(fullScreenTimer);
    };
  }, []);
  
  // Don't show anything for quick auth checks
  if (!showLoading) {
    return null;
  }
  
  // For auth checks taking between 300ms and 2s, show a small, unobtrusive indicator
  if (!showFullScreen) {
    return (
      <div className="fixed top-2 right-2 z-50 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-sm px-3 py-1.5 flex items-center text-xs animate-fade-in">
        <div className="animate-spin mr-1.5 h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="text-gray-600 dark:text-gray-300">Checking...</span>
      </div>
    );
  }
  
  // For long auth checks, show a smaller, less intrusive full screen loading
  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center z-50 animate-fade-in">
      <div className="flex items-center justify-center flex-col bg-white dark:bg-slate-800 shadow-lg rounded-xl p-8 max-w-md">
        <div className="animate-bounce text-4xl mb-4">🧩</div>
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">Verifying your session</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-sm">
          This should only take a moment...
        </p>
        <div className="relative w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-blue-500 dark:bg-blue-600 animate-progress"></div>
        </div>
      </div>
    </div>
  );
}

export default AuthLoading; 