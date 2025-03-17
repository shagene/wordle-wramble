/**
 * Utility service for handling shared word lists
 */

import { WordList } from "../game/types";

/**
 * Encodes a word list for sharing
 * @param list The word list to encode
 * @returns The encoded string for the URL
 */
export function encodeWordList(list: WordList): string {
  // Create a simplified version of the list to reduce URL size
  const shareableList = {
    name: list.name,
    words: list.words,
    hints: list.hints || []
  };
  
  // Convert to JSON and compress
  const jsonData = JSON.stringify(shareableList);
  const compressedData = compressData(jsonData);
  
  // Encode the compressed data
  return encodeURIComponent(btoa(compressedData));
}

/**
 * Decodes a shared word list from an encoded string
 * @param encodedData The encoded string from the URL
 * @returns The decoded word list data or null if invalid
 */
export function decodeWordList(encodedData: string): {
  name: string;
  words: string[];
  hints?: string[];
} | null {
  try {
    // Decode the shared list data from the URL
    const rawData = atob(decodeURIComponent(encodedData));
    
    // Try to parse with decompression first
    try {
      const decompressedData = decompressData(rawData);
      const decodedData = JSON.parse(decompressedData);
      
      // Validate the data structure
      if (!decodedData.name || !Array.isArray(decodedData.words) || decodedData.words.length === 0) {
        throw new Error('Invalid data structure');
      }
      
      return decodedData;
    } catch {
      // If decompression fails, try parsing directly (for backward compatibility)
      console.log('Decompression failed, trying direct parsing');
      const directData = JSON.parse(rawData);
      
      // Validate the data structure
      if (!directData.name || !Array.isArray(directData.words) || directData.words.length === 0) {
        return null;
      }
      
      return directData;
    }
  } catch (error) {
    console.error('Error decoding shared list:', error);
    return null;
  }
}

/**
 * Creates a temporary word list from shared data
 * @param sharedData The decoded shared list data
 * @returns A WordList object with a temporary ID
 */
export function createTempWordList(sharedData: {
  name: string;
  words: string[];
  hints?: string[];
}): WordList {
  return {
    id: `temp-${Date.now()}`,
    name: sharedData.name,
    words: sharedData.words,
    hints: sharedData.hints || [],
    dateCreated: new Date().toISOString()
  };
}

/**
 * Saves a shared word list to the user's localStorage
 * @param sharedData The decoded shared list data
 * @returns The ID of the saved list
 */
export function saveSharedWordList(sharedData: {
  name: string;
  words: string[];
  hints?: string[];
}): string {
  // Get existing lists from localStorage
  const existingLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
  
  // Create a new list object with a unique ID
  const newList: WordList = {
    id: `shared-${Date.now()}`,
    name: `${sharedData.name} (Shared)`,
    words: sharedData.words,
    hints: sharedData.hints || [],
    dateCreated: new Date().toISOString()
  };
  
  // Add the new list to existing lists
  const updatedLists = [...existingLists, newList];
  
  // Save back to localStorage
  localStorage.setItem('wordLists', JSON.stringify(updatedLists));
  
  return newList.id;
}

/**
 * Compresses a string by removing unnecessary characters
 * This is a simple implementation to reduce URL length
 * @param data The string to compress
 * @returns The compressed string
 */
export function compressData(data: string): string {
  // Replace common JSON patterns with shorter versions
  return data
    .replace(/"name":/g, '"n":')
    .replace(/"words":/g, '"w":')
    .replace(/"hints":/g, '"h":');
}

/**
 * Decompresses a string that was compressed with compressData
 * @param compressedData The compressed string
 * @returns The decompressed string
 */
export function decompressData(compressedData: string): string {
  // Replace shortened versions back to original JSON patterns
  return compressedData
    .replace(/"n":/g, '"name":')
    .replace(/"w":/g, '"words":')
    .replace(/"h":/g, '"hints":');
} 