import Link from "next/link";
import { Header, Footer, NavButton, WordleGame } from "./ui";
import { GameProvider } from "./game/context/GameContext";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <Header />

      <main className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 w-full max-w-2xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <NavButton
            color="blue"
            href="/game"
            icon="🎮"
            ariaLabel="Play the Word Game"
          >
            Play Game
          </NavButton>
          
          <NavButton
            color="green"
            href="/wordlist/create"
            icon="✏️"
            ariaLabel="Add your spelling words"
          >
            Add Words
          </NavButton>
          
          <NavButton
            color="amber"
            href="/progress"
            icon="⭐"
            ariaLabel="See your star progress"
          >
            See Stars
          </NavButton>
          
          <NavButton
            color="purple"
            href="/share"
            icon="🔗"
            ariaLabel="Share your word lists"
          >
            Share It
          </NavButton>
        </div>
      </main>

      <div className="relative w-full max-w-xs md:max-w-md mx-auto mb-8 animate-in fade-in duration-1000 delay-500">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative z-10">
          <GameProvider>
            <WordleGame 
              words={['CAT', 'DOG', 'SUN']} 
              isDemo={true} 
            />
          </GameProvider>
        </div>
      </div>

      <Footer />
    </div>
  );
}
