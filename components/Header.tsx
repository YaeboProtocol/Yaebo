"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ConnectWallet from '@/components/connect-wallet';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  const handleSignIn = async (provider = 'google') => {
    await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleEmailSignIn = () => {
    window.location.href = '/auth/login';
  };

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          STD Protocol
        </Link>
        
        <div className="flex items-center">
          <nav className="mr-6">
            <ul className="flex gap-6">
              <li>
                <Link href="/manufacturer" className="hover:text-primary-foreground/80 transition-colors font-medium">
                  Manufacturer
                </Link>
              </li>
              <li>
                <Link href="/diligence" className="hover:text-primary-foreground/80 transition-colors font-medium">
                  Diligence
                </Link>
              </li>
              <li>
                <Link href="/dao" className="hover:text-primary-foreground/80 transition-colors font-medium">
                  DAO
                </Link>
              </li>
              <li>
                <Link href="/investor" className="hover:text-primary-foreground/80 transition-colors font-medium">
                  Investor
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="relative" ref={menuRef}>
              {!loading && (
                user ? (
                  <div className="relative">
                    <Button 
                      variant="secondary" 
                      className="flex items-center gap-2" 
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs font-bold">
                        {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon size={14} />}
                      </div>
                      <span className="max-w-[100px] truncate">
                        {user.email || user.user_metadata?.name || 'User'}
                      </span>
                      <ChevronDown size={14} />
                    </Button>
                    
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          Signed in as<br/>
                          <strong className="truncate block">
                            {user.email || user.user_metadata?.name || 'User'}
                          </strong>
                        </div>
                        <Link 
                          href="/profile" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Button 
                      variant="secondary" 
                      className="flex items-center gap-2" 
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      <LogIn size={16} />
                      Sign In
                      <ChevronDown size={14} />
                    </Button>
                    
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <button
                          onClick={() => handleSignIn('google')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign in with Google
                        </button>
                        <button
                          onClick={() => handleSignIn('github')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign in with GitHub
                        </button>
                        <button
                          onClick={handleEmailSignIn}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign in with Email
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
            
            {/* <div className="relative">
              <ConnectWallet />
            </div> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 