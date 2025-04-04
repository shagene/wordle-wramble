'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SupabaseDebugPage() {
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  
  // Hardcoded fallback values as a last resort
  const fallbackUrl = 'https://gwvhbimnktyovdmdcdnm.supabase.co';
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dmhiaW1ua3R5b3ZkbWRjZG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTA0OTcsImV4cCI6MjA1ODE4NjQ5N30.AMUH2C4ESS6GohZ7X2Lzoj0X9OB2eaA-lO26dffEUxk';

  // Function to test the Supabase connection
  const testSupabase = async () => {
    try {
      const supabase = createClient(
        url || fallbackUrl,
        key || fallbackKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
      
      // Test a simple query
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (queryError) {
        throw new Error(`Query failed: ${queryError.message}`);
      }
      
      setStatus(`Connected successfully! Found ${data?.length || 0} results.`);
    } catch (err) {
      console.error('Supabase test error:', err);
      setError(err instanceof Error ? err.message : String(err));
      setStatus('Connection failed');
    }
  };

  useEffect(() => {
    // Try to get values from env
    setUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
    setKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Direct Debug</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
        <div className="mb-4">
          <div className="mb-3">
            <label className="block mb-1">Supabase URL:</label>
            <input 
              type="text" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter Supabase URL"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div className="mb-3">
            <label className="block mb-1">Supabase Key:</label>
            <input 
              type="text" 
              value={key} 
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter Supabase Anon Key"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div className="flex justify-between mt-4">
            <button
              onClick={() => {
                setUrl(fallbackUrl);
                setKey(fallbackKey);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Use Fallbacks
            </button>
            
            <button
              onClick={testSupabase}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Test Connection
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="font-medium">Status:</div>
          <div className={`p-3 rounded ${error ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700'}`}>
            {status}
            {error && (
              <div className="mt-2 text-sm overflow-auto max-h-40">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <a 
          href="/debug"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Back to Debug
        </a>
      </div>
    </div>
  );
} 