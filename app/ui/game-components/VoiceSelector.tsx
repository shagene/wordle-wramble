'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Voice } from '../../services/elevenlabs';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoiceId: string;
  onVoiceSelect: (voiceId: string) => void;
  onRefreshVoices: () => Promise<Voice[]>;
  isApiKeySet: () => boolean;
}

export function VoiceSelector({
  voices,
  selectedVoiceId,
  onVoiceSelect,
  onRefreshVoices,
  isApiKeySet,
}: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the name of the currently selected voice
  const selectedVoice = voices.find(voice => voice.voice_id === selectedVoiceId);
  const selectedVoiceName = selectedVoice?.name || 'Select Voice';
  
  // Log voice information for debugging
  useEffect(() => {
    console.log('VoiceSelector - Available voices:', voices.map((v: Voice) => `${v.name} (${v.voice_id})`));
    console.log('VoiceSelector - Selected voice ID:', selectedVoiceId);
    console.log('VoiceSelector - Found selected voice:', selectedVoice);
    
    // Auto-select a valid voice if the current selection is invalid
    if (voices.length > 0 && !selectedVoice && selectedVoiceId !== '') {
      console.log('VoiceSelector - Selected voice not found in available voices, selecting default');
      const defaultVoice = voices[0].voice_id;
      console.log(`VoiceSelector - Auto-selecting first available voice: ${defaultVoice}`);
      onVoiceSelect(defaultVoice);
    }
  }, [voices, selectedVoiceId, selectedVoice, onVoiceSelect]);
  
  // Handle refreshing the voices list - wrapped in useCallback to prevent recreation on every render
  const handleRefresh = useCallback(async () => {
    if (!isApiKeySet()) {
      console.warn('VoiceSelector - Cannot refresh voices: API key not set');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('VoiceSelector - Refreshing voices...');
      const refreshedVoices = await onRefreshVoices();
      console.log('VoiceSelector - Voices refreshed successfully:', refreshedVoices.map((v: Voice) => `${v.name} (${v.voice_id})`));
      
      // Validate selected voice after refresh
      const voiceStillValid = refreshedVoices.some(voice => voice.voice_id === selectedVoiceId);
      if (!voiceStillValid && refreshedVoices.length > 0) {
        console.log(`VoiceSelector - Voice ID ${selectedVoiceId} not found after refresh, selecting first available`);
        onVoiceSelect(refreshedVoices[0].voice_id);
      }
    } catch (error) {
      console.error('VoiceSelector - Error refreshing voices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isApiKeySet, onRefreshVoices, selectedVoiceId, onVoiceSelect]);
  
  // Refresh voices when component mounts if API key is set
  useEffect(() => {
    if (isApiKeySet()) {
      if (voices.length === 0) {
        console.log('VoiceSelector - No voices available, refreshing...');
        handleRefresh();
      } else if (!selectedVoice && selectedVoiceId !== '') {
        // If we have voices but selected voice is invalid
        console.log(`VoiceSelector - Selected voice ID ${selectedVoiceId} not found in available voices`);
        console.log('VoiceSelector - Available voices:', voices.map(v => `${v.name} (${v.voice_id})`));
        if (voices.length > 0) {
          console.log(`VoiceSelector - Selecting first available voice: ${voices[0].voice_id}`);
          onVoiceSelect(voices[0].voice_id);
        }
      }
    }
  }, [isApiKeySet, voices, selectedVoiceId, selectedVoice, handleRefresh, onVoiceSelect]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);
  
  if (!isApiKeySet()) {
    return null; // Don't show selector if API key is not set
  }
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Select voice for pronunciation"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex-1 truncate">{selectedVoiceName}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 text-gray-500 dark:text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className="absolute z-10 mt-1 w-56 max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
          role="listbox"
          aria-label="Available voices"
        >
          <div className="p-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={isLoading}
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center gap-2"
              aria-label="Refresh voice list"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoading ? 'Refreshing...' : 'Refresh Voices'}
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            {voices.map((voice) => (
              <button
                key={voice.voice_id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`VoiceSelector - User selecting voice: ${voice.name} (${voice.voice_id})`);
                  onVoiceSelect(voice.voice_id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm ${
                  voice.voice_id === selectedVoiceId
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="option"
                aria-selected={voice.voice_id === selectedVoiceId}
              >
                {voice.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
