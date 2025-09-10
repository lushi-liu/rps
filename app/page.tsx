"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-200 to-gray-300">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Rock-Paper-Scissors Card Game
      </h1>
      <div className="flex gap-4">
        <Link href={`/vs-bot?${getQueryString()}`}>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600">
            Play vs Bot
          </button>
        </Link>
        <button
          onClick={() => {
            setIsSettingsOpen(true);
            console.log("Opened Settings modal");
          }}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-600"
        >
          Settings
        </button>
        <button
          onClick={() => {
            setIsHowToPlayOpen(true);
            console.log("Opened How to Play modal");
          }}
          className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600"
        >
          How to Play
        </button>
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
