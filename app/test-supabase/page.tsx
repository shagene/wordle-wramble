'use client';

import { useState, useEffect } from 'react';

export default function TestSupabase() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Testing Supabase connection...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const response = await fetch('/api/supabase-test');
        const result = await response.json();
        
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
        } else {
          setStatus('error');
          setMessage('Connection failed');
        }
        
        setDetails(result);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        setDetails({ error: true });
      }
    }
    
    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          Supabase Connection Test
        </h1>
        
        <div className={`p-4 mb-4 rounded-md ${
          status === 'loading' ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
          status === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
          'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-300'
        }`}>
          <p className="font-medium">{message}</p>
        </div>
        
        {details && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Response Details:</h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto text-sm">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 