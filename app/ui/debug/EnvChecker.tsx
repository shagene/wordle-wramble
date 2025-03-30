'use client';

import { useEffect, useState } from 'react';
import { env, checkRequiredEnvVars } from '@/app/lib/env';

/**
 * A debug component to check if environment variables are loaded properly
 * Only shown in development mode
 */
const EnvChecker = () => {
  const [isClient, setIsClient] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [areVarsOk, setAreVarsOk] = useState(false);

  // Verify we're on the client side
  useEffect(() => {
    setIsClient(true);
    // Only show in development
    setShowDebug(process.env.NODE_ENV === 'development');
    // Check if all required env vars are present
    setAreVarsOk(checkRequiredEnvVars());
  }, []);

  // Don't render anything on the server
  if (!isClient) return null;

  // Only show in development by default, but always show if there are missing vars
  if (!showDebug && areVarsOk) return null;

  return (
    <div className="fixed bottom-0 right-0 bg-slate-900 text-white p-4 max-w-xs text-xs rounded-tl-md z-50 opacity-80 hover:opacity-100">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Environment Variables Check</h3>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          Close
        </button>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between">
            <span>NODE_ENV:</span>
            <span>{process.env.NODE_ENV}</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between">
            <span>SUPABASE_URL:</span>
            <span className={!env.SUPABASE_URL ? "text-red-500" : "text-green-500"}>
              {env.SUPABASE_URL ? '✅' : '❌ MISSING'}
            </span>
          </div>
          {env.SUPABASE_URL && (
            <div className="text-gray-400 truncate text-2xs">
              Value: {env.SUPABASE_URL}
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between">
            <span>SUPABASE_ANON_KEY:</span>
            <span className={!env.SUPABASE_ANON_KEY ? "text-red-500" : "text-green-500"}>
              {env.SUPABASE_ANON_KEY ? '✅' : '❌ MISSING'}
            </span>
          </div>
          {env.SUPABASE_ANON_KEY && (
            <div className="text-gray-400 truncate text-2xs">
              Value: {env.SUPABASE_ANON_KEY.substring(0, 15)}...
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between">
            <span>APP_URL:</span>
            <span>{env.APP_URL ? '✅' : '❌'}</span>
          </div>
          {env.APP_URL && (
            <div className="text-gray-400 truncate text-2xs">
              Value: {env.APP_URL}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvChecker; 