import React from "react";
import { motion } from "framer-motion";
import { FaQuestion } from "react-icons/fa";
import { IconType } from "react-icons";
import { cardIcons } from "../app/vs-bot/page";

// Define card types
type CardType = "Rock" | "Paper" | "Scissors";

interface CardProps {
  type: CardType | null; // null for face-down cards
  isPlayable?: boolean; // Whether card can be clicked (player hand)
  isOpponent?: boolean; // Opponent cards are face-down unless in play area with showResult
  showResult?: boolean; // For play area reveal
  onClick?: () => void; // Click handler for player cards
  isInPlayArea?: boolean; // Larger size for play area
}

export const Card: React.FC<CardProps> = ({
  type,
  isPlayable = false,
  isOpponent = false,
  showResult = false,
  onClick,
  isInPlayArea = false,
}) => {
  const sizeClass = isInPlayArea ? "w-24 h-36" : "w-16 h-24";
  const cursorClass =
    isPlayable && !showResult ? "cursor-pointer" : "cursor-not-allowed";
  const opacityClass = showResult && isPlayable ? "opacity-50" : "";

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-gray-300 ${sizeClass} ${cursorClass} ${opacityClass}`}
      whileHover={isPlayable && !showResult ? { scale: 1.1, rotate: 2 } : {}}
      whileTap={isPlayable && !showResult ? { scale: 0.95 } : {}}
      onClick={isPlayable && !showResult ? onClick : undefined}
      initial={{ rotateY: 0 }}
      animate={{ rotateY: showResult && type && isInPlayArea ? 360 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {!type ||
      (isInPlayArea && !showResult) ||
      (isOpponent && !isInPlayArea) ? (
        <FaQuestion
          className={`text-${isInPlayArea ? "6xl" : "4xl"} text-gray-500`}
        />
      ) : (
        React.createElement(cardIcons[type], {
          className: `text-${isInPlayArea ? "6xl" : "4xl"} text-gray-700`,
        })
      )}
    </motion.div>
  );
};
