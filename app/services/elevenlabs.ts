// ElevenLabs API service for text-to-speech functionality

// API key for ElevenLabs
let apiKey: string | null = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY || null;

// Voice interface
export interface Voice {
  voice_id: string;
  name: string;
  preview_url?: string;
}

// Default available voices
let availableVoices: Voice[] = [
  { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Child-friendly)' },
  { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
  { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
  { voice_id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
  { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
  { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
  { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
  { voice_id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' }
];

// Selected voice ID (defaults to Rachel)
let selectedVoiceId: string = '21m00Tcm4TlvDq8ikWAM';

// Initialize from localStorage if available (client-side only)
if (typeof window !== 'undefined') {
  try {
    const storedKey = localStorage.getItem('elevenlabs-api-key');
    if (storedKey) {
      apiKey = storedKey;
      console.log('Loaded API key from localStorage');
    }
    
    const storedVoice = localStorage.getItem('elevenlabs-selected-voice');
    if (storedVoice) {
      console.log(`Loading voice ID from localStorage: ${storedVoice}`);
      selectedVoiceId = storedVoice;
    } else {
      console.log('No voice ID found in localStorage, using default');
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
}

/**
 * Set the API key for ElevenLabs
 * @param key - The API key from ElevenLabs
 */
export const setElevenLabsApiKey = (key: string): boolean => {
  apiKey = key;
  
  // Save to localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('elevenlabs-api-key', key);
      console.log('Saved API key to localStorage');
    } catch (error) {
      console.error('Error saving API key to localStorage:', error);
    }
  }
  
  // When API key is set, try to fetch available voices
  fetchVoices().then(voices => {
    console.log(`Fetched ${voices.length} voices after setting API key`);
  }).catch(error => {
    console.error('Error fetching voices after setting API key:', error);
  });
  
  return isApiKeySet();
};

/**
 * Check if the API key has been set
 * @returns boolean indicating if the API key is set
 */
export const isApiKeySet = (): boolean => {
  return apiKey !== null && apiKey.trim() !== '';
};

/**
 * Fetch available voices from ElevenLabs API
 * @returns Promise with the list of available voices
 */
export const fetchVoices = async (): Promise<Voice[]> => {
  // Check if API key is set
  if (!isApiKeySet()) {
    return availableVoices; // Return default voices if API key is not set
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey as string,
      },
    });

    if (!response.ok) {
      return availableVoices;
    }

    const data = await response.json();
    
    if (data.voices && Array.isArray(data.voices)) {
      // Update available voices with fetched data
      const fetchedVoices = data.voices.map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        preview_url: voice.preview_url
      }));
      
      // Update the available voices
      availableVoices = fetchedVoices;
      
      // Check if the currently selected voice is still valid
      const voiceStillExists = availableVoices.some(voice => voice.voice_id === selectedVoiceId);
      if (!voiceStillExists && availableVoices.length > 0) {
        // If not, update to the first available voice
        selectedVoiceId = availableVoices[0].voice_id;
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('elevenLabsSelectedVoice', selectedVoiceId);
          } catch (e) {
            console.error('Error saving voice ID to localStorage');
          }
        }
      }
    }

    return availableVoices;
  } catch (error) {
    return availableVoices; // Return default voices on error
  }
};

/**
 * Get available voices
 * @returns Array of available voices
 */
export const getAvailableVoices = (): Voice[] => {
  return availableVoices;
};

/**
 * Set the selected voice ID
 * @param voiceId - The voice ID to use
 * @returns boolean indicating if the voice was set successfully
 */
export const setSelectedVoice = (voiceId: string): boolean => {
  // Verify the voice ID exists in available voices
  const voiceExists = availableVoices.some(voice => voice.voice_id === voiceId);
  
  if (!voiceExists) {
    console.warn(`Voice ID ${voiceId} not found in available voices`);
    
    // If we have voices but the requested one isn't valid, use the first available
    if (availableVoices.length > 0) {
      const defaultVoice = availableVoices[0].voice_id;
      console.log(`Using default voice instead: ${defaultVoice}`);
      voiceId = defaultVoice;
    } else {
      console.error('No voices available to select from');
      return false;
    }
  }
  
  // Update the selected voice ID
  selectedVoiceId = voiceId;
  console.log(`Voice selected in service: ${voiceId}`);
  
  // Save to localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('elevenlabs-selected-voice');
      localStorage.setItem('elevenlabs-selected-voice', voiceId);
      console.log(`Saved voice ID to localStorage: ${voiceId}`);
    } catch (error) {
      console.error('Error saving voice to localStorage:', error);
    }
  }
  
  return true;
};

/**
 * Get the currently selected voice ID
 * @returns The currently selected voice ID
 */
export const getSelectedVoice = (): string => {
  return selectedVoiceId;
};

/**
 * Convert text to speech using browser speech synthesis as primary method
 * @param text - The text to convert to speech
 * @param voiceId - The voice ID to use (only used if fallback to ElevenLabs)
 * @param forceElevenLabs - If true, try ElevenLabs API instead of browser speech
 * @returns Promise with 'browser-tts' for browser TTS or audio URL for ElevenLabs, or null if error
 */
export const textToSpeech = async (
  text: string,
  voiceId: string = selectedVoiceId,
  forceElevenLabs: boolean = false
): Promise<string | null> => {
  // Uppercase for consistent pronunciation
  const normalizedText = text.trim().toUpperCase();
  
  // SIMPLIFIED APPROACH: Always use browser speech synthesis unless forced to use ElevenLabs
  if (!forceElevenLabs && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    console.log(`Using browser speech synthesis for word: ${normalizedText}`);
    
    try {
      // Always cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      // Create an utterance
      const utterance = new SpeechSynthesisUtterance(normalizedText);
      
      // Set properties for better playback
      utterance.rate = 0.8;   // Slightly slower for clarity
      utterance.pitch = 1.0;  // Normal pitch
      utterance.volume = 1.0; // Maximum volume
      
      // Set language explicitly to English
      utterance.lang = 'en-US';
      
      // Get available voices and select a good one
      const voices = window.speechSynthesis.getVoices();
      
      // If we have voices, try to find an English one
      if (voices && voices.length > 0) {
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en-') && voice.name.includes('Female'));
        
        if (englishVoice) {
          utterance.voice = englishVoice;
          console.log(`Using voice: ${englishVoice.name}`);
        }
      }
      
      // Add event handlers for debugging
      utterance.onstart = () => console.log('Browser speech started for:', normalizedText);
      utterance.onend = () => console.log('Browser speech ended for:', normalizedText);
      utterance.onerror = (event) => console.error('Browser speech error:', event.error);
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
      
      // Chrome sometimes pauses speech synthesis when the tab is in background
      // This is a workaround to keep it going
      if (navigator.userAgent.includes('Chrome')) {
        const resumeTimeout = () => {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        };
        
        // Resume every 250ms to prevent Chrome from pausing
        const intervalId = setInterval(resumeTimeout, 250);
        
        // Clear the interval when speech ends
        utterance.onend = () => {
          clearInterval(intervalId);
          console.log('Browser speech ended for:', normalizedText);
        };
        
        // Also clear on error
        utterance.onerror = (event) => {
          clearInterval(intervalId);
          console.error('Browser speech error:', event.error);
        };
      }
      
      return 'browser-tts'; // Special marker to indicate browser TTS was used
    } catch (browserError) {
      console.error('Browser speech synthesis error:', browserError);
      // Fall through to ElevenLabs API if forceElevenLabs is true
    }
  }
  
  // Only try ElevenLabs if explicitly forced and API key is set
  if (forceElevenLabs && isApiKeySet()) {
    console.log(`Attempting ElevenLabs API for word: ${normalizedText}`);
    
    try {
      // Make sure we have a valid voice ID
      if (!voiceId) {
        voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel (Child-friendly)
      }
      
      // Verify the voice ID exists in available voices
      const voiceExists = availableVoices.some(voice => voice.voice_id === voiceId);
      if (!voiceExists && availableVoices.length > 0) {
        voiceId = availableVoices[0].voice_id;
      }
      
      // According to latest ElevenLabs API docs
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      
      // Prepare request options according to the latest docs
      const requestOptions = {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',  // Request MP3 format for better compatibility
          'Content-Type': 'application/json',
          'xi-api-key': apiKey as string,
        },
        body: JSON.stringify({
          text: normalizedText,
          model_id: 'eleven_monolingual_v1',  // Use monolingual model for English
          voice_settings: {
            stability: 0.6,  // Slightly higher stability for clearer pronunciation
            similarity_boost: 0.75,  // Higher similarity for better voice quality
            style: 0.0,  // Neutral style
            use_speaker_boost: true  // Enable speaker boost for clearer audio
          }
        }),
      };
      
      const response = await fetch(url, requestOptions);
      
      // Handle HTTP errors
      if (!response.ok) {
        console.error(`ElevenLabs API error: ${response.status}`);
        return null;
      }
      
      // Check if the response actually contains audio data
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('audio/')) {
        console.error(`Unexpected content type: ${contentType}`);
        return null;
      }
      
      // Get the audio blob from the response
      const audioBlob = await response.blob();
      
      // Verify that we actually got a valid audio blob
      if (audioBlob.size === 0) {
        console.error('Received empty audio blob from ElevenLabs');
        return null;
      }
      
      // Create an object URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log(`Created audio URL for word: ${normalizedText}`);
      
      return audioUrl;
    } catch (error) {
      console.error('Error calling ElevenLabs API:', error);
      return null;
    }
  }
  
  return null;
};


