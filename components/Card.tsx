import React from "react";
import { motion } from "framer-motion";
import { FaQuestion } from "react-icons/fa";
import { cardIcons } from "../app/vs-bot/page";

// Define card types
type CardType =
  | "Rock"
  | "Paper"
  | "Scissors"
  | "SuperRock"
  | "SuperPaper"
  | "SuperScissors";

interface CardProps {
  type: CardType | null;
  isPlayable?: boolean;
  isOpponent?: boolean;
  showResult?: boolean;
  onClick?: () => void;
  isInPlayArea?: boolean;
  size?: "small" | "default";
}

export const Card: React.FC<CardProps> = ({
  type,
  isPlayable = false,
  isOpponent = false,
  showResult = false,
  onClick,
  isInPlayArea = false,
  size = "default",
}) => {
  console.log(
    `Rendering Card: type=${type}, isOpponent=${isOpponent}, isPlayable=${isPlayable}, showResult=${showResult}, isInPlayArea=${isInPlayArea}, size=${size}`
  );

  const sizeClass = isInPlayArea
    ? "w-24 h-36"
    : size === "small"
    ? "w-12 h-16"
    : "w-16 h-24";
  const iconSizeClass = isInPlayArea
    ? "text-6xl"
    : size === "small"
    ? "text-3xl"
    : "text-4xl";
  const cursorClass =
    isPlayable && !showResult ? "cursor-pointer" : "cursor-not-allowed";
  const opacityClass = showResult && isPlayable ? "opacity-50" : "";
  const iconColorClass = type?.includes("Super")
    ? "text-yellow-500"
    : "text-gray-700";

  // Show placeholder only if type is null (for opponent when openHand=false) or in play area before reveal
  const showPlaceholder = !type || (isInPlayArea && !showResult);

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
      {showPlaceholder ? (
        <FaQuestion className={`${iconSizeClass} text-gray-500`} />
      ) : (
        React.createElement(cardIcons[type as CardType], {
          className: `${iconSizeClass} ${iconColorClass}`,
        })
      )}
    </motion.div>
  );
};
