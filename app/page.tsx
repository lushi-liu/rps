"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SettingsModal } from "../components/SettingsModal";
import { HowToPlayModal } from "../components/HowToPlayModal";

interface GameSettings {
  handSize: number;
  deck: {
    regularRock: number;
    regularPaper: number;
    regularScissors: number;
    superRock: number;
    superPaper: number;
    superScissors: number;
  };
  openHand: boolean;
}

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    handSize: 6,
    deck: {
      regularRock: 4,
      regularPaper: 4,
      regularScissors: 4,
      superRock: 2,
      superPaper: 2,
      superScissors: 2,
    },
    openHand: true,
  });
  const [savedSettings, setSavedSettings] = useState<GameSettings | null>(null);
  const [error, setError] = useState("");

  // Load settings from local storage on mount
  useEffect(() => {
    const savedSettingsRaw = localStorage.getItem("gameSettings");
    if (savedSettingsRaw) {
      try {
        const parsed = JSON.parse(savedSettingsRaw);
        const loadedSettings: GameSettings = {
          handSize: Math.max(1, parsed.handSize || 8),
          deck: {
            regularRock: Math.max(0, parsed.deck?.regularRock ?? 0),
            regularPaper: Math.max(0, parsed.deck?.regularPaper ?? 0),
            regularScissors: Math.max(0, parsed.deck?.regularScissors ?? 0),
            superRock: Math.max(0, parsed.deck?.superRock ?? 0),
            superPaper: Math.max(0, parsed.deck?.superPaper ?? 0),
            superScissors: Math.max(0, parsed.deck?.superScissors ?? 0),
          },
          openHand: parsed.openHand ?? false,
        };
        setSettings(loadedSettings);
        setSavedSettings(loadedSettings);
        console.log("Loaded from localStorage:", parsed);
      } catch (e) {
        console.error("Failed to parse localStorage gameSettings:", e);
      }
    }
  }, []);

  const getQueryString = () => {
    const params = new URLSearchParams({
      handSize: settings.handSize.toString(),
      regularRock: settings.deck.regularRock.toString(),
      regularPaper: settings.deck.regularPaper.toString(),
      regularScissors: settings.deck.regularScissors.toString(),
      superRock: settings.deck.superRock.toString(),
      superPaper: settings.deck.superPaper.toString(),
      superScissors: settings.deck.superScissors.toString(),
      openHand: settings.openHand.toString(),
    });
    return params.toString();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 via-purple-200 to-pink-200">
      <motion.h1
        className="text-5xl font-extrabold mb-10 text-gray-800 drop-shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        Rock-Paper-Scissors Card Game
      </motion.h1>
      <div className="flex gap-6">
        <Link href={`/vs-bot?${getQueryString()}`}>
          <motion.button
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play vs Bot
          </motion.button>
        </Link>
        <motion.button
          onClick={() => {
            setIsSettingsOpen(true);
            console.log("Opened Settings modal");
          }}
          className="px-8 py-4 bg-gray-600 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Settings
        </motion.button>
        <motion.button
          onClick={() => {
            setIsHowToPlayOpen(true);
            console.log("Opened How to Play modal");
          }}
          className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          How to Play
        </motion.button>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          console.log("Closed Settings modal");
        }}
        settings={settings}
        setSettings={setSettings}
        savedSettings={savedSettings}
        setSavedSettings={setSavedSettings}
        error={error}
        setError={setError}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => {
          setIsHowToPlayOpen(false);
          console.log("Closed How to Play modal");
        }}
      />
    </div>
  );
}
