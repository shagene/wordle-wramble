# Wordle Wramble: Detailed Requirements Description for Rebuild

## Implementation Status Legend
- ✅ Completed and tested
- 🔄 In progress
- ⏱️ Not started

## 1. Overview 🔄
"Wordle Wramble" is a web-based spelling game designed to help children practice their spelling words in an engaging, interactive way. Inspired by Wordle and Scrabble, the app lets users input custom word lists, scrambles the letters, and challenges kids to unscramble them via drag-and-drop. The rebuild prioritizes a polished, kid-friendly look and feel, leveraging the existing code as a reference. It uses pnpm for package management, retains ElevenLabs API for text-to-speech, and includes shareable links without server-side storage. The goal is a fun, visually appealing experience that delights young users and supports sharing with families. ✅

## 2. Target Audience
### Primary Users ✅
Young children learning to spell, with a focus on elementary school students.

### Secondary Users
Parents or teachers who input word lists, monitor progress, and share the app.

## 3. Core Features
### 3.1. User Interface (UI) 🔄
#### Design Goal ✅
Create a vibrant, playful, and intuitive look and feel that excites kids and feels polished.

#### Requirements 🔄
- ✅ Use a cohesive color palette (e.g., bright blues, yellows, greens) with rounded edges and smooth animations.
- ✅ Incorporate a "wobbly" or whimsical theme to match "Wordle Wramble" (e.g., letters that wiggle slightly).
- ✅ Fonts: Bold, large, and kid-friendly fonts (e.g., Comic Sans, Bubblegum Sans) for readability and fun.
- ✅ Navigation: Simple, oversized buttons with clear labels (e.g., "Play Now," "Add Words," "See Stars," "Share It").
- ✅ Responsiveness: Ensure a seamless experience on desktops and tablets with fluid layouts.

#### Pages 🔄
- ✅ Home Page: A welcoming "Wordle Wramble" splash screen with big buttons for playing, adding words, viewing progress, and sharing.
- 🔄 Add Words Page: A colorful form to input words and hints, with a playful "Save" button.
- ✅ Game Page: The main play area with scrambled letters, drop zones, and feedback animations.
- ✅ Progress Page: A star-themed dashboard showing mastered words, achievements, and progress statistics with consistent card design and uniform icons.

### 3.2. Game Mechanics 🔄
#### Word Scrambling ✅
Randomly shuffle letters of each word, presented as draggable tiles with a Scrabble-like aesthetic. Implemented using Fisher-Yates shuffle algorithm in the WordleGame component.

#### Drag-and-Drop ✅
Kids rearrange tiles into drop zones to form the word, with smooth, tactile feedback. Implemented using HTML5 Drag and Drop API in the WordleGame component.

#### Answer Submission ✅
Automatic submission and checking when all letters are placed, with immediate feedback.

#### Feedback ✅
- Correct: A celebratory animation with a "Great job!" message and automatic progression to the next word.
- Incorrect: A gentle shake of the tiles and reset of the arrangement for another attempt.
- Progression: Move to the next word automatically after success, with a brief delay for celebration.

### 3.3. Hint System ⏱️
#### First Letter Hint
A button (e.g., a glowing lightbulb) reveals the first letter.

#### Contextual Hint
A button (e.g., a speech bubble) shows a definition or plays the word via ElevenLabs API.

#### Look and Feel
Hints should pop up with a playful animation (e.g., sliding in from the side).

### 3.4. Progress Tracking ✅
#### Mastery ✅
Track words mastered (correct within 2 tries, no hints) versus those needing practice. Words completed in 1 attempt earn 3 stars, 2 attempts earn 2 stars, and 3+ attempts earn 1 star.

#### Dashboard ✅
Display progress with star icons—gold for mastered, silver for in-progress—on a starry background. The dashboard shows overall statistics including total stars earned, words mastered, and completion percentage.

#### Storage ✅
Save progress in LocalStorage for persistence, with detailed tracking of attempts, completion dates, and mastery status for each word.

#### Achievement System ✅
Implemented a comprehensive achievement system with gradually changing amber shades:
- First Star: Unlocks when earning the first star
- Star Collector: Unlocks at 10 stars
- Star Hoarder: Unlocks at 25 stars
- Star Champion: Unlocks at 50 stars
- Star Master: Unlocks at 100 stars
- Wordle Wrambler: Unlocks at 200 stars
- Perfect Speller: Unlocks when completing 5 words on the first try
- Wordle Wizard: Unlocks when mastering 20 different words

### 3.5. Customization 🔄
#### Word Input
A form to add words and optional hints, with a clean, colorful design.

#### Multiple Lists
Support named lists (e.g., "Week 1") switchable via a dropdown or carousel.

#### Storage
Store all lists in LocalStorage, with a clear "Reset" option.

### 3.6. Shareability ⏱️
#### Shareable Links
Generate URLs embedding word lists (e.g., ?words=cat,dog&hints=Meows,Barks).

#### URL Shortener
Integrate a service like Bitly to shorten long URLs, displaying a copyable short link.

#### Loading
Parse URL parameters on load, saving them to LocalStorage for gameplay.

#### Backup
Offer a JSON download/upload option for manual sharing.

### 3.7. Accessibility ✅
#### Screen Readers ✅
Use semantic HTML and ARIA labels (e.g., "Drag letter C").

#### Contrast ✅
Ensure high-contrast colors (e.g., dark text on bright backgrounds).

#### Keyboard ✅
Support basic navigation (e.g., tab to buttons, space to select).

## 4. Technical Requirements
### 4.1. Front-End 🔄
#### Framework ✅
✅ Use Next.js for routing and React structure, rebuilding from scratch with reference to old code.

#### Styling ✅
✅ Use Tailwind CSS for a fresh, utility-driven design—focus on playful classes (e.g., animate-bounce, rounded-full).

#### Package Manager ✅
✅ Use pnpm for efficient dependency management (e.g., pnpm install instead of npm install).

#### Drag-and-Drop ✅
Implemented with HTML5 Drag and Drop API, ensuring smooth visuals in the WordleGame component.

### 4.2. Data Storage
#### LocalStorage
Store word lists and progress as JSON, with a structure like:
Word, hint, mastered status, attempts.

#### No Backend
Rely entirely on client-side storage.

### 4.3. Text-to-Speech ✅
#### API
Use ElevenLabs API for word pronunciation and feedback sounds.

#### Voice Selection 🔄
Implemented voice selection feature allowing users to choose their preferred voice from available ElevenLabs voices. The selected voice is stored in localStorage for persistence across sessions.

#### Optimization
Cache common audio responses locally (e.g., "Great!") to reduce API calls.

#### Error Handling
Implemented robust error handling for audio playback with fallback to browser's Speech Synthesis API when ElevenLabs API is unavailable or for shorter words.

#### Persistent Audio Element
Fixed audio playback interruption issues by using a persistent audio element that remains in the DOM throughout component lifecycle, preventing the "The play() request was interrupted because the media was removed from the document" error.

### 4.4. URL and Sharing
#### Generation
Build URLs with query parameters from the current word list.

#### Shortening
Call a URL shortener API (e.g., Bitly) to create shareable links.

#### Parsing
Extract parameters on load to populate LocalStorage.

### 4.5. Audio
#### Feedback
Use ElevenLabs for success/error sounds, with a mute toggle.

#### Source
Supplement with royalty-free local audio files if needed.

### 4.6. Performance
#### Efficiency
Leverage Next.js code splitting and pnpm’s fast installs.

#### Offline
Ensure functionality post-load via LocalStorage.

### 4.7. Security
#### Data
Keep all data local; warn users not to share sensitive info in URLs.

## 5. Additional Features (Optional)
### Timer
A countdown per word with a playful clock graphic.

### Rewards ✅
Stars or badges for milestones, displayed on the progress page. Implemented an achievement system with 8 different achievements that unlock based on player progress, each with unique icons and gradually changing amber shades.

### Theme
A "Wramble" mascot (e.g., a wobbly letter) as a guide.

## 6. Deployment
### Platform
Deploy on Vercel via GitHub for auto-updates.

### Process
Use pnpm build and Vercel’s CLI or dashboard.

## 7. Development Notes

### Game Component Implementation ✅
- Created a reusable WordleGame component that can be used both for demo purposes and full gameplay
- Implemented core game mechanics including word scrambling, drag-and-drop letter placement, and answer validation
- Added visual feedback for correct/incorrect answers and automatic progression to next words
- Designed the component to be configurable with different word lists, hints, and demo/full-game modes
- Placed in the app/ui directory following project organization standards

### Reference
Use old code for logic (e.g., scrambling, drag-and-drop) but rebuild UI/UX from scratch.

## 12. Component Organization

### Custom UI Components ✅
- Created a separate directory structure (`app/ui`) for custom UI components
- Implemented Header and Footer as reusable components
- Used proper naming conventions (PascalCase) for component files
- Used named exports with barrel pattern through index.ts
- Added JSDoc comments for better documentation

### Code Structure ✅
- Followed Airbnb Style Guide for component structure
- Used arrow function pattern with const declarations
- Implemented named exports instead of default exports
- Centralized exports through index.ts barrel files
- Separated concerns between layout, header, and footer components

## 11. Testing Requirements
Each feature must have passing tests before being marked as complete. Tests should cover:

### Unit Tests
- Component rendering
- Function behavior
- State management
- Event handling

### Integration Tests
- Component interactions
- Route navigation
- LocalStorage operations
- API interactions (ElevenLabs)

### End-to-End Tests
- User flows (adding words, playing the game, checking progress)
- Responsive design across screen sizes
- Accessibility compliance

### Test Tools
- Jest for unit and integration tests
- React Testing Library for component tests
- Playwright for end-to-end tests
- Axe for accessibility testing



### Focus
Prioritize a delightful look and feel—test with children for feedback.

### Testing ⏱️
Ensure animations and audio enhance, not distract.

## 8. User Flow
### Setup
User adds words/hints on "Add Words."

### Share
Clicks "Share It" for a shortened URL.

### Play
Child unscrambles on "Game" page, gets feedback.

### Review
Views stars on "Progress" page.

## 9. Visual Design
### Theme
Wobbly, playful aesthetic—think bouncy letters, starry skies.

### Tiles
Scrabble-like, colorful (e.g., yellow, blue) with shadows.

### Buttons ✅
Big, rounded, glowing (e.g., green "Check It").

## 10. User Test Items ⏱️
- [ ] Click through each button on the home page.
- [ ] Add spelling words into the form (a few example words).
- [ ] Try playing the game with at least one list.
- [ ] Ensure words are properly scrambled and draggable.
- [ ] Check if progress tracking works.
- [ ] Test share functionality to create a link.
- [ ] Open the link in a private window to ensure the list loads.
- [ ] Ensure it works for children at appropriate eye level and cognitive stage.

## 11. Name Integration ✅
### Branding
Display "Wordle Wramble" prominently on the home page, with a wiggly or bouncy title animation.