"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHandRock, FaHandPaper, FaHandScissors } from "react-icons/fa";
import { IconType } from "react-icons";

// Define card types
type CardType = "Rock" | "Paper" | "Scissors";

// Define game state interface
interface GameState {
  playerDeck: CardType[];
  oppDeck: CardType[];
  playerCard: CardType | null;
  oppCard: CardType | null;
  result: string;
}

// Map card types to icons
const cardIcons: Record<CardType, IconType> = {
  Rock: FaHandRock,
  Paper: FaHandPaper,
  Scissors: FaHandScissors,
};

// Initial deck: 10 of each card type
const initialDeck: CardType[] = [
  ...Array(10).fill("Rock" as CardType),
  ...Array(10).fill("Paper" as CardType),
  ...Array(10).fill("Scissors" as CardType),
];

export default function RPSGame() {
  const [state, setState] = useState<GameState>({
    playerDeck: [...initialDeck],
    oppDeck: [...initialDeck],
    playerCard: null,
    oppCard: null,
    result: "",
  });

  const playCard = (card: CardType) => {
    if (!state.playerDeck.includes(card)) return;

    const oppChoice =
      state.oppDeck[Math.floor(Math.random() * state.oppDeck.length)];
    let result = "";
    if (card === oppChoice) {
      result = "Tie!";
    } else if (
      (card === "Rock" && oppChoice === "Scissors") ||
      (card === "Paper" && oppChoice === "Rock") ||
      (card === "Scissors" && oppChoice === "Paper")
    ) {
      result = "You Win!";
    } else {
      result = "Opponent Wins!";
    }

    setState({
      playerDeck: state.playerDeck.filter(
        (c, i) => c !== card || i !== state.playerDeck.indexOf(card)
      ),
      oppDeck: state.oppDeck.filter(
        (c, i) => c !== oppChoice || i !== state.oppDeck.indexOf(oppChoice)
      ),
      playerCard: card,
      oppCard: oppChoice,
      result,
    });
  };

  const restartGame = () => {
    setState({
      playerDeck: [...initialDeck],
      oppDeck: [...initialDeck],
      playerCard: null,
      oppCard: null,
      result: "",
    });
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gradient-to-b from-blue-100 to-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Vs Bot: Rock-Paper-Scissors
      </h1>
      <div className="flex gap-4 mb-6">
        {(["Rock", "Paper", "Scissors"] as CardType[]).map(
          (type) =>
            state.playerDeck.includes(type) && (
              <motion.div
                key={type}
                className="w-24 h-36 bg-white rounded-lg shadow-lg cursor-pointer flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => playCard(type)}
              >
                {React.createElement(cardIcons[type], {
                  className: "text-6xl text-gray-700",
                })}
              </motion.div>
            )
        )}
      </div>
      <AnimatePresence>
        {state.playerCard && state.oppCard && (
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-center">
                <p className="text-lg font-semibold">You</p>
                <motion.div
                  className="w-24 h-36 bg-white rounded-lg shadow-lg flex items-center justify-center"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {React.createElement(cardIcons[state.playerCard], {
                    className: "text-6xl text-gray-700",
                  })}
                </motion.div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Opponent</p>
                <motion.div
                  className="w-24 h-36 bg-white rounded-lg shadow-lg flex items-center justify-center"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {React.createElement(cardIcons[state.oppCard], {
                    className: "text-6xl text-gray-700",
                  })}
                </motion.div>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{state.result}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-4 text-lg">
        Cards left: {state.playerDeck.length} (You) vs. {state.oppDeck.length}{" "}
        (Opponent)
      </p>
      {(state.playerDeck.length === 0 || state.oppDeck.length === 0) && (
        <div className="mt-6 text-center">
          <p className="text-2xl font-bold text-gray-800">
            {state.playerDeck.length === 0
              ? "Opponent Wins the Game!"
              : "You Win the Game!"}
          </p>
          <button
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
            onClick={restartGame}
          >
            Restart Game
          </button>
        </div>
      )}
    </div>
  );
}
