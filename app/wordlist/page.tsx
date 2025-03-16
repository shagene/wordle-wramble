'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WordListPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/wordlist/create');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
