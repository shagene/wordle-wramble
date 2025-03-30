'use client';

import { useEffect, useState } from 'react';
import { env, checkRequiredEnvVars } from '@/app/lib/env';
import { getClientSupabase } from '@/app/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export default function DebugPage() {
  const [clientState, setClientState] = useState({
    hydrated: false,
    supabaseInitialized: false,
    envVarsPresent: false,
    directConnectionWorking: false,
    error: null as string | null,
  });

  // Check client-side hydration
  useEffect(() => {
    try {
      // Check environment variables
      const envVarsOk = checkRequiredEnvVars();
      
      // Try to initialize Supabase
      const supabase = getClientSupabase();

      // Test the direct connection
      const testDirectConnection = async () => {
        try {
          // Use hardcoded values for direct test
          const directClient = createClient(
            'https://gwvhbimnktyovdmdcdnm.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dmhiaW1ua3R5b3ZkbWRjZG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTA0OTcsImV4cCI6MjA1ODE4NjQ5N30.AMUH2C4ESS6GohZ7X2Lzoj0X9OB2eaA-lO26dffEUxk'
          );
          
          const { error } = await directClient.from('profiles').select('id').limit(1);
          if (!error) {
            return true;
          }
          return false;
        } catch (err) {
          console.error('Direct connection test failed:', err);
          return false;
        }
      };
      
      // Run the connection test
      testDirectConnection().then(directWorking => {
        setClientState({
          hydrated: true,
          supabaseInitialized: !!supabase,
          envVarsPresent: envVarsOk,
          directConnectionWorking: directWorking,
          error: null,
        });
      });
    } catch (err) {
      console.error('Debug page error:', err);
      setClientState({
        hydrated: true,
        supabaseInitialized: false,
        envVarsPresent: false,
        directConnectionWorking: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Environment Debug Page</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Client State</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">Client Hydrated:</span>
            <span className={clientState.hydrated ? "text-green-600" : "text-red-600"}>
              {clientState.hydrated ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Environment Variables:</span>
            <span className={clientState.envVarsPresent ? "text-green-600" : "text-red-600"}>
              {clientState.envVarsPresent ? '✅ Available' : '❌ Missing'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Supabase Client:</span>
            <span className={clientState.supabaseInitialized ? "text-green-600" : "text-red-600"}>
              {clientState.supabaseInitialized ? '✅ Initialized' : '❌ Failed'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Direct Connection:</span>
            <span className={clientState.directConnectionWorking ? "text-green-600" : "text-red-600"}>
              {clientState.directConnectionWorking ? '✅ Working' : '❌ Failed'}
            </span>
          </div>
          
          {clientState.error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded text-red-700 dark:text-red-300">
              <strong>Error:</strong> {clientState.error}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment Values</h2>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
          {JSON.stringify({
            SUPABASE_URL: env.SUPABASE_URL ? `${env.SUPABASE_URL.substring(0, 15)}...` : 'Not set',
            SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY ? `${env.SUPABASE_ANON_KEY.substring(0, 15)}...` : 'Not set',
            APP_URL: env.APP_URL,
            NODE_ENV: process.env.NODE_ENV,
          }, null, 2)}
        </pre>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="space-y-4">
          <a href="/debug/supabase" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
            Direct Supabase Test
          </a>
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <a 
          href="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
} 