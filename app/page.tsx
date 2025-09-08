"use client";
import { useState } from "react";
import { motion } from "framer-motion";

// Define card types
type CardType = "Rock" | "Paper" | "Scissors";

// Define game state interface
interface GameState {
  playerDeck: CardType[];
  aiDeck: CardType[];
  playerCard: CardType | null;
  aiCard: CardType | null;
  result: string;
}

// Initial deck: 10 of each card type
const initialDeck: CardType[] = [
  ...Array(10).fill("Rock" as CardType),
  ...Array(10).fill("Paper" as CardType),
  ...Array(10).fill("Scissors" as CardType),
];

export default function RPSGame() {
  const [state, setState] = useState<GameState>({
    playerDeck: [...initialDeck],
    aiDeck: [...initialDeck],
    playerCard: null,
    aiCard: null,
    result: "",
  });

  const playCard = (card: CardType) => {
    // Prevent playing if no cards of this type remain
    if (!state.playerDeck.includes(card)) return;

    // AI picks a random card
    const aiChoice =
      state.aiDeck[Math.floor(Math.random() * state.aiDeck.length)];

    // Determine winner
    let result = "";
    if (card === aiChoice) {
      result = "Tie!";
    } else if (
      (card === "Rock" && aiChoice === "Scissors") ||
      (card === "Paper" && aiChoice === "Rock") ||
      (card === "Scissors" && aiChoice === "Paper")
    ) {
      result = "You Win!";
    } else {
      result = "AI Wins!";
    }

    // Update decks: remove one instance of the played card
    setState({
      playerDeck: state.playerDeck.filter(
        (c, i) => c !== card || i !== state.playerDeck.indexOf(card)
      ),
      aiDeck: state.aiDeck.filter(
        (c, i) => c !== aiChoice || i !== state.aiDeck.indexOf(aiChoice)
      ),
      playerCard: card,
      aiCard: aiChoice,
      result,
    });
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-800">
      <h1 className="text-3xl font-bold mb-6">Rock-Paper-Scissors Card Game</h1>
      <div className="flex gap-4 mb-4">
        {(["Rock", "Paper", "Scissors"] as CardType[]).map(
          (type) =>
            state.playerDeck.includes(type) && (
              <motion.button
                key={type}
                className="p-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => playCard(type)}
              >
                {type}
              </motion.button>
            )
        )}
      </div>
      {state.playerCard && state.aiCard && (
        <div className="mt-4 text-center">
          <p className="text-lg">
            You played:{" "}
            <span className="font-semibold">{state.playerCard}</span>
          </p>
          <p className="text-lg">
            AI played: <span className="font-semibold">{state.aiCard}</span>
          </p>
          <p className="text-xl font-bold mt-2">{state.result}</p>
        </div>
      )}
      <p className="mt-4">
        Cards left: {state.playerDeck.length} (You) vs. {state.aiDeck.length}{" "}
        (AI)
      </p>
      {state.playerDeck.length === 0 || state.aiDeck.length === 0 ? (
        <p className="text-2xl font-bold mt-4">
          {state.playerDeck.length === 0
            ? "AI Wins the Game!"
            : "You Win the Game!"}
        </p>
      ) : null}
    </div>
  );
}
