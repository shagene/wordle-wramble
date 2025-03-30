/**
 * Central route definitions for the application
 * Helps maintain consistent navigation and route references
 */

export const ROUTES = {
  HOME: '/',
  
  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY: '/auth/verify',
    PROFILE: '/auth/profile',
    CALLBACK: '/auth/callback',
  },
  
  // Game routes
  GAME: {
    HOME: '/game',
    PLAY: (id: string) => `/game/${id}`,
  },
  
  // Word list routes
  WORDLIST: {
    HOME: '/wordlist',
    CREATE: '/wordlist/create',
    EDIT: (id: string) => `/wordlist/edit/${id}`,
    VIEW: (id: string) => `/wordlist/${id}`,
  },
  
  // Account routes
  ACCOUNT: {
    HOME: '/account',
    UPGRADE: '/account/upgrade',
    SUBSCRIPTION: '/account/subscription',
  },
};

/**
 * Helper function to create a redirect URL
 * @param path The path to redirect to
 * @param currentPath The current path to return to (optional)
 */
export function createRedirectUrl(
  path: string,
  currentPath?: string
): string {
  if (!currentPath) return path;
  return `${path}?redirect=${encodeURIComponent(currentPath)}`;
}

/**
 * Helper function to extract a redirect URL from query parameters
 * @param url The URL to extract the redirect path from
 * @param defaultPath The default path to redirect to if none is found
 */
export function getRedirectPath(
  url: URL | string,
  defaultPath: string = '/'
): string {
  const parsedUrl = typeof url === 'string' ? new URL(url, window.location.origin) : url;
  return parsedUrl.searchParams.get('redirect') || defaultPath;
} 