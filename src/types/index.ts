export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  createdAt: Date;
  updatedAt: Date;
  formatting?: {
    fontSize?: number;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
  };
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  tags: string[];
  createdAt: Date;
  lastReviewed?: Date;
  nextReview?: Date;
  interval?: number;
  ease?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Deck {
  id: string;
  title: string;
  description?: string;
  totalCards: number;
  dueCards: number;
  lastReviewed?: Date;
  tags?: string[];
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface QuizStats {
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  streak: number;
}
