'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { Navbar, NavbarSection, NavbarSpacer } from '../../components/navbar';
import { Avatar } from '../../components/avatar';
import { 
  Dropdown, 
  DropdownButton as DropdownButton,
  DropdownMenu as DropdownItems,
  DropdownItem as DropdownItem,
  DropdownDivider as DropdownSeparator
} from '../../components/dropdown';
import { useState } from 'react';

export default function AuthNav() {
  console.log('[AuthNav] Rendering or executing...');
  const { user, isLoading: authLoading, signOut } = useAuth();
  const pathname = usePathname();
  
  // Check if we're on an auth page
  const isLoginPage = pathname === '/auth/login' || pathname.startsWith('/auth/login?');
  const isSignupPage = pathname === '/auth/signup' || pathname.startsWith('/auth/signup?');
  const isAuthPage = isLoginPage || isSignupPage || pathname.startsWith('/auth/');

  // Get initials from email for avatar
  const getInitials = (email: string | undefined) => {
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      // Update UI to indicate signing out
      setIsSigningOut(true);
      
      // Call the sign out function from the auth hook
      await signOut();
      
      // The auth hook should already handle redirects, but as a fallback:
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }, 500);
    } catch (error) {
      console.error('Error during sign out:', error);
      // Show error notification if needed
      setIsSigningOut(false);
    }
  };

  // Add state for signing out status
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <div className="bg-white/60 backdrop-blur-md border-b border-gradient-to-r shadow-sm sticky top-0 z-50">
      {/* Gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-400 to-purple-500"></div>
      
      <div className="container mx-auto px-4">
        <Navbar className="py-3">
          <NavbarSection>
            {/* Logo Icon with Link to Home */}
            <Link href="/" className="w-9 h-9 flex items-center justify-center">
              <span className="inline-block text-2xl font-[family-name:var(--font-bubblegum-sans)] hover:animate-bounce transition-transform duration-300">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_auto] animate-gradient">W</span>
              </span>
            </Link>
          </NavbarSection>
          
          <NavbarSpacer />
          
          <NavbarSection>
            {authLoading ? (
              <div className="animate-pulse bg-blue-100 h-8 w-20 rounded-full"></div>
            ) : user ? (
              <Dropdown>
                <DropdownButton className="flex items-center gap-2 rounded-full bg-white/80 border border-blue-100 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-all duration-300 shadow-sm">
                  <span className="hidden sm:inline-block mr-1">{user.email?.split('@')[0]}</span>
                  <Avatar 
                    initials={getInitials(user.email)} 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-8 h-8" 
                  />
                </DropdownButton>
                <DropdownItems className="w-48 right-0 rounded-xl overflow-hidden shadow-lg">
                  <DropdownItem href="/auth/profile">
                    <div data-slot="icon" className="fill-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.07 18.28c.43-.9 3.05-1.78 4.93-1.78s4.51.88 4.93 1.78C15.57 19.36 13.86 20 12 20s-3.57-.64-4.93-1.72zm11.29-1.45c-1.43-1.74-4.9-2.33-6.36-2.33s-4.93.59-6.36 2.33A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 1.82-.62 3.49-1.64 4.83zM12 6c-1.94 0-3.5 1.56-3.5 3.5S10.06 13 12 13s3.5-1.56 3.5-3.5S13.94 6 12 6zm0 5c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z" />
                      </svg>
                    </div>
                    <span className="font-medium">Profile</span>
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    <div data-slot="icon" className="fill-purple-500">
                      {isSigningOut ? (
                        <svg className="animate-spin size-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5">
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
                  </DropdownItem>
                </DropdownItems>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-3">
                {isAuthPage ? (
                  /* Show Home button when on auth pages */
                  <Link 
                    href="/"
                    className="bg-white text-gray-800 border border-gray-200 rounded-lg shadow-sm hover:shadow-md dark:bg-gray-800 dark:text-white dark:border-gray-700 text-xl px-4 py-2 hover:scale-105 transition-transform duration-300 font-[family-name:var(--font-bubblegum-sans)]"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.031-.028.062-.056.091-.086L12 5.43z" />
                      </svg>
                      <span>Home</span>
                    </div>
                  </Link>
                ) : (
                  /* Show regular auth buttons when not on auth pages */
                  <>
                    <Link 
                      href="/auth/login"
                      className="bg-blue-500 text-white rounded-lg shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900 text-xl px-4 py-2 hover:scale-105 transition-transform duration-300 font-[family-name:var(--font-bubblegum-sans)]"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                        <span>Sign In</span>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/auth/signup"
                      className="bg-purple-500 text-white rounded-lg shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900 text-xl px-4 py-2 hover:scale-105 transition-transform duration-300 font-[family-name:var(--font-bubblegum-sans)]"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                        </svg>
                        <span>Sign Up</span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            )}
          </NavbarSection>
        </Navbar>
      </div>
    </div>
  );
} 