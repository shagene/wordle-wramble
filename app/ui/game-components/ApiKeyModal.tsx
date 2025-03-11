'use client';

import { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Enter ElevenLabs API Key</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          To enable audio pronunciation, please enter your ElevenLabs API key.
          You can get a free API key by signing up at{' '}
          <a 
            href="https://elevenlabs.io" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline"
          >
            elevenlabs.io
          </a>
        </p>
        <input
          type="password"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="Enter your API key"
          className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (apiKeyInput.trim()) {
                onSave(apiKeyInput.trim());
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!apiKeyInput.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
