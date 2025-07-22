"use client";

import React, { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db } from "../lib/firebaseClient";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import Purchase from "./purchase";

type UserDoc = {
  displayName: string;
  darkMode: boolean;
  subscriptionActive: boolean;
  courseBought: boolean;
};

const Navbar: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [displayNameEdit, setDisplayNameEdit] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth + Firestore listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, "users", firebaseUser.uid);

        const unsubDoc = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserDoc;
            setUserDoc(data);
            if (!editing) setDisplayNameEdit(data.displayName);
            applyDarkMode(data.darkMode);
          } else {
            setDoc(userRef, {
              displayName: firebaseUser.displayName || "",
              darkMode: false,
              subscriptionActive: false,
              courseBought: false,
              createdAt: serverTimestamp(),
            });
          }
        });

        return () => unsubDoc();
      } else {
        setUser(null);
        setUserDoc(null);
        setDisplayNameEdit("");
        applyDarkMode(false);
      }
    });

    return () => unsubAuth();
  }, [editing]);

  const applyDarkMode = (enabled: boolean) => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", enabled);
  };

  const saveDisplayName = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName: displayNameEdit });
      await updateDoc(doc(db, "users", user.uid), { displayName: displayNameEdit });
      setEditing(false);
    } catch (e) {
      setError("Failed to save: " + (e as Error).message);
    }
    setLoading(false);
  };

  const toggleDarkMode = async (value: boolean) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { darkMode: value });
  };

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError("Sign in failed: " + (e as Error).message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center backdrop-blur-lg bg-white/60 dark:bg-gray-900/70 shadow-sm gap-4">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Starter
      </h1>

      <nav className="hidden md:flex gap-8 text-gray-800 dark:text-gray-200">
        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#reviews">Reviews</a>
        <a href="#products">Products</a>
      </nav>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {user && userDoc ? (
          <>
            <div className="flex flex-col gap-4">
              <Purchase
                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SUBSCRIPTION!}
                label="Buy Subscription"
              />
              <Purchase
                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_COURSE!}
                label="Buy Course"
              />

              {/* Display name editor */}
              <div>
                <span className="text-xs text-gray-500">User ID: {user.uid}</span>
                {editing ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={displayNameEdit}
                      onChange={(e) => setDisplayNameEdit(e.target.value)}
                      className="border px-2 py-1 rounded text-sm"
                    />
                    <button onClick={saveDisplayName} className="bg-black text-white px-2 py-1 rounded">
                      Save
                    </button>
                    <button onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <span>{userDoc.displayName}</span>
                    <button onClick={() => setEditing(true)} className="text-blue-500 text-xs">Edit</button>
                  </div>
                )}
              </div>

              {/* Badges for purchase status */}
              <div className="flex flex-col gap-1 mt-4">
                <span>
                  Subscription:{" "}
                  <strong className={userDoc.subscriptionActive ? "text-green-600" : "text-red-500"}>
                    {userDoc.subscriptionActive ? "Active" : "Inactive"}
                  </strong>
                </span>
                <span>
                  Course Purchased:{" "}
                  <strong className={userDoc.courseBought ? "text-green-600" : "text-red-500"}>
                    {userDoc.courseBought ? "Yes" : "No"}
                  </strong>
                </span>
              </div>

              {/* Only dark mode is toggleable */}
              <label className="flex gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userDoc.darkMode}
                  onChange={(e) => toggleDarkMode(e.target.checked)}
                />
                Dark Mode
              </label>
            </div>

            <button onClick={handleSignOut} className="bg-black text-white px-4 py-1.5 rounded">
              Sign Out
            </button>
          </>
        ) : (
          <button onClick={handleSignIn} className="bg-black text-white px-4 py-1.5 rounded">
            Sign In
          </button>
        )}

        {error && <p className="text-red-500">{error}</p>}
      </div>
    </header>
  );
};

export default Navbar;
