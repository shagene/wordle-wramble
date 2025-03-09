import { Heading } from "../components/heading";
import { WordleGame } from "../ui";

export default function GamePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-blue-600 dark:text-blue-400">
        Wordle Wramble Game
      </Heading>
      
      <div className="w-full max-w-2xl mx-auto mb-8">
        <WordleGame 
          words={['SPELL', 'LEARN', 'SCHOOL']} 
          hints={['Write out letters in order', 'To gain knowledge', 'Where children study']} 
          isDemo={false}
          onComplete={(word, attempts) => {
            console.log(`Completed word: ${word} in ${attempts} attempts`);
            // In a real implementation, this would save progress to localStorage
          }}
        />
      </div>
    </div>
  );
}
