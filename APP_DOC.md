# Wordle Wramble: Detailed Requirements Description for Rebuild

## 1. Overview
"Wordle Wramble" is a web-based spelling game designed to help 2nd-grade students practice their spelling words in an engaging, interactive way. Inspired by Wordle and Scrabble, the app lets users input custom word lists, scrambles the letters, and challenges kids to unscramble them via drag-and-drop. The rebuild prioritizes a polished, kid-friendly look and feel, leveraging the existing code as a reference. It uses pnpm for package management, retains ElevenLabs API for text-to-speech, and includes shareable links without server-side storage. The goal is a fun, visually appealing experience that delights young users and supports sharing with families.

## 2. Target Audience
### Primary Users
2nd-grade students (approximately 7-8 years old).

### Secondary Users
Parents or teachers who input word lists, monitor progress, and share the app.

## 3. Core Features
### 3.1. User Interface (UI)
#### Design Goal
Create a vibrant, playful, and intuitive look and feel that excites kids and feels polished.

#### Requirements
- Use a cohesive color palette (e.g., bright blues, yellows, greens) with rounded edges and smooth animations.
- Incorporate a "wobbly" or whimsical theme to match "Wordle Wramble" (e.g., letters that wiggle slightly).
- Fonts: Bold, large, and kid-friendly fonts (e.g., Comic Sans, Bubblegum Sans) for readability and fun.
- Navigation: Simple, oversized buttons with clear labels (e.g., "Play Now," "Add Words," "See Stars," "Share It").
- Responsiveness: Ensure a seamless experience on desktops and tablets with fluid layouts.

#### Pages
- Home Page: A welcoming "Wordle Wramble" splash screen with big buttons for playing, adding words, viewing progress, and sharing.
- Add Words Page: A colorful form to input words and hints, with a playful "Save" button.
- Game Page: The main play area with scrambled letters, drop zones, and feedback animations.
- Progress Page: A star-themed dashboard showing mastered words and practice areas.

### 3.2. Game Mechanics
#### Word Scrambling
Randomly shuffle letters of each word, presented as draggable tiles with a Scrabble-like aesthetic.

#### Drag-and-Drop
Kids rearrange tiles into drop zones to form the word, with smooth, tactile feedback (e.g., tiles snap into place).

#### Answer Submission
A "Check It" button submits the attempt, styled with a bold, glowing effect.

#### Feedback
- Correct: A celebratory animation (e.g., confetti, tiles bouncing) and a cheerful sound (via ElevenLabs API).
- Incorrect: A gentle shake of the tiles, a red outline, and a soft error sound. Offer retry or hint options.
- Progression: Move to the next word automatically after success, with a brief "Great Job!" transition.

### 3.3. Hint System
#### First Letter Hint
A button (e.g., a glowing lightbulb) reveals the first letter.

#### Contextual Hint
A button (e.g., a speech bubble) shows a definition or plays the word via ElevenLabs API.

#### Look and Feel
Hints should pop up with a playful animation (e.g., sliding in from the side).

### 3.4. Progress Tracking
#### Mastery
Track words mastered (correct within 2 tries, no hints) versus those needing practice.

#### Dashboard
Display progress with star icons—gold for mastered, silver for in-progress—on a starry background.

#### Storage
Save progress in LocalStorage for persistence.

### 3.5. Customization
#### Word Input
A form to add words and optional hints, with a clean, colorful design.

#### Multiple Lists
Support named lists (e.g., "Week 1") switchable via a dropdown or carousel.

#### Storage
Store all lists in LocalStorage, with a clear "Reset" option.

### 3.6. Shareability
#### Shareable Links
Generate URLs embedding word lists (e.g., ?words=cat,dog&hints=Meows,Barks).

#### URL Shortener
Integrate a service like Bitly to shorten long URLs, displaying a copyable short link.

#### Loading
Parse URL parameters on load, saving them to LocalStorage for gameplay.

#### Backup
Offer a JSON download/upload option for manual sharing.

### 3.7. Accessibility
#### Screen Readers
Use semantic HTML and ARIA labels (e.g., "Drag letter C").

#### Contrast
Ensure high-contrast colors (e.g., dark text on bright backgrounds).

#### Keyboard
Support basic navigation (e.g., tab to buttons, space to select).

## 4. Technical Requirements
### 4.1. Front-End
#### Framework
Use Next.js for routing and React structure, rebuilding from scratch with reference to old code.

#### Styling
Use Tailwind CSS for a fresh, utility-driven design—focus on playful classes (e.g., animate-bounce, rounded-full).

#### Package Manager
Use pnpm for efficient dependency management (e.g., pnpm install instead of npm install).

#### Drag-and-Drop
Implement with HTML5 Drag and Drop API, ensuring smooth visuals.

### 4.2. Data Storage
#### LocalStorage
Store word lists and progress as JSON, with a structure like:
Word, hint, mastered status, attempts.

#### No Backend
Rely entirely on client-side storage.

### 4.3. Text-to-Speech
#### API
Use ElevenLabs API for word pronunciation and feedback sounds.

#### Optimization
Cache common audio responses locally (e.g., "Great!") to reduce API calls.

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

### Rewards
Stars or badges for milestones, displayed on the progress page.

### Theme
A "Wramble" mascot (e.g., a wobbly letter) as a guide.

## 6. Deployment
### Platform
Deploy on Vercel via GitHub for auto-updates.

### Process
Use pnpm build and Vercel’s CLI or dashboard.

## 7. Development Notes
### Reference
Use old code for logic (e.g., scrambling, drag-and-drop) but rebuild UI/UX from scratch.

### Focus
Prioritize a delightful look and feel—test with your son for feedback.

### Testing
Ensure animations and audio enhance, not distract.

## 8. User Flow
### Setup
User adds words/hints on "Add Words."

### Share
Clicks "Share It" for a shortened URL.

### Play
Kid unscrambles on "Game" page, gets feedback.

### Review
Views stars on "Progress" page.

## 9. Visual Design
### Theme
Wobbly, playful aesthetic—think bouncy letters, starry skies.

### Tiles
Scrabble-like, colorful (e.g., yellow, blue) with shadows.

### Buttons
Big, rounded, glowing (e.g., green "Check It").

## 10. Name Integration
### Branding
Display "Wordle Wramble" prominently on the home page, with a wiggly or bouncy title animation.