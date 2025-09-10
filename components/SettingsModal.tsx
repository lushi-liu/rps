import React from "react";

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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  savedSettings: GameSettings | null;
  setSavedSettings: React.Dispatch<React.SetStateAction<GameSettings | null>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  savedSettings,
  setSavedSettings,
  error,
  setError,
}) => {
  // Default settings for reset
  const defaultSettings: GameSettings = {
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
  };

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
    setSavedSettings(settings);
    console.log("Saved to localStorage:", settings);
    onClose();
  };

  const resetToDefault = () => {
    setSettings(defaultSettings);
    setError("");
    console.log("Reset to default settings:", defaultSettings);
  };

  const cancelSettings = () => {
    if (savedSettings) {
      setSettings(savedSettings);
      console.log(
        "Cancelled changes, reverted to saved settings:",
        savedSettings
      );
    } else {
      setSettings(defaultSettings);
      console.log(
        "No saved settings, reverted to default settings:",
        defaultSettings
      );
    }
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Game Settings</h2>
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
            onClick={resetToDefault}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600"
          >
            Reset to Default
          </button>
          <button
            onClick={cancelSettings}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
