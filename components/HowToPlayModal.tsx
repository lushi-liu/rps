import React from "react";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">How to Play</h2>
        <div className="space-y-3 text-gray-700 text-base">
          <p>
            Rock-Paper-Scissors is a card-based game where you compete against a
            bot to score the most points by playing cards from your hand.
          </p>
          <h3 className="text-lg font-semibold">Rules</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Regular Cards</strong>: Rock beats Scissors, Scissors
              beats Paper, Paper beats Rock.
            </li>
            <li>
              <strong>Super Cards</strong>: Super Rock, Paper, and Scissors beat
              their regular versions (e.g., Super Rock beats Rock). Same-type,
              same-strength cards tie.
            </li>
          </ul>
          <h3 className="text-lg font-semibold">Game Setup</h3>
          <p>
            In Settings, choose your deck (e.g., 4 Rock, 2 Super Paper) and hand
            size (up to deck size). Your hand is drawn from the shuffled deck.
            Draw a new card after each round if cards remain.
          </p>
          <h3 className="text-lg font-semibold">Open-Hand Mode</h3>
          <p>
            Enable Open-Hand Play in Settings to see the bot’s hand for
            strategic play.
          </p>
          <h3 className="text-lg font-semibold">Gameplay</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Play a card from your hand; the bot plays one randomly.</li>
            <li>
              Win (+1 point), lose (bot +1 point), or tie (no points) after a
              short delay.
            </li>
            <li>Track scores and cards in the sidebar.</li>
            <li>Game ends when hand and deck are empty; highest score wins.</li>
          </ul>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
