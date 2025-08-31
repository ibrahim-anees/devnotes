import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { FlashcardsProvider, useFlashcards } from '../FlashcardsContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FlashcardsProvider>{children}</FlashcardsProvider>
);

describe('FlashcardsContext', () => {
  it('should provide initial state', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper });
    
    expect(result.current.flashcards).toHaveLength(3); // Sample flashcards
    expect(result.current.decks).toHaveLength(1); // Sample deck
    expect(result.current.decks[0].title).toBe('JavaScript Fundamentals');
  });

  it('should add a new flashcard', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper });
    
    const newFlashcard = {
      front: 'What is React?',
      back: 'A JavaScript library for building user interfaces',
      deckId: result.current.decks[0].id,
      tags: ['react'],
    };

    act(() => {
      result.current.addFlashcard(newFlashcard);
    });

    expect(result.current.flashcards).toHaveLength(4);
    expect(result.current.flashcards[3].front).toBe('What is React?');
  });

  it('should update a flashcard', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper });
    
    const flashcardId = result.current.flashcards[0].id;
    const updatedData = {
      front: 'Updated question',
      back: 'Updated answer',
    };

    act(() => {
      result.current.updateFlashcard(flashcardId, updatedData);
    });

    const updatedFlashcard = result.current.flashcards.find(card => card.id === flashcardId);
    expect(updatedFlashcard?.front).toBe('Updated question');
    expect(updatedFlashcard?.back).toBe('Updated answer');
  });

  it('should delete a flashcard', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper });
    
    const initialLength = result.current.flashcards.length;
    const flashcardId = result.current.flashcards[0].id;

    act(() => {
      result.current.deleteFlashcard(flashcardId);
    });

    expect(result.current.flashcards).toHaveLength(initialLength - 1);
    expect(result.current.flashcards.find(card => card.id === flashcardId)).toBeUndefined();
  });

  it('should add a new deck', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper });
    
    const newDeck = {
      title: 'React Fundamentals',
      description: 'Learn React basics',
    };

    act(() => {
      result.current.addDeck(newDeck);
    });

    expect(result.current.decks).toHaveLength(2);
    expect(result.current.decks[1].title).toBe('React Fundamentals');
  });

  it('should get flashcards by deck', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper });
    
    const deckId = result.current.decks[0].id;
    const deckFlashcards = result.current.getFlashcardsByDeck(deckId);
    
    expect(deckFlashcards).toHaveLength(3);
    expect(deckFlashcards.every(card => card.deckId === deckId)).toBe(true);
  });

  it('should get due flashcards', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper });
    
    const dueCards = result.current.getDueFlashcards();
    expect(dueCards.length).toBeGreaterThan(0);
  });

  it('should update flashcard review with spaced repetition', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper });
    
    const flashcardId = result.current.flashcards[0].id;
    const originalInterval = result.current.flashcards[0].interval;

    act(() => {
      result.current.updateFlashcardReview(flashcardId, 'good');
    });

    const updatedFlashcard = result.current.flashcards.find(card => card.id === flashcardId);
    expect(updatedFlashcard?.lastReviewed).toBeDefined();
    expect(updatedFlashcard?.nextReview).toBeDefined();
    expect(updatedFlashcard?.interval).toBeGreaterThan(originalInterval || 1);
  });

  it('should handle different difficulty levels in spaced repetition', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper });
    
    const flashcardId = result.current.flashcards[0].id;

    // Test 'again' difficulty (should reset interval to 1)
    act(() => {
      result.current.updateFlashcardReview(flashcardId, 'again');
    });

    let updatedFlashcard = result.current.flashcards.find(card => card.id === flashcardId);
    expect(updatedFlashcard?.interval).toBe(1);

    // Test 'easy' difficulty (should increase interval more)
    act(() => {
      result.current.updateFlashcardReview(flashcardId, 'easy');
    });

    updatedFlashcard = result.current.flashcards.find(card => card.id === flashcardId);
    expect(updatedFlashcard?.interval).toBeGreaterThan(1);
  });
});
