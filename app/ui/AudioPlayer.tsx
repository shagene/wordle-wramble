"use client";

import React, { useState, useEffect } from 'react';
import { textToSpeech, isApiKeySet, getAvailableVoices, setSelectedVoice, getSelectedVoice, Voice } from '@/app/services/elevenlabs';

interface AudioPlayerProps {
  text: string;
  className?: string;
  showVoiceSelector?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function AudioPlayer({ 
  text, 
  className = '', 
  showVoiceSelector = false,
  onPlayStateChange
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(getSelectedVoice());

  useEffect(() => {
    // Load available voices
    setVoices(getAvailableVoices());
  }, []);

  useEffect(() => {
    // Clear audio URL when text changes
    setAudioUrl(null);
  }, [text]);

  // Update parent component when play state changes
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  const handlePlay = async () => {
    // Prevent multiple clicks while processing
    if (isPlaying) return;
    
    setIsPlaying(true);
    setError(null);

    try {
      // If we already have the audio URL, use it
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setError('Failed to play audio');
          setIsPlaying(false);
        };
        await audio.play();
        return;
      }

      // Check if API key is set
      if (!isApiKeySet()) {
        // For demo purposes, we'll use the browser's built-in speech synthesis
        // as a fallback when no API key is provided
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => {
          setError('Failed to play audio');
          setIsPlaying(false);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        // Use ElevenLabs API
        const result = await textToSpeech(text, selectedVoiceId);
        
        // Check if we got a valid URL back
        if (result) {
          setAudioUrl(result);
          
          const audio = new Audio(result);
          audio.onended = () => setIsPlaying(false);
          audio.onerror = () => {
            setError('Failed to play audio');
            setIsPlaying(false);
          };
          await audio.play();
        } else {
          // If we didn't get a valid URL, fall back to browser speech synthesis
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => {
            setError('Failed to play audio');
            setIsPlaying(false);
          };
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to play audio');
      setIsPlaying(false);
      
      // Try fallback to browser speech synthesis on error
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      } catch (fallbackErr) {
        console.error('Fallback speech synthesis failed:', fallbackErr);
      }
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceId = e.target.value;
    setSelectedVoiceId(voiceId);
    setSelectedVoice(voiceId);
    // Clear audio URL so it will be regenerated with the new voice
    setAudioUrl(null);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={handlePlay}
        disabled={isPlaying}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          bg-blue-500 text-white shadow-md
          hover:bg-blue-600 active:bg-blue-700
          transition duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isPlaying ? 'animate-pulse' : ''}
        `}
        aria-label="Play pronunciation"
      >
        {isPlaying ? (
          <span className="animate-pulse">▶</span>
        ) : (
          <span>▶</span>
        )}
      </button>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {showVoiceSelector && (
        <div className="mt-4 w-full max-w-xs">
          <label htmlFor="voice-selector" className="block text-sm font-medium text-gray-700 mb-1">
            Select Voice
          </label>
          <select
            id="voice-selector"
            value={selectedVoiceId}
            onChange={handleVoiceChange}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg
              text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-all duration-200"
          >
            {voices.map((voice, index) => (
              <option key={`${voice.voice_id}-${index}`} value={voice.voice_id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
