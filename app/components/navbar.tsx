"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import type { Session, AuthChangeEvent, User } from "@supabase/supabase-js";

const Navbar = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setDisplayName(data.session?.user.user_metadata?.full_name || "");
    };
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        setDisplayName(session?.user.user_metadata?.full_name || "");
        setEditing(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = () => {
    // Automatically detect environment
    const isDev = process.env.NODE_ENV === "development";
    const siteUrl = isDev
      ? "http://localhost:3000"
      : "https://owenomc-starter.vercel.app";

    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/`,
        queryParams: {
          prompt: "select_account", // forces account picker
        },
      },
    });
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  // Update user's display name in Supabase
  const updateDisplayName = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName },
    });

    if (error) {
      alert("Error updating display name: " + error.message);
    } else {
      setEditing(false);
    }
    setLoading(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-lg bg-white/60 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight">Starter</h1>

      <nav className="text-md hidden md:flex gap-8 font-medium">
        <a href="#home" className="hover:text-blue-800 transition">
          Home
        </a>
        <a href="#features" className="hover:text-blue-800 transition">
          Features
        </a>
        <a href="#reviews" className="hover:text-blue-800 transition">
          Reviews
        </a>
        <a href="#products" className="hover:text-blue-800 transition">
          Products
        </a>
      </nav>

      <div className="flex items-center gap-4">
        {session && user ? (
          <>
            <div className="flex flex-col text-left mr-4 min-w-[180px]">
              <span className="text-xs text-gray-600 ">User ID:</span>
              <span className="truncate text-sm font-mono">{user.id}</span>

              <span className="text-xs mt-1 text-gray-600">Display Name:</span>
              {editing ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="border px-2 py-1 rounded text-sm"
                    disabled={loading}
                  />
                  <button
                    onClick={updateDisplayName}
                    disabled={loading}
                    className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setDisplayName(user.user_metadata?.full_name || "");
                    }}
                    disabled={loading}
                    className="text-gray-500 hover:text-gray-700 transition text-sm"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{displayName || "(none)"}</span>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-600 hover:underline text-xs"
                    title="Edit display name"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

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
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
