'use client';

import { useCallback, useRef, useEffect, useState } from 'react';

// Extend HTMLAudioElement to include our custom property
interface CustomAudioElement extends HTMLAudioElement {
  setupErrorListener?: () => void;
}
import { 
  textToSpeech, 
  isApiKeySet, 
  setElevenLabsApiKey,
  getAvailableVoices,
  setSelectedVoice,
  getSelectedVoice,
  fetchVoices,
  Voice
} from '../../services/elevenlabs';

export function useAudioService() {
  // Create a persistent audio element reference with our custom type
  const audioRef = useRef<CustomAudioElement | null>(null);
  
  // State for available voices and selected voice
  const [voices, setVoices] = useState<Voice[]>(getAvailableVoices());
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(getSelectedVoice());
  
  // Debug voice state
  useEffect(() => {
    console.log('AudioService - Current voices:', voices.map(v => `${v.name} (${v.voice_id})`));
    console.log('AudioService - Current selected voice ID:', selectedVoiceId);
    
    // Check if selected voice exists in available voices
    const voiceExists = voices.some(voice => voice.voice_id === selectedVoiceId);
    if (!voiceExists && voices.length > 0) {
      console.log(`Selected voice ID ${selectedVoiceId} not found in available voices, resetting to default`);
      // Use the first available voice as fallback
      const defaultVoice = voices[0].voice_id;
      console.log(`Setting default voice to: ${defaultVoice}`);
      setSelectedVoiceId(defaultVoice);
      setSelectedVoice(defaultVoice);
      
      // Clear any invalid voice ID from localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('elevenlabs-selected-voice');
          localStorage.setItem('elevenlabs-selected-voice', defaultVoice);
          console.log('Updated localStorage with new voice ID');
        } catch (e) {
          console.error('Failed to update localStorage:', e);
        }
      }
    }
  }, [voices, selectedVoiceId]);
  
  // Initialize audio element and fetch voices on mount
  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current && typeof window !== 'undefined') {
      // Create audio element without setting src initially to prevent errors
      audioRef.current = new Audio();
      
      // Only set up error listener after we actually try to play something
      // This prevents errors on initial load
      const setupErrorListener = () => {
        // Only add the error listener once we actually try to play something
        audioRef.current?.addEventListener('error', (event) => {
          // Only log errors if we actually have a source set
          if (audioRef.current?.src && audioRef.current.src !== '') {
            const errorMessage = audioRef.current?.error 
              ? `Code: ${audioRef.current.error.code}` 
              : 'unknown error';
            console.error('Error playing audio from ElevenLabs:', errorMessage);
            
            // Extract the word from the current context if possible
            const urlParts = audioRef.current.src.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            // Try to use browser speech synthesis as fallback
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel(); // Cancel any ongoing speech
              const utterance = new SpeechSynthesisUtterance(lastPart || 'Error playing word');
              window.speechSynthesis.speak(utterance);
            }
          }
        });
      };
      
      // We'll set up the error listener only when needed in the playWordAudio function
      
      // These listeners are safe to set up immediately
      audioRef.current.addEventListener('playing', () => {
        console.log('Audio started playing from ElevenLabs');
      });
      
      audioRef.current.addEventListener('ended', () => {
        console.log('Audio playback completed');
      });
      
      // Store the setup function for later use
      audioRef.current.setupErrorListener = setupErrorListener;
    }
    
    // Fetch available voices if API key is set
    const loadVoices = async () => {
      if (isApiKeySet()) {
        try {
          console.log('AudioService - Fetching voices from API...');
          const availableVoices = await fetchVoices();
          console.log('AudioService - Fetched voices:', availableVoices.map(v => `${v.name} (${v.voice_id})`));
          setVoices(availableVoices);
          
          // Verify if the current selectedVoiceId is valid
          const currentVoiceIsValid = availableVoices.some(voice => voice.voice_id === selectedVoiceId);
          if (!currentVoiceIsValid && availableVoices.length > 0) {
            // If not valid, select the first available voice
            const defaultVoice = availableVoices[0].voice_id;
            console.log(`AudioService - Current voice ID ${selectedVoiceId} is invalid, setting to ${defaultVoice}`);
            setSelectedVoiceId(defaultVoice);
            setSelectedVoice(defaultVoice);
          }
        } catch (error) {
          console.error('Failed to fetch voices:', error);
        }
      } else {
        console.warn('AudioService - API key not set, cannot fetch voices');
      }
    };
    
    loadVoices();
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        // We don't remove the element, just pause it
      }
    };
  }, []);

  // Use browser speech synthesis as a fallback
  const playFallbackAudio = useCallback((word: string) => {
    console.log('Using fallback browser TTS for:', word);
    
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }
    
    try {
      // Always cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      // Create a simple utterance - don't try to be fancy with voice selection
      const utterance = new SpeechSynthesisUtterance(word);
      
      // Configure for clear speech
      utterance.rate = 0.8;    // Slightly slower for clarity
      utterance.pitch = 1.0;   // Normal pitch
      utterance.volume = 1.0;  // Full volume
      
      // Set language explicitly to English
      utterance.lang = 'en-US';
      
      // Add event handlers for debugging
      utterance.onstart = () => console.log('Browser speech started for:', word);
      utterance.onend = () => console.log('Browser speech ended for:', word);
      utterance.onerror = (event) => console.log('Browser speech error:', event.error);
      
      // Speak immediately - don't wait for voices
      window.speechSynthesis.speak(utterance);
      
      // Chrome sometimes pauses speech synthesis when the tab is in background
      // This is a workaround to keep it going
      if (navigator.userAgent.includes('Chrome')) {
        // Use NodeJS.Timeout type for proper typing
        let timeoutId: NodeJS.Timeout | undefined;
        
        const resumeInfinity = () => {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
          timeoutId = setTimeout(resumeInfinity, 500);
        };
        
        timeoutId = setTimeout(resumeInfinity, 500);
        
        // Clear the timeout when speech ends
        utterance.onend = () => {
          console.log('Browser speech ended for:', word);
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
          }
        };
        
        // Also clear on error
        utterance.onerror = (event) => {
          console.log('Browser speech error:', event.error);
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
          }
        };
      }
      
      console.log('Speech synthesis request sent for:', word);
    } catch (error) {
      // Fallback to alert as a last resort
      console.error('Fallback speech synthesis error:', error);
      alert(`Please say this word: ${word}`);
    }
  }, []);
  
  // Handle voice selection
  const handleVoiceSelection = useCallback((voiceId: string) => {
    console.log(`Attempting to select voice: ${voiceId}`);
    
    // First check if the voice ID exists in our current voices list
    const voiceExists = voices.some(voice => voice.voice_id === voiceId);
    if (!voiceExists) {
      console.warn(`Voice ID ${voiceId} not found in current voices list`);
      console.log('Available voices:', voices.map(v => `${v.name} (${v.voice_id})`));
      
      // If we have voices but the requested one isn't valid, use the first available
      if (voices.length > 0) {
        const defaultVoice = voices[0].voice_id;
        console.log(`Using default voice instead: ${defaultVoice}`);
        voiceId = defaultVoice;
      } else {
        console.error('No voices available to select from');
        return false;
      }
    }
    
    // Now try to set the selected voice
    try {
      // Update state first
      setSelectedVoiceId(voiceId);
      
      // Then update the service
      setSelectedVoice(voiceId);
      
      // Also update localStorage directly to ensure persistence
      if (typeof window !== 'undefined') {
        localStorage.removeItem('elevenlabs-selected-voice');
        localStorage.setItem('elevenlabs-selected-voice', voiceId);
      }
      
      console.log('Voice successfully selected:', voiceId);
      
      // Force refresh of audio element to use the new voice
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to select voice ${voiceId}:`, error);
      return false;
    }
  }, [voices]);
  
  // Refresh available voices
  const refreshVoices = useCallback(async () => {
    if (!isApiKeySet()) {
      console.warn('Cannot refresh voices: API key not set');
      return getAvailableVoices();
    }
    
    try {
      console.log('AudioService - Refreshing voices...');
      const availableVoices = await fetchVoices();
      console.log('AudioService - Refreshed voices:', availableVoices.map((v: Voice) => `${v.name} (${v.voice_id})`));
      
      // Update the voices state
      setVoices(availableVoices);
      
      // Check if current selected voice is still valid
      const currentVoiceIsValid = availableVoices.some(voice => voice.voice_id === selectedVoiceId);
      if (!currentVoiceIsValid && availableVoices.length > 0) {
        // If not valid, select the first available voice
        const defaultVoice = availableVoices[0].voice_id;
        console.log(`AudioService - Current voice ID ${selectedVoiceId} is no longer valid, updating to ${defaultVoice}`);
        setSelectedVoiceId(defaultVoice);
        setSelectedVoice(defaultVoice);
      }
      
      return availableVoices;
    } catch (error) {
      console.error('Error refreshing voices:', error);
      return getAvailableVoices();
    }
  }, [selectedVoiceId]);

  // Play word pronunciation - simplified to always use browser speech synthesis
  const playWordAudio = useCallback(async (word: string, onShowApiKeyModal: () => void) => {
    console.log('Playing audio for word:', word);
    
    // Always use browser speech synthesis for reliability
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Normalize the word for better pronunciation
        const normalizedText = word.trim().toUpperCase();
        
        // Create a simple utterance
        const utterance = new SpeechSynthesisUtterance(normalizedText);
        
        // Configure for clear speech
        utterance.rate = 0.8;    // Slightly slower for clarity
        utterance.pitch = 1.0;   // Normal pitch
        utterance.volume = 1.0;  // Full volume
        
        // Set language explicitly to English
        utterance.lang = 'en-US';
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        
        // Try to find a good English voice
        if (voices && voices.length > 0) {
          // Prefer a female English voice if available
          const englishVoice = voices.find(voice => 
            voice.lang.includes('en-') && voice.name.includes('Female'));
          
          if (englishVoice) {
            utterance.voice = englishVoice;
            console.log(`Using voice: ${englishVoice.name}`);
          } else {
            // Fallback to any English voice
            const anyEnglishVoice = voices.find(voice => voice.lang.includes('en-'));
            if (anyEnglishVoice) {
              utterance.voice = anyEnglishVoice;
              console.log(`Using voice: ${anyEnglishVoice.name}`);
            }
          }
        }
        
        // Add event handlers for debugging
        utterance.onstart = () => console.log('Browser speech started for:', normalizedText);
        utterance.onend = () => console.log('Browser speech ended for:', normalizedText);
        utterance.onerror = (event) => console.error('Browser speech error:', event.error);
        
        // Speak immediately
        window.speechSynthesis.speak(utterance);
        
        // Chrome sometimes pauses speech synthesis when the tab is in background
        // This is a workaround to keep it going
        if (navigator.userAgent.includes('Chrome')) {
          let timeoutId: NodeJS.Timeout | undefined;
          
          const resumeInfinity = () => {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            timeoutId = setTimeout(resumeInfinity, 250);
          };
          
          timeoutId = setTimeout(resumeInfinity, 250);
          
          // Clear the timeout when speech ends
          utterance.onend = () => {
            console.log('Browser speech ended for:', normalizedText);
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = undefined;
            }
          };
          
          // Also clear on error
          utterance.onerror = (event) => {
            console.error('Browser speech error:', event.error);
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = undefined;
            }
          };
        }
        
        console.log('Speech synthesis request sent for:', normalizedText);
      } catch (error) {
        console.error('Error with browser speech synthesis:', 
                      error instanceof Error ? error.message : 'Unknown error');
        
        // As a last resort, show an alert
        alert(`Please say this word: ${word}`);
      }
    } else {
      console.error('Speech synthesis not supported in this browser');
      alert(`Please say this word: ${word}`);
    }
  }, []);


  return {
    playWordAudio,
    playFallbackAudio,
    voices,
    selectedVoiceId,
    handleVoiceSelection,
    refreshVoices,
    isApiKeySet,
    setElevenLabsApiKey
  };
}
