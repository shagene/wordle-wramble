'use client';

import { useState } from 'react';
import { useAudioService } from '../../services/audioService';
import { Button } from '../../../app/components/button';

interface SimpleAudioPlayerProps {
  onApiKeySet?: () => void;
}

export function SimpleAudioPlayer({ onApiKeySet }: SimpleAudioPlayerProps) {
  const {
    
    setApiKey,
    voices,
    selectedVoiceId,
    setVoice,
    playAudio,
    isLoading,
    fetchVoices,
    hasApiKey
  } = useAudioService();

  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [inputApiKey, setInputApiKey] = useState('');
  const [testWord, setTestWord] = useState('');

  // Handle API key submission
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputApiKey.trim()) {
      setApiKey(inputApiKey.trim());
      setShowApiKeyInput(false);
      if (onApiKeySet) onApiKeySet();
    }
  };

  // Play a test word
  const handlePlayTest = () => {
    if (testWord.trim()) {
      playAudio(testWord.trim());
    } else {
      playAudio('Hello');
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-3">Audio Settings</h3>
      
      {/* API Key Management */}
      {!hasApiKey ? (
        <div className="mb-4">
          {showApiKeyInput ? (
            <form onSubmit={handleApiKeySubmit} className="space-y-2">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
                  ElevenLabs API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="Enter your API key"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  color="blue"
                  disabled={!inputApiKey.trim()}
                  className="text-sm py-1 px-3"
                >
                  Save Key
                </Button>
                <Button 
                  type="button" 
                  outline
                  onClick={() => setShowApiKeyInput(false)}
                  className="text-sm py-1 px-3"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button 
              color="blue"
              onClick={() => setShowApiKeyInput(true)}
              className="text-sm py-1 px-3"
            >
              Set ElevenLabs API Key
            </Button>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">API Key: ••••••••••••</span>
            <Button 
              outline
              onClick={() => setShowApiKeyInput(true)}
              className="text-xs py-0.5 px-2"
            >
              Change
            </Button>
          </div>
          
          {showApiKeyInput && (
            <form onSubmit={handleApiKeySubmit} className="mt-2 space-y-2">
              <div>
                <input
                  type="password"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="Enter new API key"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  color="blue"
                  disabled={!inputApiKey.trim()}
                  className="text-xs py-0.5 px-2"
                >
                  Update
                </Button>
                <Button 
                  type="button" 
                  outline
                  onClick={() => setShowApiKeyInput(false)}
                  className="text-xs py-0.5 px-2"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
      
      {/* Voice Selection */}
      {hasApiKey && voices.length > 0 && (
        <div className="mb-4">
          <label htmlFor="voiceSelect" className="block text-sm font-medium mb-1">
            Voice
          </label>
          <div className="flex gap-2">
            <select
              id="voiceSelect"
              value={selectedVoiceId}
              onChange={(e) => setVoice(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            >
              {voices.map((voice) => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}
                </option>
              ))}
            </select>
            <Button 
              outline
              onClick={fetchVoices}
              disabled={isLoading}
              className="text-sm py-1 px-3"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Test Audio */}
      <div className="mb-4">
        <label htmlFor="testWord" className="block text-sm font-medium mb-1">
          Test Word
        </label>
        <div className="flex gap-2">
          <input
            id="testWord"
            type="text"
            value={testWord}
            onChange={(e) => setTestWord(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md text-sm"
            placeholder="Enter a word to test"
          />
          <Button 
            color="green"
            onClick={handlePlayTest}
            disabled={isLoading}
            className="text-sm py-1 px-3"
          >
            {isLoading ? 'Playing...' : 'Play'}
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mt-2">
        {hasApiKey 
          ? "Using ElevenLabs for audio. Short words use browser speech."
          : "Using browser speech synthesis. Set an ElevenLabs API key for better quality."}
      </div>
    </div>
  );
}
