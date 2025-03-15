'use client';

import { useState, useEffect, useCallback } from 'react';

// API key for ElevenLabs
const API_KEY_STORAGE_KEY = 'elevenlabs-api-key';
const VOICE_ID_STORAGE_KEY = 'elevenlabs-selected-voice';

// Default voice ID (Rachel - child-friendly voice)
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

// Voice interface
export interface Voice {
  voice_id: string;
  name: string;
}

/**
 * Browser TTS fallback function
 * This is a regular function, not a hook, so it can be called anywhere
 */
function browserTTS(text: string) {
  if (!('speechSynthesis' in window)) {
    console.warn('Browser speech synthesis not supported');
    return;
  }
  
  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();

  try {
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text.toUpperCase());
    
    // Configure for better pronunciation
    utterance.rate = 0.8;  // Slightly slower
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    // Set language to English
    utterance.lang = 'en-US';
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      // Prefer a female English voice
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en-') && voice.name.includes('Female'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
    
    // Chrome workaround for background tabs
    if (navigator.userAgent.includes('Chrome')) {
      const resumeInfinity = () => {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      };
      
      const intervalId = setInterval(resumeInfinity, 250);
      
      utterance.onend = () => {
        clearInterval(intervalId);
      };
    }
  } catch (error) {
    console.error('Browser TTS error:', error);
  }
}

/**
 * Simple audio service for text-to-speech using ElevenLabs API
 */
export function useAudioService() {
  // State for API key and voices
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(DEFAULT_VOICE_ID);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize from environment variable or localStorage on mount
  useEffect(() => {
    // First try to load API key from environment variable
    const envApiKey = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY;
    
    // Then try localStorage as fallback
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    
    // Set the API key (prioritize env variable)
    if (envApiKey) {
      console.log('Using API key from environment variable');
      setApiKey(envApiKey);
      // Also save to localStorage for future use
      localStorage.setItem(API_KEY_STORAGE_KEY, envApiKey);
    } else if (storedApiKey) {
      console.log('Using API key from localStorage');
      setApiKey(storedApiKey);
    }

    // Load selected voice from localStorage
    const storedVoiceId = localStorage.getItem(VOICE_ID_STORAGE_KEY);
    if (storedVoiceId) {
      setSelectedVoiceId(storedVoiceId);
    }

    // Load default voices
    setVoices([
      { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Child-friendly)' },
      { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
      { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
      { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
      { voice_id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
      { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
      { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
      { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
      { voice_id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' }
    ]);
  }, []);

  // Fetch available voices from the API
  const fetchVoices = useCallback(async () => {
    if (!apiKey) {
      console.warn('Cannot fetch voices: API key not set');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.voices && Array.isArray(data.voices)) {
        interface ElevenLabsVoice {
          voice_id: string;
          name: string;
        }
        
        const fetchedVoices = data.voices.map((voice: ElevenLabsVoice) => ({
          voice_id: voice.voice_id,
          name: voice.name
        }));
        
        console.log('Fetched voices:', fetchedVoices);
        setVoices(fetchedVoices);
        
        // Verify if current voice is in the list
        const voiceExists = fetchedVoices.some(
          (voice: Voice) => voice.voice_id === selectedVoiceId
        );
        
        if (!voiceExists && fetchedVoices.length > 0) {
          // Set to first available voice
          setSelectedVoiceId(fetchedVoices[0].voice_id);
          localStorage.setItem(VOICE_ID_STORAGE_KEY, fetchedVoices[0].voice_id);
        }
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, selectedVoiceId]);

  // Set API key
  const setApiKeyAndStore = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    // Fetch voices after setting API key
    fetchVoices();
  }, [fetchVoices]);

  // Set selected voice
  const setVoice = useCallback((voiceId: string) => {
    // Verify voice exists
    const voiceExists = voices.some(voice => voice.voice_id === voiceId);
    if (!voiceExists && voices.length > 0) {
      voiceId = voices[0].voice_id;
    }
    
    setSelectedVoiceId(voiceId);
    localStorage.setItem(VOICE_ID_STORAGE_KEY, voiceId);
    return true;
  }, [voices]);

  // Play audio using ElevenLabs API
  const playAudio = useCallback(async (text: string) => {
    if (!apiKey) {
      console.warn('Cannot play audio: API key not set');
      browserTTS(text);
      return;
    }

    if (!text || text.trim() === '') {
      console.warn('Cannot play audio: Empty text');
      return;
    }

    // Create a cleanup function to handle component unmounting during playback
    let isMounted = true;
    const cleanup = () => {
      isMounted = false;
    };

    setIsLoading(true);
    try {
      // For very short words (2 chars or less), use browser TTS
      if (text.length <= 2) {
        browserTTS(text);
        setIsLoading(false);
        return cleanup;
      }

      // Create a clean audio element for each request
      const audio = new Audio();
      
      // Use the ElevenLabs API directly
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text: text.toUpperCase(), // Uppercase for better pronunciation
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      
      // Create object URL
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Set up audio element
      audio.src = audioUrl;
      
      // Set up event listeners
      audio.onloadeddata = () => {
        console.log('Audio loaded successfully');
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
        browserTTS(text); // Fallback
      };
      
      audio.onended = () => {
        console.log('Audio playback complete');
        URL.revokeObjectURL(audioUrl);
      };
      
      // Add an abort controller to handle interruptions
      const controller = new AbortController();
      const signal = controller.signal;
      
      // Setup a promise that resolves when playback is complete or aborted
      const playbackPromise = new Promise((resolve) => {
        audio.onended = () => {
          if (isMounted) {
            console.log('Audio playback complete');
            URL.revokeObjectURL(audioUrl);
            resolve('complete');
          }
        };
        
        signal.addEventListener('abort', () => {
          audio.pause();
          audio.src = '';
          URL.revokeObjectURL(audioUrl);
          resolve('aborted');
        });
      });
      
      // Start playback
      try {
        await audio.play();
        // Wait for playback to complete or be aborted
        await playbackPromise;
      } catch (playError) {
        if (isMounted) {
          console.warn('Playback interrupted:', playError);
          URL.revokeObjectURL(audioUrl);
        }
      }
      
    } catch (error) {
      if (isMounted) {
        console.error('Error playing audio:', error);
        // Fall back to browser TTS
        browserTTS(text);
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
    
    // Return cleanup function
    return cleanup;
  }, [apiKey, selectedVoiceId]);

  return {
    apiKey,
    setApiKey: setApiKeyAndStore,
    voices,
    selectedVoiceId,
    setVoice,
    playAudio,
    isLoading,
    fetchVoices,
    hasApiKey: !!apiKey
  };
}
