import Image from "next/image";
import Link from "next/link";
import { Button } from "./components/button";
import { Header, Footer } from "./ui";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <Header />

      <main className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 w-full max-w-2xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <Button
            color="blue"
            href="/game"
            className="font-[family-name:var(--font-bubblegum-sans)] text-xl h-20 shadow-lg shadow-blue-200 dark:shadow-blue-900 hover:scale-105 transition-transform duration-300"
            aria-label="Play the Word Game"
          >
            <span className="flex items-center justify-center gap-2">
              🎮 Play Game
            </span>
          </Button>
          
          <Button
            color="green"
            href="/wordlist/create"
            className="font-[family-name:var(--font-bubblegum-sans)] text-xl h-20 shadow-lg shadow-green-200 dark:shadow-green-900 hover:scale-105 transition-transform duration-300"
            aria-label="Add your spelling words"
          >
            <span className="flex items-center justify-center gap-2">
              ✏️ Add Words
            </span>
          </Button>
          
          <Button
            color="amber"
            href="/progress"
            className="font-[family-name:var(--font-bubblegum-sans)] text-xl h-20 shadow-lg shadow-yellow-200 dark:shadow-yellow-900 hover:scale-105 transition-transform duration-300"
            aria-label="See your star progress"
          >
            <span className="flex items-center justify-center gap-2">
              ⭐ See Stars
            </span>
          </Button>
          
          <Button
            color="purple"
            href="/share"
            className="font-[family-name:var(--font-bubblegum-sans)] text-xl h-20 shadow-lg shadow-purple-200 dark:shadow-purple-900 hover:scale-105 transition-transform duration-300"
            aria-label="Share your word lists"
          >
            <span className="flex items-center justify-center gap-2">
              🔗 Share It
            </span>
          </Button>
        </div>
      </main>

      <div className="relative w-full max-w-xs md:max-w-md mx-auto mb-8 animate-in fade-in duration-1000 delay-500">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative z-10">
          <Image 
            src="/letter-tiles.png" 
            alt="Letter tiles" 
            width={400} 
            height={200}
            className="mx-auto rounded-lg shadow-xl"
            priority
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
