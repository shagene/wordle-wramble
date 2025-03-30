'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SuperBasicTest() {
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function testSupabase() {
      try {
        console.log('⚠️ Starting SUPER BASIC test directly in the component');
        
        // Hardcoded credentials
        const url = 'https://gwvhbimnktyovdmdcdnm.supabase.co';
        const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dmhiaW1ua3R5b3ZkbWRjZG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTA0OTcsImV4cCI6MjA1ODE4NjQ5N30.AMUH2C4ESS6GohZ7X2Lzoj0X9OB2eaA-lO26dffEUxk';
        
        console.log('⚠️ Credential check:', { 
          url: url ? `${url.substring(0, 15)}...` : 'MISSING', 
          keyLength: key?.length || 0
        });
        
        if (!url || !key) {
          throw new Error('Missing credentials');
        }
        
        console.log('⚠️ About to call createClient');
        
        // Create client directly without any helper functions
        const supabase = createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        
        console.log('⚠️ Client created successfully, testing a simple query');
        
        // Test a simple query
        const { error: queryError } = await supabase.from('profiles').select('id').limit(1);
        
        if (queryError) {
          throw new Error(`Query failed: ${queryError.message}`);
        }
        
        setStatus('✅ SUCCESS: Supabase client created and query executed successfully!');
        console.log('⚠️ Test completed successfully');
      } catch (err) {
        console.error('⚠️ Test error:', err);
        setStatus('❌ FAILED: Error creating Supabase client');
        setError(err instanceof Error ? err.message : String(err));
      }
    }
    
    testSupabase();
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Super Basic Supabase Test</h1>
      <div className={`p-4 rounded ${error ? 'bg-red-100 border border-red-400' : 'bg-green-100 border border-green-400'}`}>
        <p className="font-semibold">{status}</p>
        {error && (
          <div className="mt-4 text-red-700">
            <p className="font-semibold">Error:</p>
            <pre className="mt-2 p-2 bg-red-50 rounded overflow-x-auto">{error}</pre>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          This page tests Supabase client creation with hardcoded credentials directly in the component, 
          without any helper functions or environment variables.
        </p>
      </div>
      <div className="mt-8">
        <a href="/" className="text-blue-600 hover:underline">
          Return to Home
        </a>
      </div>
    </div>
  );
} 