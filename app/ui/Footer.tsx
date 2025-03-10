"use client";

/**
 * Footer component for the application
 * Displays a simple copyright message and attribution
 */
const Footer = () => {
  return (
    <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Built with ❤️ for young spellers</p>
        <p>© {new Date().getFullYear()} Wordle Wramble - Spelling Fun for Kids!</p>
      </div>
    </footer>
  );
};

export { Footer };
