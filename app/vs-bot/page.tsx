"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHandRock, FaHandPaper, FaHandScissors } from "react-icons/fa";
import { IconType } from "react-icons";
import { Card } from "../../components/Card";

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
  playerPlayedCards: CardType[];
  oppPlayedCards: CardType[];
}

// Base deck: 4 of each card type
const baseDeck: CardType[] = [
  ...Array(4).fill("Rock" as CardType),
  ...Array(4).fill("Paper" as CardType),
  ...Array(4).fill("Scissors" as CardType),
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

// Initialize hand with exactly 8 cards
const drawInitialHand = (deck: CardType[]): [CardType[], CardType[]] => {
  const shuffled = shuffle(deck);
  const hand = shuffled.slice(0, 8);
  const remainingDeck = shuffled.slice(8);
  console.log("Initial hand:", hand, "Deck:", remainingDeck); // Debug
  return [hand, remainingDeck];
};

// Map card types to icons (exported for Card component)
export const cardIcons: Record<CardType, IconType> = {
  Rock: FaHandRock,
  Paper: FaHandPaper,
  Scissors: FaHandScissors,
};

// Count cards for display (used for hand and played cards)
const getCardCounts = (cards: CardType[]): Record<CardType, number> => {
  return cards.reduce((counts, card) => {
    counts[card] = (counts[card] || 0) + 1;
    return counts;
  }, {} as Record<CardType, number>);
};

export default function RPSGame() {
  // Initialize decks and hands
  const [playerHand, playerDeck] = drawInitialHand(baseDeck);
  const [oppHand, oppDeck] = drawInitialHand(baseDeck);

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
    playerPlayedCards: [],
    oppPlayedCards: [],
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

    // Draw one card if hand is below 8 and deck isn't empty
    const newPlayerDeck = [...state.playerDeck];
    const newOppDeck = [...state.oppDeck];
    const playerDraw =
      newPlayerHand.length < 8 && newPlayerDeck.length > 0
        ? newPlayerDeck.shift()
        : null;
    const oppDraw =
      newOppHand.length < 8 && newOppDeck.length > 0
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

    // Show face-down cards (no played cards update yet)
    setState({
      ...state,
      playerCard: card,
      oppCard: oppChoice,
      showResult: false,
    });

    // Reveal cards and result, update played cards
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
        playerPlayedCards: [...state.playerPlayedCards, card], // Update here
        oppPlayedCards: [...state.oppPlayedCards, oppChoice], // Update here
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
      playerPlayedCards: [],
      oppPlayedCards: [],
    });
  };

  // Get card counts for hand and played cards
  const handCounts = getCardCounts(state.playerHand);
  const playerPlayedCounts = getCardCounts(state.playerPlayedCards);
  const oppPlayedCounts = getCardCounts(state.oppPlayedCards);

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
              Opponent&apos;s Hand ({state.oppHand.length})
            </h2>
            <div className="flex gap-2 flex-wrap">
              {Array(state.oppHand.length)
                .fill(null)
                .map((_, index) => (
                  <Card
                    key={`opp-card-${index}`}
                    type={null}
                    isOpponent={true}
                  />
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
                <Card
                  type={state.playerCard}
                  showResult={state.showResult}
                  isInPlayArea={true}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700">Opponent</p>
                <Card
                  type={state.oppCard}
                  showResult={state.showResult}
                  isInPlayArea={true}
                />
              </div>
            </div>
            <AnimatePresence>
              {state.result && (
                <motion.p
                  key={state.result}
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
                (Rock x{handCounts.Rock || 0}, Paper x{handCounts.Paper || 0},
                Scissors x{handCounts.Scissors || 0})
              </span>
            </h2>
            <div className="flex gap-2 flex-wrap">
              {state.playerHand.map((card, index) => (
                <Card
                  key={`${card}-${index}`}
                  type={card}
                  isPlayable={true}
                  showResult={state.showResult}
                  onClick={() => playCard(card, index)}
                />
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
              {state.playerScore > state.oppScore
                ? "You Win the Game!"
                : state.oppScore > state.playerScore
                ? "Opponent Wins the Game!"
                : "Game Ends in a Tie!"}
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
        <div className="mt-4">
          <p className="text-sm">Your Deck: {state.playerDeck.length}</p>
          <p className="text-sm">Opponent Deck: {state.oppDeck.length}</p>
        </div>
        {/* Played Cards History */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Your Played Cards</h3>
          <div className="flex flex-row gap-2 mt-2">
            {["Rock", "Paper", "Scissors"].map((type) => (
              <div
                key={`player-played-${type}`}
                className="flex flex-col items-center"
              >
                <Card type={type as CardType} size="small" />
                <span className="text-sm mt-1">
                  x{playerPlayedCounts[type as CardType] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">
            Opponent&apos;s Played Cards
          </h3>
          <div className="flex flex-row gap-2 mt-2">
            {["Rock", "Paper", "Scissors"].map((type) => (
              <div
                key={`opp-played-${type}`}
                className="flex flex-col items-center"
              >
                <Card type={type as CardType} size="small" />
                <span className="text-sm mt-1">
                  x{oppPlayedCounts[type as CardType] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
