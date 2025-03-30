/**
 * Navigation utilities for the application
 * Provides consistent navigation methods that work with our route definitions
 */

import { ROUTES, createRedirectUrl } from './routes';

/**
 * Function to navigate to a route
 * This function will be expanded to include analytics, etc.
 */
export function navigateTo(
  path: string,
  options?: {
    replace?: boolean;
    external?: boolean;
    newTab?: boolean;
  }
): void {
  // For server-side rendering, do nothing
  if (typeof window === 'undefined') return;

  const { replace = false, external = false, newTab = false } = options || {};

  if (external || newTab) {
    window.open(path, newTab ? '_blank' : '_self');
    return;
  }

  if (replace) {
    window.location.replace(path);
  } else {
    window.location.href = path;
  }
}

/**
 * Helper to navigate to login with a redirect
 */
export function navigateToLogin(currentPath?: string): void {
  navigateTo(createRedirectUrl(ROUTES.AUTH.LOGIN, currentPath));
}

/**
 * Helper to navigate to signup with a redirect
 */
export function navigateToSignup(currentPath?: string): void {
  navigateTo(createRedirectUrl(ROUTES.AUTH.SIGNUP, currentPath));
}

/**
 * Helper to navigate to a game by ID
 */
export function navigateToGame(id: string): void {
  navigateTo(ROUTES.GAME.PLAY(id));
}

/**
 * Helper to navigate to the word list creation page
 */
export function navigateToCreateWordList(): void {
  navigateTo(ROUTES.WORDLIST.CREATE);
}

/**
 * Helper to navigate to a word list by ID
 */
export function navigateToWordList(id: string): void {
  navigateTo(ROUTES.WORDLIST.VIEW(id));
}

/**
 * Helper to navigate to edit a word list by ID
 */
export function navigateToEditWordList(id: string): void {
  navigateTo(ROUTES.WORDLIST.EDIT(id));
} 