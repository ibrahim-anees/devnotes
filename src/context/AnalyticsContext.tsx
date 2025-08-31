import React, { createContext, useContext, useState, useCallback } from 'react';
import { useFlashcards } from './FlashcardsContext';
import { useNotes } from './NotesContext';

interface QuizSession {
  id: string;
  deckId: string;
  deckName: string;
  date: Date;
  totalCards: number;
  correctAnswers: number;
  score: number; // percentage
  timeSpent: number; // minutes
}

interface TopicStats {
  topic: string;
  totalCards: number;
  masteredCards: number;
  masteryPercentage: number;
  averageScore: number;
}

interface AnalyticsData {
  quizSessions: QuizSession[];
  dailyStreak: number;
  lastQuizDate: Date | null;
  totalReviews: number;
  overallMasteryPercentage: number;
  averageScore: number;
  bestScore: number;
  topicStats: TopicStats[];
}

interface AnalyticsContextType extends AnalyticsData {
  addQuizSession: (session: Omit<QuizSession, 'id'>) => void;
  getRecentSessions: (limit?: number) => QuizSession[];
  getWeeklyProgress: () => { date: string; reviews: number; score: number }[];
  getDailyProgress: () => { date: string; reviews: number; score: number }[];
  calculateStreaks: () => number;
  getTopicBreakdown: () => TopicStats[];
  getLastQuizInfo: () => QuizSession | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Sample quiz sessions for demo
const sampleQuizSessions: QuizSession[] = [
  {
    id: '1',
    deckId: '1',
    deckName: 'JavaScript Fundamentals',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    totalCards: 10,
    correctAnswers: 8,
    score: 80,
    timeSpent: 15,
  },
  {
    id: '2',
    deckId: '1',
    deckName: 'JavaScript Fundamentals',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    totalCards: 8,
    correctAnswers: 7,
    score: 87.5,
    timeSpent: 12,
  },
  {
    id: '3',
    deckId: '1',
    deckName: 'JavaScript Fundamentals',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    totalCards: 12,
    correctAnswers: 9,
    score: 75,
    timeSpent: 18,
  },
  {
    id: '4',
    deckId: '1',
    deckName: 'JavaScript Fundamentals',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    totalCards: 15,
    correctAnswers: 13,
    score: 86.7,
    timeSpent: 22,
  },
  {
    id: '5',
    deckId: '1',
    deckName: 'JavaScript Fundamentals',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    totalCards: 6,
    correctAnswers: 6,
    score: 100,
    timeSpent: 8,
  },
];

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>(sampleQuizSessions);
  const { flashcards, decks } = useFlashcards();
  const { notes } = useNotes();

  const addQuizSession = useCallback((sessionData: Omit<QuizSession, 'id'>) => {
    const newSession: QuizSession = {
      ...sessionData,
      id: Date.now().toString(),
    };
    setQuizSessions(prev => [newSession, ...prev]);
  }, []);

  const getRecentSessions = useCallback((limit = 5) => {
    return quizSessions.slice(0, limit);
  }, [quizSessions]);

  const getWeeklyProgress = useCallback(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(dateStr => {
      const sessionsOnDate = quizSessions.filter(session => 
        session.date.toISOString().split('T')[0] === dateStr
      );
      
      const reviews = sessionsOnDate.reduce((sum, session) => sum + session.totalCards, 0);
      const avgScore = sessionsOnDate.length > 0 
        ? sessionsOnDate.reduce((sum, session) => sum + session.score, 0) / sessionsOnDate.length 
        : 0;

      return {
        date: dateStr,
        reviews,
        score: Math.round(avgScore),
      };
    });
  }, [quizSessions]);

  const getDailyProgress = useCallback(() => {
    return getWeeklyProgress();
  }, [getWeeklyProgress]);

  const calculateStreaks = useCallback(() => {
    if (quizSessions.length === 0) return 0;

    const sortedSessions = [...quizSessions].sort((a, b) => b.date.getTime() - a.date.getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);

      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }, [quizSessions]);

  const getTopicBreakdown = useCallback((): TopicStats[] => {
    const topicMap = new Map<string, { total: number; mastered: number; scores: number[] }>();

    // Analyze flashcards by tags
    flashcards.forEach(card => {
      card.tags.forEach(tag => {
        if (!topicMap.has(tag)) {
          topicMap.set(tag, { total: 0, mastered: 0, scores: [] });
        }
        const topic = topicMap.get(tag)!;
        topic.total++;
        
        // Consider a card mastered if it has been reviewed and has a good interval
        if (card.lastReviewed && card.interval && card.interval > 1) {
          topic.mastered++;
        }
      });
    });

    // Add scores from quiz sessions
    quizSessions.forEach(session => {
      const deck = decks.find(d => d.id === session.deckId);
      if (deck) {
        const deckCards = flashcards.filter(card => card.deckId === deck.id);
        const deckTags = [...new Set(deckCards.flatMap(card => card.tags))];
        
        deckTags.forEach(tag => {
          if (topicMap.has(tag)) {
            topicMap.get(tag)!.scores.push(session.score);
          }
        });
      }
    });

    return Array.from(topicMap.entries()).map(([topic, data]) => ({
      topic,
      totalCards: data.total,
      masteredCards: data.mastered,
      masteryPercentage: data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0,
      averageScore: data.scores.length > 0 
        ? Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length)
        : 0,
    })).sort((a, b) => b.totalCards - a.totalCards);
  }, [flashcards, decks, quizSessions]);

  const getLastQuizInfo = useCallback(() => {
    return quizSessions.length > 0 ? quizSessions[0] : null;
  }, [quizSessions]);

  // Calculate derived analytics
  const dailyStreak = calculateStreaks();
  const lastQuizDate = quizSessions.length > 0 ? quizSessions[0].date : null;
  const totalReviews = quizSessions.reduce((sum, session) => sum + session.totalCards, 0);
  
  const overallMasteryPercentage = flashcards.length > 0 
    ? Math.round((flashcards.filter(card => card.lastReviewed && card.interval && card.interval > 1).length / flashcards.length) * 100)
    : 0;
    
  const averageScore = quizSessions.length > 0 
    ? Math.round(quizSessions.reduce((sum, session) => sum + session.score, 0) / quizSessions.length)
    : 0;
    
  const bestScore = quizSessions.length > 0 
    ? Math.max(...quizSessions.map(session => session.score))
    : 0;
    
  const topicStats = getTopicBreakdown();

  return (
    <AnalyticsContext.Provider
      value={{
        quizSessions,
        dailyStreak,
        lastQuizDate,
        totalReviews,
        overallMasteryPercentage,
        averageScore,
        bestScore,
        topicStats,
        addQuizSession,
        getRecentSessions,
        getWeeklyProgress,
        getDailyProgress,
        calculateStreaks,
        getTopicBreakdown,
        getLastQuizInfo,
      }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
