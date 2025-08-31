import React, { createContext, useContext, useState, useCallback } from 'react';
import { Flashcard, Deck } from '../types';

interface FlashcardsContextType {
  flashcards: Flashcard[];
  decks: Deck[];
  addFlashcard: (flashcard: Omit<Flashcard, 'id' | 'createdAt'>) => void;
  updateFlashcard: (id: string, flashcard: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  addDeck: (deck: Omit<Deck, 'id' | 'totalCards' | 'dueCards'>) => void;
  updateDeck: (id: string, deck: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  getFlashcardsByDeck: (deckId: string) => Flashcard[];
  getDueFlashcards: (deckId?: string) => Flashcard[];
  updateFlashcardReview: (id: string, difficulty: 'again' | 'hard' | 'good' | 'easy') => void;
}

const FlashcardsContext = createContext<FlashcardsContextType | undefined>(undefined);

// Sample data for testing
const sampleDeck: Deck = {
  id: '1',
  title: 'JavaScript Fundamentals',
  description: 'Core JavaScript concepts and syntax',
  totalCards: 3,
  dueCards: 2,
  lastReviewed: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
};

const sampleFlashcards: Flashcard[] = [
  {
    id: '1',
    front: 'What is a closure in JavaScript?',
    back: 'A closure is the combination of a function and the lexical environment within which that function was declared. This environment consists of any local variables that were in-scope at the time the closure was created.\n\n```javascript\nfunction createCounter() {\n  let count = 0;\n  return function() {\n    return ++count;\n  }\n}\n```',
    deckId: '1',
    tags: ['javascript', 'closures'],
    createdAt: new Date(),
    lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    nextReview: new Date(),
    interval: 1,
    ease: 2.5,
  },
  {
    id: '2',
    front: 'What is the difference between `let`, `const`, and `var`?',
    back: '- `var`: Function-scoped, can be redeclared, hoisted\n- `let`: Block-scoped, cannot be redeclared, temporal dead zone\n- `const`: Block-scoped, cannot be reassigned or redeclared\n\n```javascript\nvar a = 1; // Function scoped\nlet b = 2; // Block scoped\nconst c = 3; // Block scoped, immutable\n```',
    deckId: '1',
    tags: ['javascript', 'variables'],
    createdAt: new Date(),
    nextReview: new Date(),
    interval: 1,
    ease: 2.5,
  },
  {
    id: '3',
    front: 'What is the event loop in JavaScript?',
    back: 'The event loop is a mechanism that allows JavaScript to perform non-blocking operations by offloading operations to the system kernel whenever possible.\n\nIt continuously checks the call stack and callback queue, moving callbacks to the call stack when it\'s empty.',
    deckId: '1',
    tags: ['javascript', 'async'],
    createdAt: new Date(),
    lastReviewed: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
    interval: 2,
    ease: 2.5,
  },
];

// Spaced repetition algorithm (simplified SM-2)
const calculateNextReview = (
  difficulty: 'again' | 'hard' | 'good' | 'easy',
  currentInterval: number = 1,
  currentEase: number = 2.5
): { interval: number; ease: number; nextReview: Date } => {
  let newInterval = currentInterval;
  let newEase = currentEase;

  switch (difficulty) {
    case 'again':
      newInterval = 1;
      newEase = Math.max(1.3, currentEase - 0.2);
      break;
    case 'hard':
      newInterval = Math.max(1, Math.floor(currentInterval * 1.2));
      newEase = Math.max(1.3, currentEase - 0.15);
      break;
    case 'good':
      newInterval = Math.floor(currentInterval * newEase);
      break;
    case 'easy':
      newInterval = Math.floor(currentInterval * newEase * 1.3);
      newEase = currentEase + 0.15;
      break;
  }

  const nextReview = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);
  
  return { interval: newInterval, ease: newEase, nextReview };
};

export const FlashcardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(sampleFlashcards);
  const [decks, setDecks] = useState<Deck[]>([sampleDeck]);

  const addFlashcard = useCallback((flashcardData: Omit<Flashcard, 'id' | 'createdAt'>) => {
    const newFlashcard: Flashcard = {
      ...flashcardData,
      id: Date.now().toString(),
      createdAt: new Date(),
      interval: 1,
      ease: 2.5,
      nextReview: new Date(),
    };
    setFlashcards(prev => [...prev, newFlashcard]);
    
    // Update deck card count
    setDecks(prev =>
      prev.map(deck =>
        deck.id === flashcardData.deckId
          ? { ...deck, totalCards: deck.totalCards + 1, dueCards: deck.dueCards + 1 }
          : deck
      )
    );
  }, []);

  const updateFlashcard = useCallback((id: string, flashcardUpdate: Partial<Flashcard>) => {
    setFlashcards(prev =>
      prev.map(flashcard =>
        flashcard.id === id ? { ...flashcard, ...flashcardUpdate } : flashcard
      )
    );
  }, []);

  const deleteFlashcard = useCallback((id: string) => {
    const flashcard = flashcards.find(f => f.id === id);
    if (flashcard) {
      setFlashcards(prev => prev.filter(f => f.id !== id));
      
      // Update deck card count
      setDecks(prev =>
        prev.map(deck =>
          deck.id === flashcard.deckId
            ? { ...deck, totalCards: Math.max(0, deck.totalCards - 1) }
            : deck
        )
      );
    }
  }, [flashcards]);

  const addDeck = useCallback((deckData: Omit<Deck, 'id' | 'totalCards' | 'dueCards'>) => {
    const newDeck: Deck = {
      ...deckData,
      id: Date.now().toString(),
      totalCards: 0,
      dueCards: 0,
    };
    setDecks(prev => [...prev, newDeck]);
  }, []);

  const updateDeck = useCallback((id: string, deckUpdate: Partial<Deck>) => {
    setDecks(prev =>
      prev.map(deck => (deck.id === id ? { ...deck, ...deckUpdate } : deck))
    );
  }, []);

  const deleteDeck = useCallback((id: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== id));
    setFlashcards(prev => prev.filter(flashcard => flashcard.deckId !== id));
  }, []);

  const getFlashcardsByDeck = useCallback(
    (deckId: string) => flashcards.filter(flashcard => flashcard.deckId === deckId),
    [flashcards]
  );

  const getDueFlashcards = useCallback(
    (deckId?: string) => {
      const now = new Date();
      let dueCards = flashcards.filter(
        flashcard => !flashcard.nextReview || flashcard.nextReview <= now
      );
      
      if (deckId) {
        dueCards = dueCards.filter(flashcard => flashcard.deckId === deckId);
      }
      
      return dueCards;
    },
    [flashcards]
  );

  const updateFlashcardReview = useCallback((id: string, difficulty: 'again' | 'hard' | 'good' | 'easy') => {
    setFlashcards(prev =>
      prev.map(flashcard => {
        if (flashcard.id === id) {
          const { interval, ease, nextReview } = calculateNextReview(
            difficulty,
            flashcard.interval,
            flashcard.ease
          );
          
          return {
            ...flashcard,
            lastReviewed: new Date(),
            nextReview,
            interval,
            ease,
          };
        }
        return flashcard;
      })
    );
  }, []);

  return (
    <FlashcardsContext.Provider
      value={{
        flashcards,
        decks,
        addFlashcard,
        updateFlashcard,
        deleteFlashcard,
        addDeck,
        updateDeck,
        deleteDeck,
        getFlashcardsByDeck,
        getDueFlashcards,
        updateFlashcardReview,
      }}>
      {children}
    </FlashcardsContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardsContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardsProvider');
  }
  return context;
};
