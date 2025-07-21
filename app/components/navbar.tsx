'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

const Navbar = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`, // ensure this matches your Supabase redirect URL
      },
    });
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-lg bg-white/60 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight">Logitech G Pro X</h1>

      <nav className="text-md hidden md:flex gap-8 font-medium">
        <a href="#home" className="hover:text-blue-800 transition">Home</a>
        <a href="#features" className="hover:text-blue-800 transition">Features</a>
        <a href="#reviews" className="hover:text-blue-800 transition">Reviews</a>
        <a href="#product" className="hover:text-blue-800 transition">Product</a>
      </nav>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="hidden md:inline text-sm font-medium">Account</span>
            <button
              onClick={handleSignOut}
              className="bg-black text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={handleSignIn}
            className="bg-black text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition"
          >
            Sign In / Sign Up
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
