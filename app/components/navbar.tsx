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

  // Track auth and listen to user doc real-time
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setError(null);
      if (firebaseUser) {
        setUser(firebaseUser);

        const userDocRef = doc(db, "users", firebaseUser.uid);

        // Real-time listener on user doc
        const unsubscribeUserDoc = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserDoc;
              setUserDoc(data);
              if (!editing) setDisplayNameEdit(data.displayName);
              applyDarkMode(data.darkMode);
            } else {
              // Create user doc if missing
              setDoc(userDocRef, {
                displayName: firebaseUser.displayName || "",
                darkMode: false,
                subscriptionActive: false,
                courseBought: false,
                createdAt: serverTimestamp(),
              }).catch((e) =>
                setError("Failed creating user doc: " + e.message)
              );
            }
          },
          (err) => setError("Failed to load user data: " + err.message)
        );

        return () => unsubscribeUserDoc();
      } else {
        setUser(null);
        setUserDoc(null);
        setDisplayNameEdit("");
        applyDarkMode(false);
      }
    });

    return () => unsubscribeAuth();
  }, [editing]);

  // Apply dark mode class to <html>
  const applyDarkMode = (enabled: boolean) => {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    if (enabled) html.classList.add("dark");
    else html.classList.remove("dark");
  };

  // Save displayName to Firebase Auth & Firestore
  const saveDisplayName = async () => {
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      await updateProfile(user, { displayName: displayNameEdit });
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { displayName: displayNameEdit });
      setEditing(false);
    } catch (error: unknown) {
      setError("Failed updating display name: " + (error as Error).message);
    }
    setLoading(false);
  };

  // Cancel editing displayName and revert
  const cancelEditing = () => {
    if (userDoc) setDisplayNameEdit(userDoc.displayName);
    setEditing(false);
    setError(null);
  };

  // Toggle boolean fields in Firestore
  const toggleField = async (
    field: keyof Omit<UserDoc, "displayName">,
    value: boolean
  ) => {
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { [field]: value });
    } catch (e: unknown) {
      setError(`Failed to update ${field}: ` + (e as Error).message);
    }
    setLoading(false);
  };

  // Sign in/out handlers
  const handleSignIn = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      setError("Sign in failed: " + (error as Error).message);
    }
  };
  const handleSignOut = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (error: unknown) {
      setError("Sign out failed: " + (error as Error).message);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center backdrop-blur-lg bg-white/60 dark:bg-gray-900/70 shadow-sm gap-4">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Starter
      </h1>

      <nav className="text-md hidden md:flex gap-8 font-medium text-gray-800 dark:text-gray-200">
        <a
          href="#home"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          Home
        </a>
        <a
          href="#features"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          Features
        </a>
        <a
          href="#reviews"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          Reviews
        </a>
        <a
          href="#products"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          Products
        </a>
      </nav>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {user && userDoc ? (
          <>
            <div className="flex flex-col text-left mr-4 min-w-[260px] space-y-4">
              <Purchase
                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SUBSCRIPTION!}
                label="Buy Subscription"
              />

              <Purchase
                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_COURSE!}
                label="Buy Course"
              />

              <UserInfoDisplay
                userId={user.uid}
                displayName={displayNameEdit}
                editing={editing}
                loading={loading}
                onEdit={() => setEditing(true)}
                onCancel={cancelEditing}
                onChangeDisplayName={setDisplayNameEdit}
                onSave={saveDisplayName}
              />

              <ToggleSwitch
                label="Dark Mode"
                checked={userDoc.darkMode}
                onChange={(val) => toggleField("darkMode", val)}
                disabled={loading}
              />
              <ToggleSwitch
                label="Subscription Active"
                checked={userDoc.subscriptionActive}
                onChange={() => {}}
                disabled={true}
              />
              <ToggleSwitch
                label="Course Bought"
                checked={userDoc.courseBought}
                onChange={() => {}}
                disabled={true}
              />
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="bg-black text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition whitespace-nowrap"
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

        {error && (
          <p className="mt-2 text-red-600 dark:text-red-400 whitespace-pre-wrap">
            {error}
          </p>
        )}
      </div>
    </header>
  );
};

type UserInfoDisplayProps = {
  userId: string;
  displayName: string;
  editing: boolean;
  loading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onChangeDisplayName: (v: string) => void;
  onSave: () => void;
};
const UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({
  userId,
  displayName,
  editing,
  loading,
  onEdit,
  onCancel,
  onChangeDisplayName,
  onSave,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-600 dark:text-gray-400">User ID:</span>
      <span className="truncate text-sm font-mono text-gray-800 dark:text-gray-200">
        {userId}
      </span>

      <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">
        Display Name:
      </span>
      {editing ? (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={displayName}
            onChange={(e) => onChangeDisplayName(e.target.value)}
            className="border px-2 py-1 rounded text-sm dark:bg-gray-800 dark:text-white"
            disabled={loading}
          />
          <button
            onClick={onSave}
            disabled={loading}
            className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition text-sm"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition text-sm"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {displayName || "(none)"}
          </span>
          <button
            onClick={onEdit}
            className="text-blue-600 hover:underline text-xs"
            title="Edit display name"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

type ToggleSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  disabled,
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`w-10 h-5 rounded-full transition-colors duration-300 ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        ></div>
      </div>
      <span className="text-sm text-gray-900 dark:text-gray-100">{label}</span>
    </label>
  );
};

export default Navbar;
