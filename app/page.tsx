"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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
  const [settings, setSettings] = useState<GameSettings>({
    handSize: 8,
    deck: {
      regularRock: 4,
      regularPaper: 4,
      regularScissors: 4,
      superRock: 2,
      superPaper: 2,
      superScissors: 2,
    },
    openHand: false,
  });
  const [error, setError] = useState("");

  // Load settings from local storage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        handSize: Math.max(1, parsed.handSize || 8),
        deck: {
          regularRock: Math.max(0, parsed.deck?.regularRock || 4),
          regularPaper: Math.max(0, parsed.deck?.regularPaper || 4),
          regularScissors: Math.max(0, parsed.deck?.regularScissors || 4),
          superRock: Math.max(0, parsed.deck?.superRock || 2),
          superPaper: Math.max(0, parsed.deck?.superPaper || 2),
          superScissors: Math.max(0, parsed.deck?.superScissors || 2),
        },
        openHand: parsed.openHand || false,
      });
    }
  }, []);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setSettings((prev) => ({ ...prev, [name]: checked }));
    } else {
      const numValue = parseInt(value) || 0;
      if (name.startsWith("deck.")) {
        const deckKey = name.split(".")[1] as keyof GameSettings["deck"];
        setSettings((prev) => ({
          ...prev,
          deck: { ...prev.deck, [deckKey]: Math.max(0, numValue) },
        }));
      } else {
        setSettings((prev) => ({ ...prev, [name]: Math.max(1, numValue) }));
      }
    }
    setError("");
  };

  const saveSettings = () => {
    const totalDeckSize = Object.values(settings.deck).reduce(
      (sum, count) => sum + count,
      0
    );
    if (totalDeckSize === 0) {
      setError("Deck cannot be empty.");
      return;
    }
    if (settings.handSize > totalDeckSize) {
      setError(
        `Hand size (${settings.handSize}) cannot exceed total deck size (${totalDeckSize}).`
      );
      return;
    }
    localStorage.setItem("gameSettings", JSON.stringify(settings));
    setIsSettingsOpen(false);
  };

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
        Rock-Paper-Scissors
      </h1>
      <div className="flex gap-4">
        <Link href={`/vs-bot?${getQueryString()}`}>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600">
            Play vs Bot
          </button>
        </Link>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-600"
        >
          Settings
        </button>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Game Settings
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold">
                  Hand Size
                </label>
                <input
                  type="number"
                  name="handSize"
                  value={settings.handSize}
                  onChange={handleSettingsChange}
                  min="1"
                  className="w-full p-2 border rounded-lg text-gray-700"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">
                  Deck Composition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "regularRock",
                    "regularPaper",
                    "regularScissors",
                    "superRock",
                    "superPaper",
                    "superScissors",
                  ].map((key) => (
                    <div key={key}>
                      <label className="block text-sm text-gray-600 capitalize">
                        {key.replace("regular", "").replace("super", "Super ")}
                      </label>
                      <input
                        type="number"
                        name={`deck.${key}`}
                        value={settings.deck[key as keyof GameSettings["deck"]]}
                        onChange={handleSettingsChange}
                        min="0"
                        className="w-full p-2 border rounded-lg text-gray-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center text-gray-700 font-semibold">
                  <input
                    type="checkbox"
                    name="openHand"
                    checked={settings.openHand}
                    onChange={handleSettingsChange}
                    className="mr-2"
                  />
                  Open-Hand Play (See Bot&apos;s Hand)
                </label>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={saveSettings}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
