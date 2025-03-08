import { Heading } from "../components/heading";

export default function GamePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-blue-600 dark:text-blue-400">
        Game Page
      </Heading>
      <p className="text-xl text-center max-w-2xl mb-8">
        This is where the word scrambling game will be implemented.
      </p>
    </div>
  );
}
