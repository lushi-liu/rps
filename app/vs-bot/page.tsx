"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHandRock,
  FaHandPaper,
  FaHandScissors,
  FaQuestion,
} from "react-icons/fa";
import { IconType } from "react-icons";

// Define card types
type CardType = "Rock" | "Paper" | "Scissors";

// Define game state interface
interface GameState {
  playerHand: CardType[];
  playerDeck: CardType[];
  oppHand: CardType[];
  oppDeck: CardType[];
  playerCard: CardType | null;
  oppCard: CardType | null;
  result: string;
  showResult: boolean;
  playerScore: number;
  oppScore: number;
}

// Base deck: 10 of each card type
const baseDeck: CardType[] = [
  ...Array(10).fill("Rock" as CardType),
  ...Array(10).fill("Paper" as CardType),
  ...Array(10).fill("Scissors" as CardType),
];

// Shuffle array (Fisher-Yates)
const shuffle = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Initialize hand with exactly 22 cards
const drawInitialHand = (deck: CardType[]): [CardType[], CardType[]] => {
  const shuffled = shuffle(deck);
  const hand = shuffled.slice(8); // Last 22 cards
  const remainingDeck = shuffled.slice(0, 8); // First 8 cards
  console.log("Initial hand:", hand, "Deck:", remainingDeck); // Debug
  return [hand, remainingDeck];
};

// Map card types to icons
const cardIcons: Record<CardType, IconType> = {
  Rock: FaHandRock,
  Paper: FaHandPaper,
  Scissors: FaHandScissors,
};

// Count cards in hand for display
const getCardCounts = (hand: CardType[]): Record<CardType, number> => {
  return hand.reduce((counts, card) => {
    counts[card] = (counts[card] || 0) + 1;
    return counts;
  }, {} as Record<CardType, number>);
};

export default function RPSGame() {
  // Initialize decks and hands
  const [playerDeck, playerHand] = drawInitialHand(baseDeck);
  const [oppDeck, oppHand] = drawInitialHand(baseDeck);

  const [state, setState] = useState<GameState>({
    playerHand,
    playerDeck,
    oppHand,
    oppDeck,
    playerCard: null,
    oppCard: null,
    result: "",
    showResult: false,
    playerScore: 0,
    oppScore: 0,
  });

  const playCard = (card: CardType, index: number) => {
    if (!state.playerHand.includes(card) || state.showResult) return;

    // Opponent picks random card from hand
    const oppChoice =
      state.oppHand[Math.floor(Math.random() * state.oppHand.length)];

    // Remove played cards
    const newPlayerHand = state.playerHand.filter((c, i) => i !== index);
    const newOppHand = state.oppHand.filter(
      (c, i) => c !== oppChoice || i !== state.oppHand.indexOf(oppChoice)
    );

    // Draw one card if hand is below 22 and deck isn't empty
    const newPlayerDeck = [...state.playerDeck];
    const newOppDeck = [...state.oppDeck];
    const playerDraw =
      newPlayerHand.length < 22 && newPlayerDeck.length > 0
        ? newPlayerDeck.shift()
        : null;
    const oppDraw =
      newOppHand.length < 22 && newOppDeck.length > 0
        ? newOppDeck.shift()
        : null;

    // Determine result and update scores
    let result = "";
    let playerScore = state.playerScore;
    let oppScore = state.oppScore;
    if (card === oppChoice) {
      result = "Tie!";
    } else if (
      (card === "Rock" && oppChoice === "Scissors") ||
      (card === "Paper" && oppChoice === "Rock") ||
      (card === "Scissors" && oppChoice === "Paper")
    ) {
      result = "You Win!";
      playerScore += 1;
    } else {
      result = "Opponent Wins!";
      oppScore += 1;
    }

    // Show face-down cards
    setState({
      ...state,
      playerCard: card,
      oppCard: oppChoice,
      showResult: false,
    });

    // Reveal cards and result
    setTimeout(() => {
      const updatedPlayerHand = playerDraw
        ? [...newPlayerHand, playerDraw]
        : newPlayerHand;
      const updatedOppHand = oppDraw ? [...newOppHand, oppDraw] : newOppHand;
      console.log(
        "After round - Player hand:",
        updatedPlayerHand,
        "Opponent hand:",
        updatedOppHand
      ); // Debug
      setState({
        playerHand: updatedPlayerHand,
        playerDeck: newPlayerDeck,
        oppHand: updatedOppHand,
        oppDeck: newOppDeck,
        playerCard: card,
        oppCard: oppChoice,
        result,
        showResult: true,
        playerScore,
        oppScore,
      });

      // Reset for next round
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          playerCard: null,
          oppCard: null,
          result: "",
          showResult: false,
        }));
      }, 1500); // Extended delay to show result
    }, 1000); // 1-second delay for reveal
  };

  const restartGame = () => {
    const [newPlayerHand, newPlayerDeck] = drawInitialHand(baseDeck);
    const [newOppHand, newOppDeck] = drawInitialHand(baseDeck);
    setState({
      playerHand: newPlayerHand,
      playerDeck: newPlayerDeck,
      oppHand: newOppHand,
      oppDeck: newOppDeck,
      playerCard: null,
      oppCard: null,
      result: "",
      showResult: false,
      playerScore: 0,
      oppScore: 0,
    });
  };

  // Get card counts for display
  const cardCounts = getCardCounts(state.playerHand);

  return (
    <div className="flex p-4 min-h-screen bg-gradient-to-b from-blue-200 to-gray-300">
      {/* Main Game Area */}
      <div className="flex flex-col flex-1 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Vs Bot: Rock-Paper-Scissors
        </h1>
        {/* Game Board */}
        <div className="bg-gray-100 rounded-lg shadow-lg p-6 flex flex-col gap-6">
          {/* Opponent's Hand (Top) */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Opponents Hand ({state.oppHand.length})
            </h2>
            <div className="flex gap-2 flex-wrap">
              {Array(state.oppHand.length)
                .fill(null)
                .map((_, index) => (
                  <motion.div
                    key={`opp-card-${index}`}
                    className="w-16 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-gray-300"
                  >
                    <FaQuestion className="text-4xl text-gray-500" />
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Play Area (Middle) - Always Visible */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Play Area
            </h2>
            <div className="flex justify-center gap-12 mb-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700">You</p>
                <motion.div
                  className="w-24 h-36 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-gray-300"
                  initial={{ rotateY: 0 }}
                  animate={{
                    rotateY: state.showResult && state.playerCard ? 360 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {state.playerCard && state.showResult ? (
                    React.createElement(cardIcons[state.playerCard], {
                      className: "text-6xl text-gray-700",
                    })
                  ) : (
                    <FaQuestion className="text-6xl text-gray-500" />
                  )}
                </motion.div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700">Opponent</p>
                <motion.div
                  className="w-24 h-36 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-gray-300"
                  initial={{ rotateY: 0 }}
                  animate={{
                    rotateY: state.showResult && state.oppCard ? 360 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {state.oppCard && state.showResult ? (
                    React.createElement(cardIcons[state.oppCard], {
                      className: "text-6xl text-gray-700",
                    })
                  ) : (
                    <FaQuestion className="text-6xl text-gray-500" />
                  )}
                </motion.div>
              </div>
            </div>
            <AnimatePresence>
              {state.result && (
                <motion.p
                  key={state.result} // Ensure animation triggers
                  className="text-2xl font-bold text-gray-800 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {state.result}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Player's Hand (Bottom) */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Your Hand ({state.playerHand.length}){" "}
              <span className="text-sm">
                (Rock x{cardCounts.Rock || 0}, Paper x{cardCounts.Paper || 0},
                Scissors x{cardCounts.Scissors || 0})
              </span>
            </h2>
            <div className="flex gap-2 flex-wrap">
              {state.playerHand.map((card, index) => (
                <motion.div
                  key={`${card}-${index}`} // Unique key for duplicates
                  className={`w-16 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-gray-300 ${
                    state.showResult
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  whileHover={state.showResult ? {} : { scale: 1.1, rotate: 2 }}
                  whileTap={state.showResult ? {} : { scale: 0.95 }}
                  onClick={() => !state.showResult && playCard(card, index)}
                >
                  {React.createElement(cardIcons[card], {
                    className: "text-4xl text-gray-700",
                  })}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Over */}
        {(state.playerHand.length === 0 && state.playerDeck.length === 0) ||
        (state.oppHand.length === 0 && state.oppDeck.length === 0) ? (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-2xl font-bold text-gray-800">
              {state.playerHand.length === 0 && state.playerDeck.length === 0
                ? "Opponent Wins the Game!"
                : "You Win the Game!"}
            </p>
            <p className="text-lg text-gray-700 mt-2">
              Final Score: You {state.playerScore} - {state.oppScore} Opponent
            </p>
            <button
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
              onClick={restartGame}
            >
              Restart Game
            </button>
          </motion.div>
        ) : null}
      </div>

      {/* Score Sidebar */}
      <div className="w-48 bg-gray-800 text-white p-4 rounded-lg shadow-lg ml-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Score</h2>
        <p className="text-lg">You: {state.playerScore}</p>
        <p className="text-lg">Opponent: {state.oppScore}</p>
        <div className="mt-auto">
          <p className="text-sm">Your Deck: {state.playerDeck.length}</p>
          <p className="text-sm">Opponent Deck: {state.oppDeck.length}</p>
        </div>
      </div>
    </div>
  );
}
