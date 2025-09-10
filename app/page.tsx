import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-gray-200">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Rock-Paper-Scissors Card Game
      </h1>
      <div className="flex flex-row gap-4">
        {" "}
        <Link href="/vs-bot">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600">
            Play Vs Bot
          </button>
        </Link>
        <Link href="/vs-player">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600">
            Play Vs Player
          </button>
        </Link>
      </div>
    </div>
  );
}
