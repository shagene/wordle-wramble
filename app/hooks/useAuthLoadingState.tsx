'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';

// Keep track of recent auth verifications across the app
const recentVerifications = {
  lastVerified: 0,
  inProgress: false
};

// Check localStorage directly for session existence (without parsing)
const hasLocalStorageSession = () => {
  try {
    return !!localStorage.getItem('supabase.auth.token');
  } catch {
    return false;
  }
};

/**
 * Hook to manage authentication loading states while minimizing visual flicker
 * @param options Configuration options
 * @returns Loading state and verification management functions
 */
export function useAuthLoadingState(options: {
  // How long (in ms) until we consider a previous verification expired (default: 15 minutes)
  cacheDuration?: number;
  // Whether to show verification UI immediately or wait until needed (default: false)
  showImmediately?: boolean;
  // Custom actions to perform during verification
  onVerificationStart?: () => void;
  // Custom actions to perform after verification
  onVerificationComplete?: () => void;
} = {}) {
  const { 
    cacheDuration = 15 * 60 * 1000, // 15 minutes default
    showImmediately = false, 
    onVerificationStart,
    onVerificationComplete
  } = options;
  
  const { isLoading: isAuthLoading, userId, refresh: refreshAuth } = useSupabaseAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState<NodeJS.Timeout | null>(null);
  
  // If we have userId or a localStorage session, assume auth is valid initially
  const hasInitialAuth = !!userId || hasLocalStorageSession();
  
  // Check if we need to verify based on the last time verified
  const shouldVerify = useCallback(() => {
    // If we have a recent verification or auth is in progress, no need to verify
    if (recentVerifications.inProgress) return false;
    
    const now = Date.now();
    
    // If we have a recent verification, skip
    if (now - recentVerifications.lastVerified < cacheDuration) {
      return false;
    }
    
    return true;
  }, [cacheDuration]);
  
  // Verify the auth state if needed
  const verifyIfNeeded = useCallback(async () => {
    // Skip if auth is already confirmed via other means
    if (userId) {
      // Clear any verification UI if it's showing
      if (verificationTimer) {
        clearTimeout(verificationTimer);
        setVerificationTimer(null);
      }
      setIsVerifying(false);
      recentVerifications.lastVerified = Date.now();
      return;
    }
    
    // Skip if another verification is in progress or recently completed
    if (recentVerifications.inProgress || !shouldVerify()) {
      return;
    }
    
    // Create a timeout to only show the verifying UI if it takes a while
    const timer = setTimeout(() => {
      setIsVerifying(true);
    }, 300);
    setVerificationTimer(timer);
    
    try {
      recentVerifications.inProgress = true;
      onVerificationStart?.();
      
      // Refresh auth state
      await refreshAuth();
      
      // Update the last verified timestamp
      recentVerifications.lastVerified = Date.now();
    } finally {
      clearTimeout(timer);
      setVerificationTimer(null);
      setIsVerifying(false);
      recentVerifications.inProgress = false;
      onVerificationComplete?.();
    }
  }, [refreshAuth, shouldVerify, onVerificationStart, onVerificationComplete, userId, verificationTimer]);
  
  // Force verification regardless of cache
  const forceVerify = useCallback(async () => {
    // Create a timeout to only show the verifying UI if it takes a while
    const timer = setTimeout(() => {
      setIsVerifying(true);
    }, 300);
    setVerificationTimer(timer);
    
    try {
      recentVerifications.inProgress = true;
      onVerificationStart?.();
      
      // Refresh auth state
      await refreshAuth();
      
      // Update the last verified timestamp
      recentVerifications.lastVerified = Date.now();
    } finally {
      clearTimeout(timer);
      setVerificationTimer(null);
      setIsVerifying(false);
      recentVerifications.inProgress = false;
      onVerificationComplete?.();
    }
  }, [refreshAuth, onVerificationStart, onVerificationComplete]);
  
  // Clear timers on cleanup
  useEffect(() => {
    return () => {
      if (verificationTimer) {
        clearTimeout(verificationTimer);
      }
    };
  }, [verificationTimer]);
  
  // Initialization effect - verify if necessary
  useEffect(() => {
    // Don't auto-verify if we already have auth
    if (hasInitialAuth) {
      recentVerifications.lastVerified = Date.now();
      return;
    }
    
    if (showImmediately && shouldVerify()) {
      verifyIfNeeded();
    }
  }, [showImmediately, shouldVerify, verifyIfNeeded, hasInitialAuth]);
  
  return {
    isVerifying,
    isLoading: isAuthLoading || isVerifying,
    verifyIfNeeded,
    forceVerify
  };
} 