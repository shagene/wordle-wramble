'use client';

import { useCallback } from 'react';
import { useAudioService as useNewAudioService } from '../../services/audioService';
import { Voice } from './types';

/**
 * This is a wrapper around the new audio service to maintain compatibility
 * with the existing code while we transition to the new implementation.
 */
export function useAudioService() {
  const {
    setApiKey,
    voices,
    selectedVoiceId,
    setVoice,
    playAudio,
    fetchVoices,
    hasApiKey
  } = useNewAudioService();

  // Wrapper for the old playWordAudio function
  const playWordAudio = useCallback((word: string, onShowApiKeyModal?: () => void) => {
    // Store the cleanup function returned by playAudio
    const cleanup = playAudio(word);
    
    // If we don't have an API key and the callback is provided, show the modal
    if (!hasApiKey && onShowApiKeyModal) {
      setTimeout(() => onShowApiKeyModal(), 500);
    }
    
    // Return the cleanup function so it can be used in useEffect cleanup if needed
    return cleanup;
  }, [playAudio, hasApiKey]);

  // Wrapper for the old isApiKeySet function
  const isApiKeySet = useCallback(() => {
    return hasApiKey;
  }, [hasApiKey]);

  // Wrapper for the old setElevenLabsApiKey function
  const setElevenLabsApiKey = useCallback((key: string) => {
    setApiKey(key);
  }, [setApiKey]);

  // Wrapper for the old handleVoiceSelection function
  const handleVoiceSelection = useCallback((voiceId: string) => {
    return setVoice(voiceId);
  }, [setVoice]);

  // Wrapper for the old refreshVoices function
  const refreshVoices = useCallback(async (): Promise<Voice[]> => {
    try {
      const result = await fetchVoices();
      // Since fetchVoices might return void, we need to handle that case
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error refreshing voices:', error);
      return [];
    }
  }, [fetchVoices]);

  return {
    playWordAudio,
    isApiKeySet,
    setElevenLabsApiKey,
    voices,
    selectedVoiceId,
    handleVoiceSelection,
    refreshVoices
  };
}
