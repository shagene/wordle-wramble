"use client";

import { useState, useEffect } from "react";
import { Heading } from "../components/heading";
import { Button } from "../components/button";
import { WordList } from "../game/types";
import Link from "next/link";
import { encodeWordList } from "../services/shareService";

export default function SharePage() {
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState<WordList | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Load word lists from localStorage
  useEffect(() => {
    const loadWordLists = () => {
      try {
        setLoading(true);
        
        // Check if we're in the browser environment before accessing localStorage
        if (typeof window !== 'undefined') {
          // Load saved lists from localStorage
          const savedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
          setWordLists(savedLists);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading word lists:', error);
        setWordLists([]);
        setLoading(false);
      }
    };
    
    loadWordLists();
  }, []);

  // Generate share URL for the selected word list
  const generateShareUrl = (list: WordList) => {
    // Encode the list data using our utility function
    const encodedData = encodeWordList(list);
    
    // Create the full URL
    const url = `${window.location.origin}/share/${encodedData}`;
    
    setSelectedList(list);
    setShareUrl(url);
    setCopied(false);
  };

  // Copy share URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-purple-600 dark:text-purple-400">
        Share Your Word Lists
      </Heading>
      <p className="text-xl text-center max-w-2xl mb-8 font-[family-name:var(--font-bubblegum-sans)]">
        Create a special link to share your word lists with friends and family!
      </p>
      
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent mx-auto mb-4"></div>
            <p>Loading your word lists...</p>
          </div>
        ) : wordLists.length === 0 ? (
          <div className="text-center py-4">
            <p className="mb-4">You don&apos;t have any word lists to share yet!</p>
            <Link href="/wordlist/create">
              <Button color="green" className="text-white font-[family-name:var(--font-bubblegum-sans)]">
                Create a Word List
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4 text-center">Select a Word List to Share</h2>
            <div className="space-y-3 mb-6">
              {wordLists.map((list) => (
                <div 
                  key={list.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedList?.id === list.id 
                      ? 'bg-purple-100 dark:bg-purple-900' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-800'
                  }`}
                  onClick={() => generateShareUrl(list)}
                >
                  <p className="font-medium">{list.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{list.words.length} words</p>
                </div>
              ))}
            </div>
            
            {shareUrl && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium mb-2">Share Link for &quot;{selectedList?.name}&quot;</h3>
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 p-2 text-sm border rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-r-md transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                    Link copied to clipboard!
                  </p>
                )}
                {shareUrl.length > 2000 && (
                  <p className="text-amber-600 dark:text-amber-400 text-sm mt-2">
                    This link is quite long. You may want to use a URL shortener service like bit.ly or tinyurl.com before sharing.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="flex gap-4">
        <Button color="blue" href="/" className="font-[family-name:var(--font-bubblegum-sans)]">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
