import { Heading } from "../components/heading";

/**
 * Header component for the application
 * Displays the title and subtitle of the Wordle Wramble app
 */
const Header = () => {
  return (
    <header className="animate-in fade-in slide-in-from-top-4 duration-1000 my-8">
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-5xl md:text-7xl mb-4 text-blue-600 dark:text-blue-400">
        <span className="inline-block hover:animate-bounce transition-transform duration-300">W</span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-100">o</span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-150">r</span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-200">d</span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-250">l</span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-300">e</span>
        <span className="mx-4"></span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-350">W</span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-400">r</span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-450">a</span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-500">m</span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-550">b</span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-600">l</span>
        <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-650">e</span>
      </Heading>
      <p className="text-xl text-blue-800 dark:text-blue-300 mb-8 max-w-2xl mx-auto font-[family-name:var(--font-bubblegum-sans)]">
        A fun spelling game for kids to practice and master their words!  
      </p>
    </header>
  );
};

export { Header };
