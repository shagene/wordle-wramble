"use client";

import dynamic from 'next/dynamic';

// This is a client component wrapper for the Footer
// It handles the dynamic import with ssr: false
export function FooterWrapper() {
  const DynamicFooter = dynamic(() => import('./Footer').then(mod => mod.Footer), {
    ssr: false,
  });
  
  return <DynamicFooter />;
}
