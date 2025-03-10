// ElevenLabs API service for text-to-speech functionality

// This is the API key that will be used to authenticate with the ElevenLabs API
// In a production environment, this should be stored in environment variables
let apiKey: string | null = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY || null;

// Initialize from localStorage if available (client-side only)
if (typeof window !== 'undefined') {
  try {
    const storedKey = localStorage.getItem('elevenLabsApiKey');
    if (storedKey) {
      apiKey = storedKey;
      console.log('ElevenLabs API key loaded from localStorage');
    } else if (apiKey) {
      console.log('ElevenLabs API key loaded from environment variable');
    } else {
      console.warn('No ElevenLabs API key found');
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
}

// Cache for storing audio data to avoid unnecessary API calls
const audioCache: Record<string, string> = {};

// Voice interface and available voices
export interface Voice {
  voice_id: string;
  name: string;
  preview_url?: string;
}

// Default available voices (will be replaced when fetched from API)
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
    const storedVoice = localStorage.getItem('elevenLabsSelectedVoice');
    if (storedVoice) {
      selectedVoiceId = storedVoice;
      console.log('ElevenLabs selected voice loaded from localStorage:', selectedVoiceId);
    }
  } catch (error) {
    console.error('Error accessing localStorage for voice selection:', error);
  }
}

/**
 * Set the API key for ElevenLabs
 * @param key - The API key from ElevenLabs
 */
export const setElevenLabsApiKey = (key: string) => {
  apiKey = key;
  
  // Save to localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('elevenLabsApiKey', key);
      console.log('ElevenLabs API key saved to localStorage');
    } catch (error) {
      console.error('Error saving API key to localStorage:', error);
    }
  }
  
  // When API key is set, try to fetch available voices
  fetchVoices().catch(err => console.error('Failed to fetch voices:', err));
  
  return isApiKeySet();
};

/**
 * Check if the API key has been set
 * @returns boolean indicating if the API key is set
 */
export const isApiKeySet = (): boolean => {
  const keyIsValid = apiKey !== null && apiKey.trim() !== '';
  if (!keyIsValid) {
    console.warn('ElevenLabs API key is not set or is invalid');
  }
  return keyIsValid;
};



/**
 * Fetch available voices from ElevenLabs API
 * @returns Promise with the list of available voices
 */
export const fetchVoices = async (): Promise<Voice[]> => {
  // Check if API key is set
  if (!isApiKeySet()) {
    console.error('ElevenLabs API key is not set');
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
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.voices && Array.isArray(data.voices)) {
      // Update available voices with fetched data
      availableVoices = data.voices.map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        preview_url: voice.preview_url
      }));
    }

    return availableVoices;
  } catch (error) {
    console.error('Error fetching voices:', error);
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
    return false;
  }
  
  selectedVoiceId = voiceId;
  
  // Save to localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('elevenLabsSelectedVoice', voiceId);
      console.log('Selected voice saved to localStorage');
    } catch (error) {
      console.error('Error saving selected voice to localStorage:', error);
    }
  }
  
  // Clear audio cache when voice changes
  clearAudioCache();
  
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
 * Convert text to speech using the ElevenLabs API
 * @param text - The text to convert to speech
 * @param voiceId - The voice ID to use (defaults to the selected voice)
 * @param forceElevenLabs - If true, always use ElevenLabs API even for short words
 * @returns Promise with the audio URL or null if there was an error
 */
export const textToSpeech = async (
  text: string,
  voiceId: string = selectedVoiceId, // Use the selected voice ID
  forceElevenLabs: boolean = false // Default to allowing browser TTS for short words
): Promise<string | null> => {
  // Normalize and validate the input text
  if (!text || text.trim() === '') {
    console.error('Empty text provided to textToSpeech');
    return null;
  }
  
  // Uppercase for consistent caching and better pronunciation
  const normalizedText = text.trim().toUpperCase();
  
  // Check if we have a cached version
  const cacheKey = `${normalizedText}-${voiceId}`;
  if (audioCache[cacheKey]) {
    console.log(`Using cached audio for: ${normalizedText}`);
    return audioCache[cacheKey];
  }

  // Check if API key is set
  if (!isApiKeySet()) {
    console.error('ElevenLabs API key is not set');
    return null;
  }
  
  console.log(`Making ElevenLabs API call for text: ${normalizedText}`);
  console.log(`Using voice ID: ${voiceId}`);
  console.log(`API key is set: ${apiKey ? 'Yes' : 'No'}`);
  console.log(`API key length: ${apiKey?.length || 0}`);
  
  // For debugging only - show first and last character of API key
  if (apiKey && apiKey.length > 5) {
    const firstChar = apiKey.charAt(0);
    const lastChar = apiKey.charAt(apiKey.length - 1);
    console.log(`API key starts with ${firstChar} and ends with ${lastChar}`);
  }

  try {
    // For simple words, try browser speech synthesis first (unless forceElevenLabs is true)
    if (!forceElevenLabs && normalizedText.length <= 5 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      console.log(`Attempting browser speech synthesis for short word: ${normalizedText}`);
      
      // Check if we have voices available immediately
      const initialVoices = window.speechSynthesis.getVoices();
      console.log(`Initial voices check: ${initialVoices.length} voices available`);
      
      // If no voices are available immediately and we're on Chrome, we might need to wait
      // But if we're on Safari or Firefox and have 0 voices, it likely means speech synthesis isn't working
      const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
      
      // Skip browser TTS if we have no voices and aren't on Chrome (likely won't work)
      if (initialVoices.length === 0 && !isChrome) {
        console.log('No voices available and not on Chrome - skipping browser TTS');
      } else {
        try {
          // Function to safely get voices and speak
          const speakWithVoices = () => {
            try {
              // Cancel any ongoing speech
              window.speechSynthesis.cancel();
              
              // Create an utterance
              const utterance = new SpeechSynthesisUtterance(normalizedText);
              
              // Set properties for better playback
              utterance.rate = 0.85; // Slightly slower
              utterance.pitch = 1.0;  // Normal pitch
              utterance.volume = 1.0; // Maximum volume
              
              // Simple event handlers without accessing error properties
              utterance.onstart = () => console.log('Browser speech started');
              utterance.onend = () => console.log('Browser speech ended');
              utterance.onerror = () => console.log('Browser speech error');
              
              // Get available voices and select a good one
              const voices = window.speechSynthesis.getVoices();
              console.log(`Found ${voices.length} voices`);
              
              // If we still don't have voices, we should skip browser TTS
              if (voices.length === 0) {
                console.log('No voices available after waiting - skipping browser TTS');
                throw new Error('No voices available for speech synthesis');
              }
              
              // Try to find an English voice
              const englishVoice = voices.find(voice => 
                voice.lang.includes('en-')
              );
              if (englishVoice) {
                utterance.voice = englishVoice;
                console.log('Using voice:', englishVoice.name);
              }
              
              // Start speaking
              window.speechSynthesis.speak(utterance);
              console.log('Speech request sent for:', normalizedText);
              
              // Cache and return the special marker
              audioCache[cacheKey] = 'browser-tts';
              return true; // Success
            } catch (innerError) {
              console.log('Error in speakWithVoices:', innerError);
              return false; // Failed
            }
          };
          
          // Check if voices are already loaded
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            // Voices already loaded, speak immediately
            const success = speakWithVoices();
            if (success) {
              return 'browser-tts'; // Special marker to indicate browser TTS was used
            }
          } else {
            // Wait for voices to load
            console.log('Waiting for voices to load...');
            
            // Create a promise that resolves when voices are loaded or times out
            const voicesPromise = new Promise<boolean>((resolve) => {
              // Set up the voices changed handler
              window.speechSynthesis.onvoiceschanged = () => {
                console.log('Voices loaded, now speaking');
                const success = speakWithVoices();
                window.speechSynthesis.onvoiceschanged = null;
                resolve(success);
              };
              
              // Set a timeout in case onvoiceschanged never fires
              setTimeout(() => {
                if (window.speechSynthesis.onvoiceschanged) {
                  console.log('Voices timeout reached, trying anyway');
                  const success = speakWithVoices();
                  window.speechSynthesis.onvoiceschanged = null;
                  resolve(success);
                }
              }, 1000);
            });
            
            // Wait for the promise to resolve
            const success = await voicesPromise;
            if (success) {
              return 'browser-tts'; // Special marker to indicate browser TTS was used
            }
          }
        } catch (browserError) {
          console.error('Error with browser speech synthesis:', browserError);
          // Fall through to ElevenLabs API
        }
      }
      
      console.log('Browser speech synthesis failed or skipped, falling back to ElevenLabs');
    }
    
    // For longer words or when browser speech synthesis is not available, use ElevenLabs API
    console.log('Sending request to ElevenLabs API...');
    
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
      // Try to get the error details
      let errorDetails = 'Unknown error';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
      } catch (e) {
        try {
          errorDetails = await response.text();
        } catch (e2) {
          errorDetails = `Status: ${response.status} ${response.statusText}`;
        }
      }
      
      console.error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorDetails);
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }
    
    console.log('ElevenLabs API response received successfully');
    
    // Check if the response actually contains audio data
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('audio/')) {
      console.error('ElevenLabs API did not return audio content. Content-Type:', contentType);
      return null;
    }
    
    // Get the audio blob from the response
    const audioBlob = await response.blob();
    
    // Verify that we actually got a valid audio blob
    if (audioBlob.size === 0) {
      console.error('ElevenLabs API returned an empty audio blob');
      return null;
    }
    
    console.log(`Received audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
    
    // Create an object URL for the blob
    const audioUrl = URL.createObjectURL(audioBlob);
    audioCache[cacheKey] = audioUrl;
    console.log('Created object URL for audio:', audioUrl);
    
    // Verify the audio can be played
    if (typeof window !== 'undefined') {
      try {
        // Create a test audio element to ensure the audio plays
        const testAudio = new Audio();
        
        // Use a Promise to properly handle audio loading
        const audioTestPromise = new Promise<void>((resolve, reject) => {
          // Set up event handlers with proper error handling
          testAudio.addEventListener('loadedmetadata', () => {
            console.log('Audio metadata loaded, duration:', testAudio.duration, 'seconds');
          });
          
          testAudio.addEventListener('canplay', () => {
            console.log('Audio can start playing');
            resolve(); // Audio is ready
          });
          
          testAudio.addEventListener('error', () => {
            const errorMessage = testAudio.error ? 
              `Audio test error code: ${testAudio.error.code}` : 'unknown error';
            console.warn(errorMessage); // Use warning instead of error
            resolve(); // Resolve anyway to not block the process
          });
          
          // Set a timeout in case the events don't fire
          setTimeout(() => {
            console.log('Audio test timeout reached');
            resolve(); // Resolve anyway to not block the process
          }, 1000);
        });
        
        // Load the audio
        testAudio.src = audioUrl;
        testAudio.preload = 'auto';
        testAudio.load();
        
        // Wait for the audio test to complete (with a timeout)
        const timeoutPromise = new Promise<void>(resolve => {
          setTimeout(() => {
            console.log('Global audio test timeout reached');
            resolve();
          }, 2000);
        });
        
        // Wait for either the audio test or the timeout
        await Promise.race([audioTestPromise, timeoutPromise]);
        
        console.log('Audio test completed');
      } catch (testError) {
        console.warn('Error in audio test setup:', testError);
        // Continue anyway - the error might be due to the test, not the audio itself
      }
    }
    
    return audioUrl;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    return null;
  }
};

/**
 * Clear the audio cache
 */
export const clearAudioCache = () => {
  Object.keys(audioCache).forEach(key => {
    // Revoke object URLs to prevent memory leaks
    URL.revokeObjectURL(audioCache[key]);
    delete audioCache[key];
  });
};