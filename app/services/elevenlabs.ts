// ElevenLabs API service for text-to-speech functionality

// This is the API key that will be used to authenticate with the ElevenLabs API
// In a production environment, this should be stored in environment variables
let apiKey: string | null = null;

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

/**
 * Set the API key for ElevenLabs
 * @param key - The API key from ElevenLabs
 */
export const setElevenLabsApiKey = (key: string) => {
  apiKey = key;
  // When API key is set, try to fetch available voices
  fetchVoices().catch(err => console.error('Failed to fetch voices:', err));
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
 */
export const setSelectedVoice = (voiceId: string) => {
  selectedVoiceId = voiceId;
  // Clear audio cache when voice changes
  clearAudioCache();
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
 * @returns Promise with the audio URL or null if there was an error
 */
export const textToSpeech = async (
  text: string,
  voiceId: string = selectedVoiceId // Use the selected voice ID
): Promise<string | null> => {
  // Check if we have a cached version
  const cacheKey = `${text}-${voiceId}`;
  if (audioCache[cacheKey]) {
    return audioCache[cacheKey];
  }

  // Check if API key is set
  if (!isApiKeySet()) {
    console.error('ElevenLabs API key is not set');
    return null;
  }

  try {
    // Make the actual API call to ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey as string,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }
    
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    audioCache[cacheKey] = audioUrl;
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