"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHandRock, FaHandPaper, FaHandScissors } from "react-icons/fa";
import { IconType } from "react-icons";
import { Card } from "../../components/Card";
import Link from "next/link";

// Define card types
type CardType =
  | "Rock"
  | "Paper"
  | "Scissors"
  | "SuperRock"
  | "SuperPaper"
  | "SuperScissors";

// Define game state interface
interface GameState {
  playerHand: CardType[];
  playerDeck: CardType[];
  botHand: CardType[];
  botDeck: CardType[];
  playerCard: CardType | null;
  botCard: CardType | null;
  result: string;
  showResult: boolean;
  playerScore: number;
  botScore: number;
  playerPlayedCards: CardType[];
  botPlayedCards: CardType[];
}

// Base deck: 4 of each regular, 2 of each super
const baseDeck: CardType[] = [
  ...Array(4).fill("Rock" as CardType),
  ...Array(4).fill("Paper" as CardType),
  ...Array(4).fill("Scissors" as CardType),
  ...Array(2).fill("SuperRock" as CardType),
  ...Array(2).fill("SuperPaper" as CardType),
  ...Array(2).fill("SuperScissors" as CardType),
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

// Map card types to icons
export const cardIcons: Record<CardType, IconType> = {
  Rock: FaHandRock,
  Paper: FaHandPaper,
  Scissors: FaHandScissors,
  SuperRock: FaHandRock,
  SuperPaper: FaHandPaper,
  SuperScissors: FaHandScissors,
};

// Count cards for display
const getCardCounts = (cards: CardType[]): Record<CardType, number> => {
  return cards.reduce((counts, card) => {
    counts[card] = (counts[card] || 0) + 1;
    return counts;
  }, {} as Record<CardType, number>);
};

// Bot play logic
const botPlay = (botHand: CardType[]): [CardType, number] => {
  const index = Math.floor(Math.random() * botHand.length);
  return [botHand[index], index];
};

export default function RPSBotGame() {
  const [playerHand, playerDeck] = drawInitialHand(baseDeck);
  const [botHand, botDeck] = drawInitialHand(baseDeck);
  const [state, setState] = useState<GameState>({
    playerHand,
    playerDeck,
    botHand,
    botDeck,
    playerCard: null,
    botCard: null,
    result: "",
    showResult: false,
    playerScore: 0,
    botScore: 0,
    playerPlayedCards: [],
    botPlayedCards: [],
  });

  const playCard = (card: CardType, index: number) => {
    if (!state.playerHand.includes(card) || state.showResult) {
      console.log("Play blocked:", {
        card,
        index,
        showResult: state.showResult,
      });
      return;
    }

    const [botCard, botIndex] = botPlay(state.botHand);
    console.log(`Player played: ${card}, Bot played: ${botCard}`);

    const newPlayerDeck = [...state.playerDeck];
    const newBotDeck = [...state.botDeck];
    const playerDraw =
      state.playerHand.length <= 8 && newPlayerDeck.length > 0
        ? newPlayerDeck.shift()
        : null;
    const botDraw =
      state.botHand.length <= 8 && newBotDeck.length > 0
        ? newBotDeck.shift()
        : null;

    let result = "";
    let playerScore = state.playerScore;
    let botScore = state.botScore;

    if (card === botCard) {
      result = "Tie!";
    } else if (
      (card.includes("Rock") && botCard.includes("Rock")) ||
      (card.includes("Paper") && botCard.includes("Paper")) ||
      (card.includes("Scissors") && botCard.includes("Scissors"))
    ) {
      if (card.includes("Super") && !botCard.includes("Super")) {
        result = "You Win! (Super card bonus)";
        playerScore += 1;
      } else if (!card.includes("Super") && botCard.includes("Super")) {
        result = "Opponent Wins! (Super card bonus)";
        botScore += 1;
      } else {
        result = "Tie!";
      }
    } else {
      if (
        (card.includes("Rock") && botCard.includes("Scissors")) ||
        (card.includes("Paper") && botCard.includes("Rock")) ||
        (card.includes("Scissors") && botCard.includes("Paper"))
      ) {
        result = "You Win!";
        playerScore += 1;
      } else {
        result = "Opponent Wins!";
        botScore += 1;
      }
    }

    setTimeout(() => {
      const updatedPlayerHand = playerDraw
        ? [...state.playerHand.filter((_, i) => i !== index), playerDraw]
        : state.playerHand.filter((_, i) => i !== index);
      const updatedBotHand = botDraw
        ? [...state.botHand.filter((_, i) => i !== botIndex), botDraw]
        : state.botHand.filter((_, i) => i !== botIndex);
      setState((prev) => ({
        ...prev,
        playerHand: updatedPlayerHand,
        playerDeck: newPlayerDeck,
        botHand: updatedBotHand,
        botDeck: newBotDeck,
        playerCard: card,
        botCard,
        result,
        showResult: true,
        playerScore,
        botScore,
        playerPlayedCards: [...prev.playerPlayedCards, card],
        botPlayedCards: [...prev.botPlayedCards, botCard],
      }));

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          playerCard: null,
          botCard: null,
          result: "",
          showResult: false,
        }));
        console.log("Resetting play area for next round");
      }, 1500);
    }, 1000);
  };

  const restartGame = () => {
    const [newPlayerHand, newPlayerDeck] = drawInitialHand(baseDeck);
    const [newBotHand, newBotDeck] = drawInitialHand(baseDeck);
    setState({
      playerHand: newPlayerHand,
      playerDeck: newPlayerDeck,
      botHand: newBotHand,
      botDeck: newBotDeck,
      playerCard: null,
      botCard: null,
      result: "",
      showResult: false,
      playerScore: 0,
      botScore: 0,
      playerPlayedCards: [],
      botPlayedCards: [],
    });
  };

  // Get card counts
  const handCounts = getCardCounts(state.playerHand);
  const playerPlayedCounts = getCardCounts(state.playerPlayedCards);
  const botPlayedCounts = getCardCounts(state.botPlayedCards);

  return (
    <div className="flex p-4 min-h-screen bg-gradient-to-b from-blue-200 to-gray-300">
      {/* Main Game Area */}
      <div className="flex flex-col flex-1 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 text-center">
          Vs Bot: Rock-Paper-Scissors
        </h1>
        <div className="text-center mb-4">
          <Link href="/">
            <button className="px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600">
              Back to Homepage
            </button>
          </Link>
        </div>

        <div className="bg-gray-100 rounded-lg shadow-lg p-6 flex flex-col gap-6">
          {/* Bot's Hand */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Bot&apos;s Hand ({state.botHand.length})
            </h2>
            <div className="flex gap-2 flex-wrap">
              {state.botHand.map((_, index) => (
                <Card key={`bot-card-${index}`} type={null} isOpponent={true} />
              ))}
            </div>
          </div>

          {/* Play Area */}
          <div className="flex flex-col items-center">
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
                <p className="text-lg font-semibold text-gray-700">Bot</p>
                <Card
                  type={state.botCard}
                  showResult={state.showResult}
                  isInPlayArea={true}
                />
              </div>
            </div>
            <div className="h-8 w-full flex justify-center items-center">
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
          </div>

          {/* Player's Hand */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Your Hand ({state.playerHand.length}){" "}
              <span className="text-sm">
                (Rock x{handCounts.Rock || 0}, Paper x{handCounts.Paper || 0},
                Scissors x{handCounts.Scissors || 0}, SuperRock x
                {handCounts.SuperRock || 0}, SuperPaper x
                {handCounts.SuperPaper || 0}, SuperScissors x
                {handCounts.SuperScissors || 0})
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
        (state.botHand.length === 0 && state.botDeck.length === 0) ? (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-2xl font-bold text-gray-800">
              {state.playerScore > state.botScore
                ? "You Win the Game!"
                : state.botScore > state.playerScore
                ? "Bot Wins the Game!"
                : "Game Ends in a Tie!"}
            </p>
            <p className="text-lg text-gray-700 mt-2">
              Final Score: You {state.playerScore} - {state.botScore} Bot
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
        <p className="text-lg">Bot: {state.botScore}</p>
        <div className="mt-4">
          <p className="text-sm">Your Deck: {state.playerDeck.length}</p>
          <p className="text-sm">Bot Deck: {state.botDeck.length}</p>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Your Played Cards</h3>
          <div className="flex flex-row gap-2 mt-2 flex-wrap">
            {[
              "Rock",
              "Paper",
              "Scissors",
              "SuperRock",
              "SuperPaper",
              "SuperScissors",
            ].map((type) => (
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
          <h3 className="text-lg font-semibold">Bot&apos;s Played Cards</h3>
          <div className="flex flex-row gap-2 mt-2 flex-wrap">
            {[
              "Rock",
              "Paper",
              "Scissors",
              "SuperRock",
              "SuperPaper",
              "SuperScissors",
            ].map((type) => (
              <div
                key={`bot-played-${type}`}
                className="flex flex-col items-center"
              >
                <Card type={type as CardType} size="small" />
                <span className="text-sm mt-1">
                  x{botPlayedCounts[type as CardType] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
