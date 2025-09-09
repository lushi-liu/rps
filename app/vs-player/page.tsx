"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHandRock, FaHandPaper, FaHandScissors } from "react-icons/fa";
import { IconType } from "react-icons";
import { Card } from "../../components/Card";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

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
  roomId: string | null;
  gameStarted: boolean;
  opponentConnected: boolean;
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

export default function RPSPvPGame() {
  const [playerHand, playerDeck] = drawInitialHand(baseDeck);
  const [oppHand, oppDeck] = drawInitialHand(baseDeck); // Initial placeholder, updated via socket
  const [state, setState] = useState<GameState>({
    playerHand,
    playerDeck,
    oppHand: Array(8).fill(null), // Start with 8 face-down cards
    oppDeck,
    playerCard: null,
    oppCard: null,
    result: "",
    showResult: false,
    playerScore: 0,
    oppScore: 0,
    playerPlayedCards: [],
    oppPlayedCards: [],
    roomId: null,
    gameStarted: false,
    opponentConnected: false,
  });
  const [roomInput, setRoomInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const socketInstance = io({ path: "/api/socket" });
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to server:", socketInstance.id);
    });

    socketInstance.on("player-joined", ({ players }: { players: number }) => {
      setState((prev) => ({
        ...prev,
        opponentConnected: players === 2,
        gameStarted: players === 2,
      }));
      setError("");
    });

    socketInstance.on("room-full", ({ message }: { message: string }) => {
      setError(message);
      setState((prev) => ({ ...prev, roomId: null, gameStarted: false }));
    });

    socketInstance.on(
      "opponent-play",
      ({ card, index }: { card: CardType; index: number }) => {
        setState((prev) => ({
          ...prev,
          oppCard: card,
          oppHand: prev.oppHand.filter((_, i) => i !== index),
        }));
        // Trigger reveal if both players have played
        if (state.playerCard) {
          revealResult(state.playerCard, card);
        }
      }
    );

    socketInstance.on("opponent-disconnected", () => {
      setError("Opponent disconnected. Please restart or join another room.");
      setState((prev) => ({
        ...prev,
        opponentConnected: false,
        gameStarted: false,
      }));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [state.playerCard]); // Re-run when playerCard changes to check for reveal

  const joinRoom = () => {
    if (!roomInput.trim()) {
      setError("Please enter a room ID.");
      return;
    }
    setError("");
    setState((prev) => ({ ...prev, roomId: roomInput }));
    socket?.emit("join-room", roomInput);
  };

  const playCard = (card: CardType, index: number) => {
    if (
      !state.playerHand.includes(card) ||
      state.showResult ||
      !state.gameStarted
    )
      return;
    socket?.emit("play-card", { roomId: state.roomId, card, index });
    setState((prev) => ({
      ...prev,
      playerCard: card,
      playerHand: prev.playerHand.filter((_, i) => i !== index),
    }));
    // Wait for opponent-play event to reveal
  };

  const revealResult = (playerCard: CardType, oppCard: CardType) => {
    // Draw cards if possible
    const newPlayerDeck = [...state.playerDeck];
    const newOppDeck = [...state.oppDeck];
    const playerDraw =
      state.playerHand.length < 8 && newPlayerDeck.length > 0
        ? newPlayerDeck.shift()
        : null;
    const oppDraw =
      state.oppHand.length < 8 && newOppDeck.length > 0
        ? newOppDeck.shift()
        : null;

    // Determine result and update scores
    let result = "";
    let playerScore = state.playerScore;
    let oppScore = state.oppScore;

    if (playerCard === oppCard) {
      result = "Tie!";
    } else if (
      (playerCard.includes("Rock") && oppCard.includes("Rock")) ||
      (playerCard.includes("Paper") && oppCard.includes("Paper")) ||
      (playerCard.includes("Scissors") && oppCard.includes("Scissors"))
    ) {
      if (playerCard.includes("Super") && !oppCard.includes("Super")) {
        result = "You Win! (Super card bonus)";
        playerScore += 1;
      } else if (!playerCard.includes("Super") && oppCard.includes("Super")) {
        result = "Opponent Wins! (Super card bonus)";
        oppScore += 1;
      } else {
        result = "Tie!";
      }
    } else {
      if (
        (playerCard.includes("Rock") && oppCard.includes("Scissors")) ||
        (playerCard.includes("Paper") && oppCard.includes("Rock")) ||
        (playerCard.includes("Scissors") && oppCard.includes("Paper"))
      ) {
        result = "You Win!";
        playerScore += 1;
      } else {
        result = "Opponent Wins!";
        oppScore += 1;
      }
    }

    setTimeout(() => {
      const updatedPlayerHand = playerDraw
        ? [...state.playerHand, playerDraw]
        : state.playerHand;
      const updatedOppHand = oppDraw
        ? [...state.oppHand, oppDraw]
        : state.oppHand;
      setState((prev) => ({
        ...prev,
        playerHand: updatedPlayerHand,
        playerDeck: newPlayerDeck,
        oppHand: updatedOppHand,
        oppDeck: newOppDeck,
        result,
        showResult: true,
        playerScore,
        oppScore,
        playerPlayedCards: [...prev.playerPlayedCards, playerCard],
        oppPlayedCards: [...prev.oppPlayedCards, oppCard],
      }));

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          playerCard: null,
          oppCard: null,
          result: "",
          showResult: false,
        }));
      }, 1500);
    }, 1000);
  };

  const restartGame = () => {
    const [newPlayerHand, newPlayerDeck] = drawInitialHand(baseDeck);
    const [newOppHand, newOppDeck] = drawInitialHand(baseDeck);
    setState({
      playerHand: newPlayerHand,
      playerDeck: newPlayerDeck,
      oppHand: Array(8).fill(null),
      oppDeck: newOppDeck,
      playerCard: null,
      oppCard: null,
      result: "",
      showResult: false,
      playerScore: 0,
      oppScore: 0,
      playerPlayedCards: [],
      oppPlayedCards: [],
      roomId: null,
      gameStarted: false,
      opponentConnected: false,
    });
    setRoomInput("");
    socket?.disconnect();
    setSocket(null);
  };

  // Get card counts
  const handCounts = getCardCounts(state.playerHand);
  const playerPlayedCounts = getCardCounts(state.playerPlayedCards);
  const oppPlayedCounts = getCardCounts(state.oppPlayedCards);

  return (
    <div className="flex p-4 min-h-screen bg-gradient-to-b from-blue-200 to-gray-300">
      {/* Main Game Area */}
      <div className="flex flex-col flex-1 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 text-center">
          Vs Player: Rock-Paper-Scissors
        </h1>
        <div className="text-center mb-4">
          <Link href="/">
            <button className="px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600">
              Back to Homepage
            </button>
          </Link>
        </div>

        {!state.gameStarted && (
          <div className="bg-gray-100 rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Join a Room
            </h2>
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="Enter Room ID"
              className="p-2 border rounded-lg text-gray-700 mb-4"
            />
            <button
              onClick={joinRoom}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
            >
              Join Room
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {state.opponentConnected && !state.gameStarted && (
              <p className="text-gray-700 mt-2">Waiting for opponent...</p>
            )}
          </div>
        )}

        {state.gameStarted && (
          <>
            <div className="bg-gray-100 rounded-lg shadow-lg p-6 flex flex-col gap-6">
              {/* Opponent's Hand */}
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-700">
                  Opponent&apos;s Hand ({state.oppHand.length})
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {state.oppHand.map((_, index) => (
                    <Card
                      key={`opp-card-${index}`}
                      type={null}
                      isOpponent={true}
                    />
                  ))}
                </div>
              </div>

              {/* Play Area */}
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
                    <p className="text-lg font-semibold text-gray-700">
                      Opponent
                    </p>
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

              {/* Player's Hand */}
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-700">
                  Your Hand ({state.playerHand.length}){" "}
                  <span className="text-sm">
                    (Rock x{handCounts.Rock || 0}, Paper x
                    {handCounts.Paper || 0}, Scissors x
                    {handCounts.Scissors || 0}, SuperRock x
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
                  Final Score: You {state.playerScore} - {state.oppScore}{" "}
                  Opponent
                </p>
                <button
                  className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
                  onClick={restartGame}
                >
                  Restart Game
                </button>
              </motion.div>
            ) : null}
          </>
        )}
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
          <h3 className="text-lg font-semibold">
            Opponent&apos;s Played Cards
          </h3>
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
